// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { pairCore } from './core';
import { decryptBytes, encryptBytes, fromHex, randomBytes, sha256Bytes, toHex, utf8Decode, utf8Encode } from './crypto';

// Near me, on New chat (components/near-me.tsx): two Erevos phones beside each other, both with
// that screen open, become contacts with nothing typed, scanned or sent through the internet. They
// find each other on the links to phones nearby (lib/radio.ts: Bluetooth, Wi-Fi Aware, the same
// Wi-Fi), agree on a key, and each shows six pictures made from it. The owners look at both
// screens: the same pictures on both means the two phones talk to each other and to no one in
// between, and once both say so, each gives the other its contact link, encrypted with that key.
//
// Text frames on a link, `EVP1:` and JSON, which lib/nearby.ts and an older Erevos leave alone:
//   {v:1, t:'hello', n}             here, with this screen open: `n` 16 random bytes, new each time it opens
//   {v:1, t:'commit', n, to, c}     from the one with the lower `n`: the hash of its share, kept back
//   {v:1, t:'share', n, to, c, y}   from the other: its share, in the open
//   {v:1, t:'open', n, to, c, y}    from the first: its share, which must be the one it gave the hash of
//   {v:1, t:'yes', n, to, c, b}     its owner said the pictures are the same: its contact link and the
//                                   name it gives itself, encrypted with the key
//   {v:1, t:'got', n, to, c}        that yes came
//   {v:1, t:'no', n, to, c}         its owner said they are not, or took the yes back: a yes before it counts no more
//   {v:1, t:'bye', n}               the screen closed
// `n` is who says it, `to` whom it is for, and `c` which pairing of the two it belongs to: the
// first one's hash. The shares are those of the pairing by a code (crates/erevos-core/src/cpace.rs)
// with a code everyone knows, which makes it a plain key agreement: the pictures, not a code, are
// what keeps a third phone out.
//
// Why the hash first. The pictures say only 36 bits of the key, so a phone in between that could
// choose its share after seeing the other's would try shares at home until both sides showed the
// same pictures. As it is, whoever goes first is held to a share by its hash before it sees the
// other's, and whoever goes second gives its share before the first is opened: neither can aim.
// For the same reason a share is used for one pairing only: when the other side begins again (it
// forgot the pairing as a link went down), so does this one, with a share no one has seen.
//
// What is left to one in between. Whoever goes first knows the key before it opens its share, and
// may leave that pairing there and begin another: a try the other phone shows nothing of. So the
// tries are counted where they cost: a phone makes no more than NEAR_EVER shares while the screen
// stays open, each good for one key, and keeps no more than NEAR_MOST pairings at once. Each new
// key on one side can be held against the NEAR_MOST kept on the other at most, which is
// 2 x NEAR_EVER x NEAR_MOST pairs of keys, 640, for 2^36 sets of pictures: about one in a hundred
// million that both owners are shown the same six by a phone between them, as hard as guessing a
// code of 8 digits in one try. With four pictures it would be one in twenty-six thousand.
//
// Nothing that names the owner goes before its yes: until then a phone nearby learns only that an
// Erevos has this screen open. A link may drop a frame as it goes down, so each `hello` heard is
// answered with whatever the other may still wait for. Self-contained but for the core, so it runs
// under plain Node for the checks.

/** How a frame of these starts. */
export const NEAR_PREFIX = 'EVP1:';
/** How many pictures both phones show: 6 bits each. Fewer would not do (see above). */
export const NEAR_PICTURES = 6;
/** How often a phone says it is here, milliseconds. */
export const NEAR_HELLO = 3000;
/** A phone not heard for this long is no longer there. */
export const NEAR_GONE = 12_000;
/** Phones a screen pairs with at once, at most. */
export const NEAR_MOST = 8;
/** Shares a screen makes while it stays open, at most: each one is a key someone may hold against another's pictures. */
export const NEAR_EVER = 40;
/** How long a screen that closed still answers, so a yes on its way arrives. */
export const NEAR_LINGER = 10_000;
/** Pairings from one link at once, at most: one phone is one link, with one screen. */
const PER_LINK = 3;
/** The longest contact link, and name, that go. */
const LINK_MOST = 6 * 1024;
const NAME_MOST = 64;
// A yes's box, in hex: the link, the name (as JSON writes its letters, six for one at most), and what encrypting adds.
const BOX_MOST = 2 * (LINK_MOST + 6 * NAME_MOST + 64);

const VERSION = 1;
const CODE = utf8Encode('erevos near v1');
const CHANNEL = utf8Encode('erevos near v1 channel');
const HEX32 = /^[0-9a-f]{64}$/;
const HEX16 = /^[0-9a-f]{32}$/;
const HEX = /^(?:[0-9a-f]{2})+$/;

// A hash of a label and parts, each part with its length before it, so no two lists make the same bytes.
function hashOf(label: string, ...parts: Uint8Array[]): Uint8Array {
  const bytes: number[] = [...utf8Encode(label), 0];
  for (const part of parts) bytes.push(part.length >> 8, part.length & 0xff, ...part);
  return sha256Bytes(Uint8Array.from(bytes));
}

/** The id two phones' pairings have, for their `n`, the lower first: the same on both. */
export function nearSession(low: string, high: string): Uint8Array {
  return hashOf('erevos near v1 session', fromHex(low), fromHex(high)).slice(0, 16);
}

/** The hash that holds the first phone to its share. */
export function nearCommit(session: Uint8Array, share: string): string {
  return toHex(hashOf('erevos near v1 commit', session, fromHex(share)));
}

/** The pictures for a key: NEAR_PICTURES numbers from 0 to 63 (lib/sas-emoji.ts). */
export function nearPictures(key: Uint8Array): number[] {
  // One byte of the hash for each, its low 6 bits: every picture as likely as any other.
  const digest = hashOf('erevos near v1 pictures', key);
  return Array.from({ length: NEAR_PICTURES }, (_, n) => digest[n] & 63);
}

// The key a side's contact link is encrypted with, from the shared key.
const boxKey = (key: Uint8Array, low: boolean) => hashOf(low ? 'erevos near v1 box low' : 'erevos near v1 box high', key);

export type NearMessage =
  | { t: 'hello'; n: string }
  | { t: 'bye'; n: string }
  | { t: 'commit'; n: string; to: string; c: string }
  | { t: 'share'; n: string; to: string; c: string; y: string }
  | { t: 'open'; n: string; to: string; c: string; y: string }
  | { t: 'yes'; n: string; to: string; c: string; b: string }
  | { t: 'got'; n: string; to: string; c: string }
  | { t: 'no'; n: string; to: string; c: string };

/** A message as the frame that carries it. */
export function nearFrame(message: NearMessage): string {
  return `${NEAR_PREFIX}${JSON.stringify({ v: VERSION, ...message })}`;
}

/** The message a frame carries, or null when it is not one of these, or not in shape. */
export function readNear(frame: string): NearMessage | null {
  if (!frame.startsWith(NEAR_PREFIX) || frame.length > BOX_MOST + 512) return null;
  let v: Record<string, unknown>;
  try {
    v = JSON.parse(frame.slice(NEAR_PREFIX.length)) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!v || typeof v !== 'object' || v.v !== VERSION || typeof v.n !== 'string' || !HEX16.test(v.n)) return null;
  const n = v.n;
  if (v.t === 'hello' || v.t === 'bye') return { t: v.t, n };
  const hex32 = (x: unknown): x is string => typeof x === 'string' && HEX32.test(x);
  if (typeof v.to !== 'string' || !HEX16.test(v.to) || v.to === n || !hex32(v.c)) return null;
  const [to, c] = [v.to, v.c];
  if (v.t === 'commit') return { t: 'commit', n, to, c };
  if ((v.t === 'share' || v.t === 'open') && hex32(v.y)) return { t: v.t, n, to, c, y: v.y };
  if (v.t === 'yes' && typeof v.b === 'string' && HEX.test(v.b) && v.b.length <= BOX_MOST) return { t: 'yes', n, to, c, b: v.b };
  if (v.t === 'got' || v.t === 'no') return { t: v.t, n, to, c };
  return null;
}

/** Sends a text frame on a link (sendLink of lib/radio.ts). False when the link is not up. */
export type NearSend = (link: string, text: string) => boolean;

/** What a phone gives once both owners said yes: its contact link, and the name it gives itself, or none. */
export type NearEnd = { link: string; name: string };

/** A phone found, with the pictures to compare with those on its own screen. */
export type NearFound = {
  /** Names this pairing: another, with other pictures, has another. */
  id: string;
  pictures: number[];
  /** This phone's owner said yes, and the other's answer is awaited. */
  waiting: boolean;
  /** The other phone's owner said no after this one's yes. */
  refused: boolean;
  /** Set aside here with No, others. */
  aside: boolean;
};

type Session = {
  peer: string;
  session: Uint8Array;
  /** Whether this phone goes first: the one with the lower `n`. */
  low: boolean;
  /** The links it was heard on, the last one first. */
  links: string[];
  heard: number;
  made: number;
  secret: Uint8Array;
  share: string;
  /** The first phone's hash, which names the pairing: its own when it goes first, else the other's once it came. */
  commit: string | null;
  theirs: string | null;
  key: Uint8Array | null;
  pictures: number[] | null;
  said: boolean;
  /** This phone's yes as sent, sent again until the other says it came. */
  yes: string | null;
  came: boolean;
  /** The other phone's yes, opened. */
  box: NearEnd | null;
  aside: boolean;
  refused: boolean;
  done: boolean;
};

type Options = {
  send: NearSend;
  /** This phone's contact link and the name it gives itself, asked for when its owner says yes. */
  own: () => NearEnd;
  /** Something of `found`, `linked` or `spent` changed. */
  onChange?: () => void;
  /** Both owners said yes: the other phone's contact link and name. */
  onDone: (end: NearEnd) => void;
  /** For the checks: the time, and this phone's `n`. */
  now?: () => number;
  nonce?: string;
};

/** One opening of Near me. `start` it, hand it the links and what comes on them, and `stop` it as the screen closes. */
export class NearPair {
  readonly me: string;
  private readonly send: NearSend;
  private readonly own: () => NearEnd;
  private readonly onChange: () => void;
  private readonly onDone: (end: NearEnd) => void;
  private readonly now: () => number;
  private readonly links = new Set<string>();
  private readonly sessions = new Map<string, Session>();
  // Those that sent what is no share at all.
  private readonly refusedFor = new Set<string>();
  private ever = 0;
  private made = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private closing = false;
  private closed = false;
  private closeBy = 0;
  private whenClosed: (() => void) | null = null;
  // What comes is taken one after the other: the core answers later, and two answers must not cross.
  private work: Promise<void> = Promise.resolve();

  constructor(options: Options) {
    this.send = options.send;
    this.own = options.own;
    this.onChange = options.onChange ?? (() => undefined);
    this.onDone = options.onDone;
    this.now = options.now ?? Date.now;
    this.me = options.nonce ?? toHex(randomBytes(16));
  }

  /** Says hello on the links up, and again every NEAR_HELLO. */
  start(): void {
    if (this.timer || this.closed) return;
    this.timer = setInterval(() => this.tick(), NEAR_HELLO);
    this.tick();
  }

  /** A data link to a phone nearby is up: it hears at once that this screen is open. */
  linkUp(link: string): void {
    if (this.closed || this.closing || this.links.has(link)) return;
    this.links.add(link);
    this.put(link, { t: 'hello', n: this.me });
    this.onChange();
  }

  /** How many phones nearby are linked, whether or not they show this screen. */
  linked(): number {
    return this.links.size;
  }

  /** Whether this opening made all the shares it may: close the screen and open it again for more. */
  spent(): boolean {
    return this.ever >= NEAR_EVER;
  }

  /** The phones found, those set aside last, each in the order it was found. */
  found(): NearFound[] {
    return [...this.sessions.values()]
      .filter((session) => session.pictures && session.commit && !session.done)
      .sort((a, b) => Number(a.aside) - Number(b.aside) || a.made - b.made)
      .map((session) => ({ id: session.commit!, pictures: session.pictures!, waiting: session.said, refused: session.refused, aside: session.aside }));
  }

  private byId(id: string): Session | null {
    for (const session of this.sessions.values()) if (session.commit === id && session.key) return session;
    return null;
  }

  /** The owner says the pictures of `id` are the same on both phones: this phone's link goes to it, and theirs is awaited. */
  yes(id: string): void {
    this.queue(async () => {
      const session = this.byId(id);
      if (!session?.key || session.said || session.done || this.closing) return;
      const own = this.own();
      if (!own.link || own.link.length > LINK_MOST) return;
      const text = JSON.stringify({ l: own.link, n: own.name.slice(0, NAME_MOST) });
      session.said = true;
      session.refused = false;
      session.aside = false;
      session.came = false;
      session.yes = nearFrame({ t: 'yes', n: this.me, to: session.peer, c: id, b: toHex(encryptBytes(boxKey(session.key, session.low), utf8Encode(text))) });
      this.tell(session, session.yes);
      if (session.box) this.finish(session);
      else this.onChange();
    });
  }

  /** The owner says the pictures of `id` are not the same (`aside`), or takes a yes back: the other phone is told, and waits no more. */
  no(id: string, aside = true): void {
    this.queue(async () => {
      const session = this.byId(id);
      if (!session || session.done) return;
      session.said = false;
      session.yes = null;
      session.came = false;
      session.refused = false;
      if (aside) session.aside = true;
      this.tell(session, { t: 'no', n: this.me, to: session.peer, c: id });
      this.onChange();
    });
  }

  /** Those set aside show again. */
  again(): void {
    for (const session of this.sessions.values()) session.aside = false;
    this.onChange();
  }

  /** A frame from a link. False when it is not one of these. */
  frameIn(link: string, text: string): boolean {
    if (!text.startsWith(NEAR_PREFIX)) return false;
    const message = readNear(text);
    if (message && !this.closed) this.queue(() => this.take(link, message));
    return true;
  }

  /** Once all that came so far is dealt with: for the checks. */
  idle(): Promise<void> {
    return this.work;
  }

  /** What time does: a hello on every link, and those not heard for long forgotten. */
  tick(): void {
    if (this.closed) return;
    const now = this.now();
    if (this.closing) {
      // Only a yes still on its way keeps it open.
      const owed = this.owed();
      if (owed.length === 0 || now >= this.closeBy) return this.close();
      for (const session of owed) this.tell(session, session.yes!);
      return;
    }
    let changed = false;
    for (const [peer, session] of this.sessions) {
      if (session.done || now - session.heard < NEAR_GONE) continue;
      this.sessions.delete(peer);
      changed = changed || !!session.pictures;
    }
    for (const link of [...this.links]) this.put(link, { t: 'hello', n: this.me });
    if (changed) this.onChange();
  }

  /**
   * The screen closes: the phones nearby are told, and nothing new is taken. Done once nothing is
   * owed: a yes of this phone that the other did not say it got keeps it answering a little longer.
   */
  stop(): Promise<void> {
    if (this.closed) return Promise.resolve();
    return new Promise((resolve) => {
      const was = this.whenClosed;
      this.whenClosed = () => {
        was?.();
        resolve();
      };
      if (was) return;
      this.queue(async () => {
        this.closing = true;
        this.closeBy = this.now() + NEAR_LINGER;
        for (const link of [...this.links]) this.put(link, { t: 'bye', n: this.me });
        for (const [peer, session] of this.sessions) if (!session.done) this.sessions.delete(peer);
        if (!this.timer) this.timer = setInterval(() => this.tick(), NEAR_HELLO);
        this.tick();
      });
    });
  }

  private owed(): Session[] {
    return [...this.sessions.values()].filter((session) => session.done && session.yes && !session.came);
  }

  private close(): void {
    if (this.closed) return;
    this.closed = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.sessions.clear();
    this.links.clear();
    const done = this.whenClosed;
    this.whenClosed = null;
    done?.();
  }

  private queue(work: () => Promise<void>): void {
    this.work = this.work.then(work).catch(() => undefined);
  }

  private put(link: string, message: NearMessage | string): boolean {
    if (this.send(link, typeof message === 'string' ? message : nearFrame(message))) return true;
    this.links.delete(link);
    return false;
  }

  // To the phone of a pairing, on the link it was last heard on, or the next that takes it.
  private tell(session: Session, message: NearMessage | string): void {
    for (const link of [...session.links]) {
      if (this.put(link, message)) return;
      session.links = session.links.filter((other) => other !== link);
    }
  }

  private finish(session: Session): void {
    if (session.done || !session.box) return;
    session.done = true;
    this.onDone(session.box);
    this.onChange();
  }

  // A new share, with its secret: null once this opening made all it may.
  private async fresh(session: Uint8Array): Promise<{ secret: Uint8Array; share: string } | null> {
    if (this.ever >= NEAR_EVER) return null;
    this.ever += 1;
    const both = await pairCore().pairStart(CODE, CHANNEL, session);
    return { secret: both.slice(0, 32), share: toHex(both.slice(32)) };
  }

  private async open(peer: string, link: string): Promise<Session | null> {
    if (this.closing || this.refusedFor.has(peer)) return null;
    const live = [...this.sessions.values()].filter((session) => !session.done);
    if (live.length >= NEAR_MOST || live.filter((session) => session.links.includes(link)).length >= PER_LINK) return null;
    const low = this.me < peer;
    const id = low ? nearSession(this.me, peer) : nearSession(peer, this.me);
    const made = await this.fresh(id);
    if (!made) {
      this.onChange();
      return null;
    }
    if (this.closing || this.closed) return null;
    const session: Session = {
      peer,
      session: id,
      low,
      links: [link],
      heard: this.now(),
      made: this.made++,
      secret: made.secret,
      share: made.share,
      commit: low ? nearCommit(id, made.share) : null,
      theirs: null,
      key: null,
      pictures: null,
      said: false,
      yes: null,
      came: false,
      box: null,
      aside: false,
      refused: false,
      done: false,
    };
    this.sessions.set(peer, session);
    return session;
  }

  // The pairing begins again, as the other side's did: with a share no one has seen, and nothing
  // of the one before, whose pictures show no more. `commit`: the other's new hash, when it goes first.
  private async renew(session: Session, commit: string | null): Promise<boolean> {
    const shown = !!session.pictures;
    const made = await this.fresh(session.session);
    if (!made || this.closing || this.closed) {
      this.sessions.delete(session.peer);
      if (shown || !made) this.onChange();
      return false;
    }
    Object.assign(session, {
      secret: made.secret,
      share: made.share,
      commit: session.low ? nearCommit(session.session, made.share) : commit,
      made: this.made++,
      theirs: null,
      key: null,
      pictures: null,
      said: false,
      yes: null,
      came: false,
      box: null,
      aside: false,
      refused: false,
    });
    if (shown) this.onChange();
    return true;
  }

  // Both shares in hand: the key, and its pictures. False when theirs is no share.
  private async agree(session: Session): Promise<boolean> {
    const [first, second] = session.low ? [session.share, session.theirs!] : [session.theirs!, session.share];
    try {
      session.key = await pairCore().pairFinish(session.secret, session.session, fromHex(first), fromHex(second), Uint8Array.of(session.low ? 1 : 0));
    } catch {
      // Not a share at all: no phone with Erevos sends that. Not paired with again while this screen stays open.
      this.sessions.delete(session.peer);
      this.refusedFor.add(session.peer);
      return false;
    }
    session.pictures = nearPictures(session.key);
    this.onChange();
    return true;
  }

  private async take(link: string, message: NearMessage): Promise<void> {
    if (this.closed || message.n === this.me) return;
    if (message.t !== 'hello' && message.t !== 'bye' && message.to !== this.me) return;
    let session = this.sessions.get(message.n) ?? null;
    if (message.t === 'bye') {
      // One that said yes here waits for theirs a while yet: it may be on its way.
      if (session && !session.said && !session.done) {
        this.sessions.delete(message.n);
        if (session.pictures) this.onChange();
      }
      return;
    }
    if (!session) {
      // Only what starts a pairing makes one: a hello, or the hash of one that heard ours first.
      if (message.t !== 'hello' && message.t !== 'commit') return;
      session = await this.open(message.n, link);
      if (!session) return;
    }
    session.heard = this.now();
    session.links = [link, ...session.links.filter((other) => other !== link)];
    if (!this.closing && !this.links.has(link)) {
      this.links.add(link);
      this.onChange();
    }
    const { peer } = session;
    if (session.done) {
      // Done here: only its yes may still be owed, and theirs answered.
      if (message.t === 'got' && message.c === session.commit) {
        session.came = true;
        if (this.closing && this.owed().length === 0) this.close();
      } else if (message.t === 'yes' && message.c === session.commit) this.tell(session, { t: 'got', n: this.me, to: peer, c: message.c });
      else if (message.t === 'hello' && session.yes && !session.came) this.tell(session, session.yes);
      return;
    }
    switch (message.t) {
      case 'hello':
        // Whatever the other may still wait for goes again: a frame may have gone down with a link,
        // or the other may have forgotten this pairing, and then the hash starts it anew there.
        if (session.low) this.tell(session, { t: 'commit', n: this.me, to: peer, c: session.commit! });
        else if (session.commit && !session.key) this.tell(session, { t: 'share', n: this.me, to: peer, c: session.commit, y: session.share });
        if (session.yes && !session.came) this.tell(session, session.yes);
        return;
      case 'commit':
        if (session.low) return;
        if (session.commit === message.c) {
          if (!session.key) this.tell(session, { t: 'share', n: this.me, to: peer, c: message.c, y: session.share });
          return;
        }
        // Another hash than the one before: the other began again. The share it has seen is used no more.
        if (session.commit !== null && !(await this.renew(session, message.c))) return;
        session.commit = message.c;
        this.tell(session, { t: 'share', n: this.me, to: peer, c: message.c, y: session.share });
        return;
      case 'share':
        if (!session.low || message.c !== session.commit) return;
        if (session.theirs && session.theirs !== message.y) {
          // Another share for the same hash: the other began again, and has seen this one's share.
          if (await this.renew(session, null)) this.tell(session, { t: 'commit', n: this.me, to: peer, c: session.commit! });
          return;
        }
        if (!session.theirs) {
          session.theirs = message.y;
          if (!(await this.agree(session))) return;
        }
        this.tell(session, { t: 'open', n: this.me, to: peer, c: session.commit!, y: session.share });
        return;
      case 'open':
        if (session.low || session.key || message.c !== session.commit) return;
        // Not the share it gave the hash of: not taken, and the pairing stays where it was.
        if (nearCommit(session.session, message.y) !== session.commit) return;
        session.theirs = message.y;
        await this.agree(session);
        return;
      case 'yes': {
        if (!session.key || message.c !== session.commit) return;
        let box: NearEnd | null = null;
        try {
          const read = JSON.parse(utf8Decode(decryptBytes(boxKey(session.key, !session.low), fromHex(message.b)))) as { l?: unknown; n?: unknown };
          if (typeof read.l === 'string' && read.l.length > 0 && read.l.length <= LINK_MOST) box = { link: read.l, name: typeof read.n === 'string' ? read.n.slice(0, NAME_MOST) : '' };
        } catch {
          // Not encrypted with this pairing's key.
        }
        if (!box) return;
        this.tell(session, { t: 'got', n: this.me, to: peer, c: message.c });
        session.box = box;
        if (session.said) this.finish(session);
        return;
      }
      case 'got':
        if (message.c === session.commit) session.came = true;
        return;
      case 'no':
        if (message.c !== session.commit) return;
        session.box = null;
        if (session.said) {
          session.said = false;
          session.yes = null;
          session.came = false;
          session.refused = true;
          this.onChange();
        }
        return;
    }
  }
}
