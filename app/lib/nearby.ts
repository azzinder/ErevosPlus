// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { fromBase64, randomBytes, sha256Bytes, toBase64, toHex } from './crypto';
import { t } from './i18n';
import type { Mark } from './relay';
import { fitsSms } from './sms-packets';

// Messages to and from contacts over the nearby radio link (modules/erevos-radio): Wi-Fi Aware or
// Bluetooth, phone to phone, with no internet. They are the same end-to-end encrypted packets as
// through the relay (lib/e2e.ts), so a phone nearby, a contact's or a stranger's, gets only bytes
// it cannot open unless they are for it. A packet does not say who it is for. Until a contact is
// heard on a link, the small packets for them go to every phone linked nearby, and each phone tries
// them in the open space's chats. Once one opens, the link it came on is that contact's, and what
// goes to them goes on it only. A voice message's parts go only to a contact heard nearby.
//
// Each packet also goes through the relay when there is one, so nothing is lost on a link that
// dropped. Whichever copy comes second does not open again (lib/e2e.ts), so nothing shows twice.
//
// A packet that opens in none of the open chats is kept in memory a while, for the other spaces
// as they open; none of it is written to the phone. The radio carries text frames of up to 16 KB,
// so a packet goes as base64, in pieces when it is long.
//
// Carried messages: when the relay cannot be reached and the contact is not near, what went to the
// phones nearby also goes sealed for the contact's relay (relaySeal in lib/core.ts), in frames of
// its own. A phone that takes it keeps it in memory, three days at most, passes it on to the phones
// it links with later (two more at most), and hands it to that relay through its own relay once it
// can (carryTo in lib/relay.ts). It cannot open it, nor tell who it is from or for: it sees only
// the relay's address. The phone that sent it keeps it too, and hands it over itself the same way.
// Carrying for others is on unless the owner turns it off, and only for relays on the internet
// over TLS (isCarriable): a stranger nearby never has this phone, or its relay, reach a relay on a
// local network or on the phone itself.
//
// The bridge, the other way: a phone with no internet has a phone beside it that has internet, and
// carries for others, read its queue on its relay (readForOthers in lib/relay.ts). It passes the
// relay requests themselves, a take or an acknowledgement of one queue on the relay's `/read`
// path, with no token, and gets back the relay's replies as they are. Only to the relay the phone
// in the middle uses itself, which knows its address already, and never while its space goes
// through Tor: a stranger nearby never has it reach a relay of his choosing. The phone in the
// middle learns the queue's id, and when it is read; never what the messages hold. Knowing the id,
// it could take them from the relay before they come, from anywhere, so the queue moves once the
// phone that asked reaches its relay again (lib/queue-move.ts `bridged`). The owner is asked once
// for each phone, a contact's too, as a stranger can pass on a contact's packets (lib/bridge.ts);
// the answer holds for hidden chats as well, while the phones stay linked. Never slow links.

// Slow links: a LoRa radio (lib/lora.ts) reaches phones kilometres away, but a few hundred bytes
// take seconds on the air, and the law allows a radio only so much air time. So a slow link is the
// last way: it takes a message only when the relay and the other links did not, only small ones
// (text and deletes, not voice), and nothing carried for others.
//
// SMS: after all of these, and only for a contact whose phone number is linked and only when the
// owner turned it on (lib/sms-way.ts), a text or a delete goes in data SMS (lib/sms-packets.ts),
// the same encrypted packets. It costs what SMS cost, and the phone company sees who wrote to whom
// and when, so it is off unless turned on.
//
// Hidden chats (lib/place-nearby.ts) use the same links, their packets the same as the space's,
// spread and sent as the space's are, so nothing on the air tells them apart. But what they hear is
// their own (NearHeard): the link each of their contacts was heard on is kept apart from the
// space's, in memory only while the place is open or receives, so the space never learns that a
// hidden contact is near, nor sends anything of theirs. They never carry, nor use LoRa or SMS.

/**
 * How a message went: to the contact's phone nearby, through the relay, or to the phones nearby,
 * not knowing whether theirs is one; carried, when they also took it to hand to the contact's relay;
 * over LoRa, when only a slow link took it; by SMS, when nothing else did.
 */
export type Delivery = 'nearby' | 'relay' | 'nostr' | 'spread' | 'carried' | 'lora' | 'sms';

/** What a packet that came by SMS is said to come on (lib/sms-way.ts), in place of a link nearby. */
export const SMS_LINK = 'sms';

/**
 * The SMS way to contacts (lib/sms-way.ts): `can`, whether it is on for a contact as far as known
 * now; `send`, sends a message's packets to them by SMS, false when it is not on for them after all.
 * Throws when the SMS did not go.
 */
export type SmsWay = { can(identity: string): boolean; send(identity: string, packets: Uint8Array[]): Promise<boolean> };

/** A packet sealed for the contact's relay (relaySeal), to hand to the relay at `url` from wherever there is internet.
 *  `mark`: what it carries (lib/relay.ts, Mark), on this phone's own only, said as it hands them
 *  over; it never goes with what is passed on, and a phone carrying another's cannot know it. */
export type Carried = { url: string; sealed: Uint8Array; mark?: Mark };

/** Whether a phone nearby may have this phone carry a message to this relay: one on the internet,
 *  over TLS (wss://), named or at a public address. A stranger's packet never sends this phone,
 *  or its relay, to a relay on this phone itself, on a local network or in plain text. */
export function isCarriable(url: string): boolean {
  const match = /^wss:\/\/(\[[^\]]*\]|[^/:?#\s]+)(:\d{1,5})?(\/[^\s]*)?$/i.exec(url.trim());
  if (!match) return false;
  const host = match[1].toLowerCase().replace(/\.$/, '');
  if (host.startsWith('[')) {
    const ip = host.slice(1, -1);
    // Loopback, unspecified, link-local, unique local, and IPv4 written as IPv6.
    return !/^(::1?|fe[89ab][0-9a-f]?:.*|f[cd][0-9a-f]{2}:.*|::ffff:.*|.*::)$/.test(ip) && ip.includes(':');
  }
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.lan') || host.endsWith('.home.arpa') || !host.includes('.')) return false;
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!v4) return true;
  const [a, b] = [Number(v4[1]), Number(v4[2])];
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b < 128) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b < 32) || (a === 192 && b === 168));
}

/** Hands a carried packet to its relay (carryTo), with its mark if it is this phone's own: true when taken, false when it never will be. Throws to try again later. */
export type Upload = (url: string, sealed: Uint8Array, mark?: Mark) => Promise<boolean>;

/** A carried packet as the phone keeps it between runs: `hops` more phones it may go to, kept `until`. */
export type KeptCarried = Carried & { hops: number; until: number };

/** Where carried packets stay between runs (lib/carried-store.ts): those for others, or a space's own. */
export type CarriedStore = { load(): Promise<KeptCarried[]>; save(items: KeptCarried[]): Promise<void> };

/** Sends a text frame on a link (sendText of modules/erevos-radio). False if the link is not up. */
export type RadioSend = (link: string, text: string) => boolean;

/** How the ids of slow links start (lib/lora.ts). */
export const SLOW_PREFIX = 'lora-';

const PREFIX = 'EVN1';
const CARRY_PREFIX = 'EVC1';
// The bridge: a phone with internet says it reads queues for the phones beside it (OFFER_PREFIX),
// one with none asks it a relay request (ASK_PREFIX), and the answer comes back (ANSWER_PREFIX).
const OFFER_PREFIX = 'EVB0';
const ASK_PREFIX = 'EVB1';
const ANSWER_PREFIX = 'EVB2';
// A packet's bytes in one frame: as base64 with the frame's head, under the radio's 16 KB.
const PIECE = 12_000;
const MAX_PIECES = 8;
// The largest packet sent to every phone nearby; larger ones go to a contact heard nearby only.
const MAX_SPREAD = 8 * 1024;
// The most a slow link takes for one message, in all: a text with the conversation's first packet.
const MAX_SLOW = 3 * 1024;
// Packets for none of the open chats, kept for the other spaces: how many, and how long.
const MAX_HELD = 200;
const HELD_FOR = 6 * 3600 * 1000;
// A packet coming in pieces is dropped if the rest takes longer than this, milliseconds.
const PIECES_WITHIN = 60_000;
const MAX_GATHERING = 32;
// Packets taken already, by digest, so one that comes on two links is tried once.
const MAX_SEEN = 500;
// Packets carried for their relays: how many, how long at most, and how many more phones each
// passes on to from the phone that sent it.
const MAX_CARRIED = 100;
const CARRY_FOR = 3 * 24 * 3600 * 1000;
const MAX_HOPS = 2;
// Carried packets offered to a phone newly linked, the newest, at most.
const OFFER = 20;
// Carried packets taken from one link, at most, so one phone cannot crowd out the others'.
const TAKE_PER_LINK = 30;
// Requests to its relay a phone nearby may have this one pass on, at most, in BRIDGE_WINDOW; and how
// long one asked of a phone nearby is waited for.
const BRIDGE_ASKS = 120;
const BRIDGE_WINDOW = 10 * 60_000;
// The bytes of replies passed on for one link in BRIDGE_WINDOW, at most: this phone's data.
const BRIDGE_BYTES = 2 * 1024 * 1024;
const BRIDGE_WAIT = 20_000;
// A relay address as two that name the same relay say it (sameRelay in lib/relay.ts).
const plainRelay = (url: string) => url.trim().replace(/\/+$/, '').toLowerCase();
// A carried packet its relay did not take is tried again after this long, milliseconds.
const RETRY_AFTER = 60_000;
// A relay address, as the relay takes it in a forward: ws:// or wss://, plain ASCII, 512 at most.
const RELAY_URL = /^wss?:\/\/[\x21-\x7e]{1,500}$/;

const FRAME = /^(EVN1|EVC1|EVB0|EVB1|EVB2):([0-9a-f]{8}):([0-9]):([1-9]):([A-Za-z0-9+/]+={0,2})$/;

const digestOf = (packet: Uint8Array) => toHex(sha256Bytes(packet)).slice(0, 32);
const isSlow = (link: string) => link.startsWith(SLOW_PREFIX);

/** The frames a packet goes in, or null when it is too large for the radio. */
export function framesOf(packet: Uint8Array, prefix = PREFIX): string[] | null {
  const count = Math.max(1, Math.ceil(packet.length / PIECE));
  if (count > MAX_PIECES) return null;
  const id = toHex(randomBytes(4));
  return Array.from({ length: count }, (_, n) => `${prefix}:${id}:${n}:${count}:${toBase64(packet.subarray(n * PIECE, (n + 1) * PIECE))}`);
}

// A carried packet kept on this phone. `hops`: how many more phones it may pass on to. `space`: for
// this phone's own, the store of the space they came from (null when none was open). `from`: the
// link it came on, which is not offered it back; `offered`: the links it went to already.
type Item = Carried & {
  key: string;
  hops: number;
  until: number;
  own: boolean;
  space: CarriedStore | null;
  from: string | null;
  offered: Set<string>;
  triedAt: number;
};

const keyOf = (url: string, sealed: Uint8Array) => digestOf(joined(Uint8Array.from(url, (char) => char.charCodeAt(0)), sealed));

function joined(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

// A carried packet as it goes on the radio: how many more phones it may pass on to (1 byte), how
// many seconds it has left (4), the relay's address after its length (2), then the sealed packet.
function encodeItem(item: Item, hops: number, now: number): Uint8Array {
  const bytes = new Uint8Array(1 + 4 + 2 + item.url.length + item.sealed.length);
  const view = new DataView(bytes.buffer);
  bytes[0] = hops;
  view.setUint32(1, Math.max(0, Math.floor((item.until - now) / 1000)));
  view.setUint16(5, item.url.length);
  for (let i = 0; i < item.url.length; i++) bytes[7 + i] = item.url.charCodeAt(i);
  bytes.set(item.sealed, 7 + item.url.length);
  return bytes;
}

function decodeItem(bytes: Uint8Array, now: number): { url: string; sealed: Uint8Array; hops: number; until: number } | null {
  if (bytes.length < 7) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const hops = Math.min(bytes[0], MAX_HOPS - 1);
  const left = view.getUint32(1) * 1000;
  const length = view.getUint16(5);
  if (left <= 0 || bytes.length <= 7 + length) return null;
  const url = String.fromCharCode(...bytes.subarray(7, 7 + length));
  if (!RELAY_URL.test(url)) return null;
  return { url, sealed: bytes.slice(7 + length), hops, until: now + Math.min(left, CARRY_FOR) };
}

/** Neither the relay nor a phone nearby took it. */
export class NoWayError extends Error {
  constructor() {
    super(t('There is no relay, and no Erevos phone is linked nearby. Type the relay address in Relay, or come near their phone.'));
  }
}

/** Only a slow way was left (LoRa or SMS), and it does not take something this large. `relayError`: what the relay said, when it was tried first, or null. */
export class TooLargeForSlowWayError extends Error {
  readonly relayError: unknown;

  constructor(message: string, relayError: unknown = null) {
    super(message);
    this.relayError = relayError;
  }
}

/** Only a slow link was up, and it does not take something this large. */
export class TooLargeForLoraError extends TooLargeForSlowWayError {
  constructor(relayError: unknown = null) {
    super(t('Too large for LoRa, which takes only text. It can go once the relay can be reached, or near their phone.'), relayError);
  }
}

/** Only SMS was left, and it does not take something this large. */
export class TooLargeForSmsError extends TooLargeForSlowWayError {
  constructor(relayError: unknown = null) {
    super(t('Too long for SMS, which takes only short texts. It can go once the relay can be reached, or near their phone.'), relayError);
  }
}

/**
 * The links one hidden place's contacts were heard on, apart from the space's (Nearby.heardOn): in
 * memory only, while the place is open or receives (lib/place-nearby.ts), then forgotten.
 */
export class NearHeard {
  private readonly heard = new Map<string, string>();
  private readonly listeners = new Set<() => void>();
  private readonly links: Pick<Nearby, 'isUp'>;

  constructor(links: Pick<Nearby, 'isUp'>) {
    this.links = links;
  }

  /** The link a contact was heard on, while it is up, or null. */
  linkOf(identity: string): string | null {
    const link = this.heard.get(identity);
    return link && !isSlow(link) && this.links.isUp(link) ? link : null;
  }

  /** Whether a contact was heard on a link that is still up. */
  isNear(identity: string): boolean {
    return this.linkOf(identity) !== null;
  }

  /** A contact's packet came on this link: what goes to them goes there from now on. */
  heardOn(identity: string, link: string): void {
    if (isSlow(link) || this.heard.get(identity) === link) return;
    this.heard.set(identity, link);
    this.listeners.forEach((listener) => listener());
  }

  /** Calls `listener` when a contact is heard on a new link. Returns how to stop. */
  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Forgets them all, as the place closes. */
  clear(): void {
    this.heard.clear();
    this.listeners.clear();
  }
}

/** The phone's radio links, and what goes over them. The app has one (`nearby`). */
export class Nearby {
  private send: RadioSend = () => false;
  private readonly links = new Set<string>();
  // The link each contact was last heard on, by identity.
  private readonly heard = new Map<string, string>();
  private readonly gathering = new Map<string, { pieces: (string | null)[]; at: number }>();
  private held: { packet: Uint8Array; digest: string; at: number }[] = [];
  private readonly seen: string[] = [];
  private readonly listeners = new Set<() => void>();
  // Packets carried for their relays, oldest first; this phone's own among them.
  private items: Item[] = [];
  private readonly takenFrom = new Map<string, number>();
  private carrying = false;
  // The bridge: whether this phone reaches its relay now (setOnline), the links that said they read
  // for others, what each link asked of this phone lately, and the asks of this phone still waiting.
  private online = false;
  private readonly bridges = new Set<string>();
  private readonly askedOf = new Map<string, number[]>();
  private readonly asking = new Map<string, { link: string; done: (reply: Uint8Array | null) => void }>();
  private readonly goneListeners = new Set<(link: string) => void>();
  /** Passes a request of a phone nearby to its relay (readForOthers in lib/relay.ts), set while a space is open. */
  readForOthers: ((own: string, url: string, key: Uint8Array | undefined, bytes: Uint8Array, warned: boolean) => Promise<Uint8Array>) | null = null;
  // The relay this phone reached at its last look, the one it reads on for others unasked.
  private ownRelay = '';
  // For another relay: the owner's answer for each link and relay, while linked, and whether a question shows.
  private readonly servesOn = new Map<string, Map<string, boolean>>();
  private serveAsking = false;
  /** Asks the owner, warned that the relay sees this phone's internet address, whether to read on
   *  another relay than its own for the phone on `link`. Set while a space is open. */
  askServe: ((link: string, url: string) => Promise<boolean>) | null = null;
  private readonly bytesOf = new Map<string, { at: number; bytes: number }[]>();
  /** Which relays this phone carries packets of other phones to (isCarriable; checks with relays
   *  on this computer let any). */
  carriable: (url: string) => boolean = isCarriable;
  private uploading: Promise<number> | null = null;
  /** The SMS way to contacts, the last of all, while a space is open (lib/sms-way.ts). */
  smsWay: SmsWay | null = null;
  // Where carried packets stay: those for others, and the open space's own. Saved to only once
  // loaded, so what was kept is not written over first; `dirty`: those to save again.
  private others: CarriedStore | null = null;
  private ownStore: CarriedStore | null = null;
  private readonly loaded = new Set<CarriedStore>();
  private readonly dirty = new Set<CarriedStore>();
  private writes: Promise<void> = Promise.resolve();
  private writing = false;
  private loads: Promise<unknown> = Promise.resolve();

  private changed() {
    this.listeners.forEach((listener) => listener());
  }

  /** Sends on the radio from now on, with no link up yet. Returns how to stop: the links go then too. */
  start(radio: RadioSend): () => void {
    const forget = () => {
      this.links.clear();
      this.heard.clear();
      this.gathering.clear();
      this.takenFrom.clear();
      this.bridges.clear();
      this.askedOf.clear();
      this.bytesOf.clear();
      this.servesOn.clear();
      for (const [, ask] of this.asking) ask.done(null);
      this.asking.clear();
      for (const item of this.items) {
        item.offered.clear();
        item.from = null;
      }
      this.changed();
    };
    this.send = radio;
    forget();
    return () => {
      if (this.send !== radio) return;
      this.send = () => false;
      forget();
    };
  }

  /** A data link to a phone nearby is up (an onPeer event of kind wifi-aware or ble-link). */
  linkUp(link: string, now = Date.now()): void {
    if (this.links.has(link)) return;
    this.links.add(link);
    this.changed();
    if (isSlow(link)) return;
    if (this.serves()) this.sendOn(link, [[`${OFFER_PREFIX}:${toHex(randomBytes(4))}:0:1:${toBase64(Uint8Array.of(1))}`]]);
    // What this phone carries goes to the phone newly linked, which may reach the internet first:
    // the newest, in the order they were sent, as a contact's first packet must come first.
    const offered = this.carriedNow(now)
      .filter((item) => item.hops > 0 && item.from !== link && !item.offered.has(link))
      .slice(-OFFER);
    for (const item of offered) if (!this.passOn(item, [link], now)) break;
  }

  /** How many phones nearby are linked now, not counting slow links. */
  count(): number {
    return [...this.links].filter((link) => !isSlow(link)).length;
  }

  /** The links up now, not the slow ones: for what talks on them besides messages (lib/near-pair.ts). */
  fastLinks(): string[] {
    return [...this.links].filter((link) => !isSlow(link));
  }

  /** Whether a slow link (a LoRa radio) is up. */
  hasSlow(): boolean {
    return [...this.links].some(isSlow);
  }

  /** Whether this link is up. */
  isUp(link: string): boolean {
    return this.links.has(link);
  }

  /**
   * Hands packets to the one heard on a link nearby that is still up, and not a slow one: the
   * account's own device (lib/devices.ts), as `device:<id>`. Never to the others nearby. Says
   * whether the link took them.
   */
  toHeard(identity: string, packets: Uint8Array[]): boolean {
    const link = this.heard.get(identity);
    if (!link || isSlow(link) || !this.links.has(link)) return false;
    const frames = packets.map((packet) => framesOf(packet));
    if (frames.some((f) => f === null)) return false;
    return this.sendOn(link, frames as string[][]);
  }

  /** Whether a contact was heard on a link that is still up, and not a slow one. */
  isNear(identity: string): boolean {
    const link = this.heard.get(identity);
    return !!link && !isSlow(link) && this.links.has(link);
  }

  /** A contact's packet came on this link: what goes to them goes there from now on. */
  heardOn(identity: string, link: string): void {
    if (this.heard.get(identity) === link) return;
    this.heard.set(identity, link);
    this.changed();
  }

  /** Calls `listener` when a link comes or goes, or a contact is heard nearby. Returns how to stop. */
  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private lost(link: string) {
    this.links.delete(link);
    this.bridges.delete(link);
    this.servesOn.delete(link);
    for (const gone of this.goneListeners) gone(link);
    for (const [id, ask] of this.asking) if (ask.link === link) {
      this.asking.delete(id);
      ask.done(null);
    }
    for (const [identity, on] of this.heard) if (on === link) this.heard.delete(identity);
    this.changed();
  }

  private sendOn(link: string, frames: string[][]): boolean {
    for (const frame of frames.flat()) {
      if (!this.send(link, frame)) {
        this.lost(link);
        return false;
      }
    }
    return true;
  }

  // Sends packets over the links, the slow ones or the others: on the contact's link when they were
  // heard on one, otherwise, when they are small, on every link. Says which, or null when none took them.
  private toLinks(identity: string, packets: Uint8Array[], slow: boolean, heard: NearHeard | null = null): 'direct' | 'spread' | null {
    if (slow && packets.reduce((sum, packet) => sum + packet.length, 0) > MAX_SLOW) return null;
    const frames = packets.map((packet) => framesOf(packet));
    if (frames.some((f) => f === null)) return null;
    const all = frames as string[][];
    const links = [...this.links].filter((link) => isSlow(link) === slow);
    const link = heard ? heard.linkOf(identity) : this.heard.get(identity);
    if (link && links.includes(link) && this.sendOn(link, all)) return 'direct';
    if (packets.some((packet) => packet.length > MAX_SPREAD)) return null;
    let reached = 0;
    for (const other of links) if (this.sendOn(other, all)) reached++;
    return reached > 0 ? 'spread' : null;
  }

  /**
   * Sends a hidden place's packets for a contact on the links now, as `deliver` does before the
   * relay: to the link the place heard them on (`heard`), or, when they are small, to every phone
   * linked. Says which, or null when none took them. Nothing is carried, nor goes over LoRa.
   */
  offer(identity: string, packets: Uint8Array[], heard: NearHeard): 'direct' | 'spread' | null {
    return this.toLinks(identity, packets, false, heard);
  }

  /**
   * Hands a contact's packets, in order, to their phone. `relay` sends them through the relay, or
   * is null when there is none; it says 'nostr' when they went through Nostr instead (lib/nostr-chats.ts
   * orNostr). Sent to them nearby, the relay's copy goes too, unwaited.
   * Otherwise it waits for the relay, and if the relay fails, a copy that went to the phones
   * nearby will do: then `carry`, when given, seals them for the contact's relay, and the phones
   * nearby take those too, to hand over. With `slow`, the slow links take them too then, when
   * they are small enough. Throws the relay's error, or NoWayError, when nothing took them; or,
   * when only a slow link was up and they are too large for it, TooLargeForLoraError, which holds
   * the relay's error if the relay was tried. With `slow`, when nothing took them, SMS takes them
   * last, if it is on for the contact (`smsWay`) and they are small enough; too large, it throws
   * TooLargeForSmsError, and if the SMS did not go, what it would have thrown without SMS.
   * `heard`: a hidden place's (NearHeard), whose contact this is: then where they were heard is
   * looked up there, never in the space's, and nothing is carried, nor goes over LoRa or by SMS.
   */
  async deliver(
    identity: string,
    packets: Uint8Array[],
    relay: (() => Promise<'nostr' | void>) | null,
    carry: (() => Promise<Carried[]>) | null = null,
    slow = false,
    heard: NearHeard | null = null,
  ): Promise<Delivery> {
    if (heard) {
      carry = null;
      slow = false;
    }
    const way = this.toLinks(identity, packets, false, heard);
    if (way === 'direct') {
      relay?.().catch(() => {
        // They have it from the radio; the relay's copy was only in case the link dropped.
      });
      return 'nearby';
    }
    let failed: unknown = new NoWayError();
    if (relay) {
      try {
        return (await relay()) === 'nostr' ? 'nostr' : 'relay';
      } catch (error) {
        failed = error;
      }
    }
    const far = slow && this.toLinks(identity, packets, true) !== null;
    if (way === 'spread') {
      const carried = await this.carryOwn(carry);
      return carried === 'spread' && far ? 'lora' : carried;
    }
    if (far) return 'lora';
    const sms = slow ? this.smsWay : null;
    if (sms?.can(identity)) {
      if (!fitsSms(packets)) throw new TooLargeForSmsError(relay ? failed : null);
      try {
        if (await sms.send(identity, packets)) return 'sms';
      } catch {
        // The SMS did not go (no signal, say): it fails as it would have without SMS, and can wait.
      }
    }
    const total = packets.reduce((sum, packet) => sum + packet.length, 0);
    if (slow && total > MAX_SLOW && [...this.links].some(isSlow)) throw new TooLargeForLoraError(relay ? failed : null);
    throw failed;
  }

  // Keeps this phone's own packets sealed for the contact's relay, and gives them to the phones
  // linked now. Says whether any took them.
  private async carryOwn(carry: (() => Promise<Carried[]>) | null, now = Date.now()): Promise<Delivery> {
    let made: Carried[];
    try {
      made = carry ? await carry() : [];
    } catch {
      return 'spread';
    }
    const items = made
      .filter(({ url }) => RELAY_URL.test(url))
      .map(({ url, sealed, mark }) => {
        const space = this.ownStore;
        return { url, sealed, ...(mark ? { mark } : {}), key: keyOf(url, sealed), hops: MAX_HOPS, until: now + CARRY_FOR, own: true, space, from: null, offered: new Set<string>(), triedAt: 0 };
      });
    if (items.length === 0) return 'spread';
    for (const item of items) this.keep(item);
    let reached = 0;
    for (const link of [...this.links]) if (!isSlow(link) && items.every((item) => this.passOn(item, [link], now))) reached++;
    return reached > 0 ? 'carried' : 'spread';
  }

  // Keeps a carried packet, after the others; the oldest of others' goes when there are too many.
  private keep(item: Item) {
    this.seen.push(item.key);
    if (this.seen.length > MAX_SEEN) this.seen.shift();
    this.items.push(item);
    this.save(item);
    this.trim();
  }

  private trim() {
    while (this.items.length > MAX_CARRIED) {
      const others = this.items.findIndex((kept) => !kept.own);
      this.save(...this.items.splice(others >= 0 ? others : 0, 1));
    }
  }

  // Saves the stores these items are kept in, after the writes before; changes made meanwhile go
  // in one more write.
  private save(...items: Item[]) {
    this.saveTo(items.map((item) => (item.own ? item.space : this.others)));
  }

  private saveTo(stores: (CarriedStore | null)[]) {
    for (const store of stores) if (store && this.loaded.has(store)) this.dirty.add(store);
    if (this.writing || this.dirty.size === 0) return;
    this.writing = true;
    this.writes = this.writes.then(async () => {
      try {
        for (let store = this.nextDirty(); store; store = this.nextDirty()) await store.save(this.keptIn(store)).catch(() => undefined);
      } finally {
        this.writing = false;
      }
    });
  }

  private nextDirty(): CarriedStore | undefined {
    const store = this.dirty.values().next().value;
    if (store) this.dirty.delete(store);
    return store;
  }

  // What a store keeps: the space's own, or those for others.
  private keptIn(store: CarriedStore): KeptCarried[] {
    return this.items
      .filter((item) => (store === this.others ? !item.own : item.space === store))
      .map(({ url, sealed, mark, hops, until }) => ({ url, sealed, ...(mark ? { mark } : {}), hops, until }));
  }

  // Takes back what a store kept, before what came this run, and saves to it from now on.
  private async restore(store: CarriedStore, own: boolean): Promise<void> {
    const kept = await store.load().catch(() => [] as KeptCarried[]);
    const now = Date.now();
    const known = new Set(this.items.map((item) => item.key));
    const back: Item[] = [];
    for (const { url, sealed, mark, hops, until } of kept) {
      if (!RELAY_URL.test(url) || !(until > now) || !(sealed instanceof Uint8Array) || !Number.isInteger(hops)) continue;
      const key = keyOf(url, sealed);
      if (known.has(key) || (!own && (!this.carrying || !this.carriable(url)))) continue;
      known.add(key);
      const most = own ? MAX_HOPS : MAX_HOPS - 1;
      back.push({ url, sealed, ...(own && mark ? { mark } : {}), key, hops: Math.max(0, Math.min(hops, most)), until: Math.min(until, now + CARRY_FOR), own, space: own ? store : null, from: null, offered: new Set(), triedAt: 0 });
    }
    for (const item of back) {
      this.seen.push(item.key);
      if (this.seen.length > MAX_SEEN) this.seen.shift();
    }
    this.items = [...back, ...this.items];
    this.loaded.add(store);
    // Saved again when it changed: something left out, or kept this run before it loaded.
    const inIt = this.items.filter((item) => (own ? item.space === store : !item.own));
    if (back.length !== kept.length || inIt.length !== back.length) this.saveTo([store]);
    this.trim();
  }

  // Gives a carried packet to the phones on `links`, with one hop fewer. False when a link dropped.
  private passOn(item: Item, links: string[], now: number): boolean {
    if (item.hops <= 0) return true;
    const frames = framesOf(encodeItem(item, item.hops - 1, now), CARRY_PREFIX);
    if (!frames) return true;
    let all = true;
    for (const link of links) {
      if (item.offered.has(link) || item.from === link || isSlow(link)) continue;
      if (this.sendOn(link, [frames])) item.offered.add(link);
      else all = false;
    }
    return all;
  }

  // The carried packets still in time, oldest first.
  private carriedNow(now: number): Item[] {
    this.items = this.items.filter((item) => item.until > now);
    return this.items;
  }

  // A packet for someone's relay, from a phone nearby: kept, and passed on to the other phones linked.
  private carriedIn(link: string, bytes: Uint8Array, now: number) {
    if (!this.carrying || isSlow(link)) return;
    const item = decodeItem(bytes, now);
    if (!item || !this.carriable(item.url)) return;
    const key = keyOf(item.url, item.sealed);
    if (this.seen.includes(key)) return;
    const taken = this.takenFrom.get(link) ?? 0;
    if (taken >= TAKE_PER_LINK) return;
    this.takenFrom.set(link, taken + 1);
    const kept: Item = { ...item, key, own: false, space: null, from: link, offered: new Set(), triedAt: 0 };
    this.keep(kept);
    this.passOn(kept, [...this.links], now);
  }

  /** Whether this phone takes packets from phones nearby to hand to their relays. Its own always go. */
  setCarrying(on: boolean): void {
    const served = this.serves();
    this.carrying = on;
    if (served !== this.serves()) this.offerAll();
    if (on) return;
    const others = this.items.filter((item) => !item.own);
    this.items = this.items.filter((item) => item.own);
    this.save(...others);
  }

  /**
   * Keeps what this phone carries for others in `store` from now on, as well as in memory, and
   * takes back what it kept there before. Once for the phone; resolves once it is back.
   */
  keepOthersIn(store: CarriedStore): Promise<void> {
    this.others = store;
    const restored = this.restore(store, false);
    this.loads = Promise.all([this.loads, restored]);
    return restored;
  }

  /**
   * Keeps this phone's own carried packets, those made from now on, in the open space's `store`
   * too, and takes back those it kept there before. The function it gives saves them a last time
   * and lets go of them as the space closes; they come back as it opens again.
   */
  keepOwnIn(store: CarriedStore): () => void {
    this.ownStore = store;
    const restored = this.restore(store, true);
    this.loads = Promise.all([this.loads, restored]);
    return () => {
      if (this.ownStore === store) this.ownStore = null;
      void restored.then(() => {
        // What changed and is not saved yet is saved now, as it was.
        const last = this.dirty.delete(store) ? this.keptIn(store) : null;
        this.loaded.delete(store);
        this.items = this.items.filter((item) => item.space !== store);
        if (last) this.writes = this.writes.then(() => store.save(last)).catch(() => undefined);
      });
    };
  }

  /** Once what is kept is back, and what changed in carried packets so far is saved. */
  async carriedSaved(): Promise<void> {
    await this.loads;
    for (let writes = this.writes; ; writes = this.writes) {
      await writes;
      if (writes === this.writes) return;
    }
  }

  /** How many packets this phone carries now: its own, and for others. */
  carriedCount(now = Date.now()): { own: number; others: number } {
    const items = this.carriedNow(now);
    const own = items.filter((item) => item.own).length;
    return { own, others: items.length - own };
  }

  /**
   * Hands what this phone carries to the relays it is for, oldest first, with `upload` (carryTo
   * through this phone's relay). One a relay did not take is tried again a minute later, and
   * the rest for that relay wait with it, so they come in order. Says how many were taken.
   */
  uploadCarried(upload: Upload, now = Date.now()): Promise<number> {
    if (this.uploading) return this.uploading;
    const run = async () => {
      let taken = 0;
      const waiting = new Set<string>();
      for (const item of [...this.carriedNow(now)]) {
        if (waiting.has(item.url) || now - item.triedAt < RETRY_AFTER) {
          waiting.add(item.url);
          continue;
        }
        item.triedAt = now;
        try {
          if (await upload(item.url, item.sealed, item.own ? item.mark : undefined)) taken++;
          this.items = this.items.filter((kept) => kept !== item);
          this.save(item);
        } catch {
          waiting.add(item.url);
        }
      }
      return taken;
    };
    this.uploading = run().finally(() => {
      this.uploading = null;
    });
    return this.uploading;
  }

  /**
   * The packet a frame from a link completes, or null: a piece of one still coming, one taken
   * already, one carried for a relay (kept here, see `uploadCarried`), or not a sealed packet at
   * all (as an older Erevos sent, plain).
   */
  frameIn(link: string, text: string, now = Date.now()): Uint8Array | null {
    const match = FRAME.exec(text);
    if (!match) return null;
    const [, prefix, id, at, of, data] = match;
    const n = Number(at);
    const count = Number(of);
    if (n >= count || count > MAX_PIECES) return null;
    this.linkUp(link, now);
    let pieces: (string | null)[] = [data];
    if (count > 1) {
      for (const [key, g] of this.gathering) if (now - g.at > PIECES_WITHIN) this.gathering.delete(key);
      const key = `${link} ${prefix}${id}`;
      const g = this.gathering.get(key) ?? { pieces: new Array<string | null>(count).fill(null), at: now };
      if (g.pieces.length !== count) return null;
      g.pieces[n] = data;
      this.gathering.set(key, g);
      while (this.gathering.size > MAX_GATHERING) this.gathering.delete(this.gathering.keys().next().value!);
      if (g.pieces.some((piece) => piece === null)) return null;
      this.gathering.delete(key);
      pieces = g.pieces;
    }
    let packet: Uint8Array;
    try {
      const parts = pieces.map((piece) => fromBase64(piece!));
      packet = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
      let offset = 0;
      for (const part of parts) {
        packet.set(part, offset);
        offset += part.length;
      }
    } catch {
      return null;
    }
    if (prefix === CARRY_PREFIX) {
      this.carriedIn(link, packet, now);
      return null;
    }
    if (prefix === OFFER_PREFIX) {
      if (isSlow(link)) return null;
      if (packet[0] === 1) this.bridges.add(link);
      else this.bridges.delete(link);
      this.changed();
      return null;
    }
    if (prefix === ASK_PREFIX) {
      void this.askedIn(link, packet, now);
      return null;
    }
    if (prefix === ANSWER_PREFIX) {
      this.answerIn(link, packet);
      return null;
    }
    const digest = digestOf(packet);
    if (this.seen.includes(digest)) return null;
    this.seen.push(digest);
    if (this.seen.length > MAX_SEEN) this.seen.shift();
    return packet;
  }

  // Whether this phone reads queues for the phones beside it: it carries for others, and reaches its relay.
  private serves(): boolean {
    return this.carrying && this.online && !!this.ownRelay && !!this.readForOthers;
  }

  private offerAll() {
    const on = this.serves() ? 1 : 0;
    for (const link of [...this.links]) if (!isSlow(link)) this.sendOn(link, [[`${OFFER_PREFIX}:${toHex(randomBytes(4))}:0:1:${toBase64(Uint8Array.of(on))}`]]);
  }

  /** Whether this phone reached its relay, `url`, at its last look: phones beside it are told whether it reads for them, on that relay alone. */
  setOnline(on: boolean, url = ''): void {
    const served = this.serves();
    this.online = on;
    this.ownRelay = on ? url : '';
    if (served !== this.serves()) this.offerAll();
  }

  /** Calls `listener` with each link that went down; gives what stops it. */
  onLinkGone(listener: (link: string) => void): () => void {
    this.goneListeners.add(listener);
    return () => this.goneListeners.delete(listener);
  }

  /** The links whose phones said they read queues for others, up now. */
  bridgeLinks(): string[] {
    return [...this.bridges].filter((link) => this.links.has(link));
  }

  /**
   * Has the phone on `link` pass a relay request (isReadForOthers in lib/relay.ts) to the relay at
   * `url`, and gives the relay's reply. Throws when it does not come, in BRIDGE_WAIT at most.
   */
  readThrough(link: string, url: string, key: Uint8Array | undefined, bytes: Uint8Array, wait = BRIDGE_WAIT): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const urlBytes = Uint8Array.from(url, (char) => char.charCodeAt(0));
      if (!RELAY_URL.test(url) || (key?.length ?? 0) > 255) {
        reject(new NoWayError());
        return;
      }
      const id = randomBytes(4);
      const k = key ?? new Uint8Array(0);
      const ask = new Uint8Array(4 + 1 + k.length + 2 + urlBytes.length + bytes.length);
      ask.set(id, 0);
      ask[4] = k.length;
      ask.set(k, 5);
      new DataView(ask.buffer).setUint16(5 + k.length, urlBytes.length);
      ask.set(urlBytes, 7 + k.length);
      ask.set(bytes, 7 + k.length + urlBytes.length);
      const frames = framesOf(ask, ASK_PREFIX);
      const name = toHex(id);
      const timer = setTimeout(() => done(null), wait);
      const done = (reply: Uint8Array | null) => {
        clearTimeout(timer);
        this.asking.delete(name);
        if (reply) resolve(reply);
        else reject(new NoWayError());
      };
      this.asking.set(name, { link, done });
      if (!frames || !this.links.has(link) || !this.sendOn(link, [frames])) done(null);
    });
  }

  // A phone nearby asks this one to pass a request to its relay: only while this phone serves, to
  // the relay this phone uses itself (readForOthers in lib/relay.ts says why), so many a while from
  // one link, so many bytes of replies, and only what readForOthers takes. A no goes back at once.
  private async askedIn(link: string, bytes: Uint8Array, now: number) {
    const read = this.readForOthers;
    if (!read || isSlow(link) || bytes.length < 7) return;
    const id = bytes.subarray(0, 4);
    const answer = (reply: Uint8Array | null) => {
      const out = new Uint8Array(4 + 1 + (reply?.length ?? 0));
      out.set(id, 0);
      out[4] = reply ? 1 : 0;
      if (reply) out.set(reply, 5);
      const frames = framesOf(out, ANSWER_PREFIX);
      if (frames && this.links.has(link)) this.sendOn(link, [frames]);
    };
    const k = bytes[4];
    if (bytes.length < 7 + k) return;
    const length = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(5 + k);
    if (bytes.length <= 7 + k + length) return;
    const url = String.fromCharCode(...bytes.subarray(7 + k, 7 + k + length));
    const own = this.ownRelay;
    if (!this.serves() || !RELAY_URL.test(url) || !this.carriable(url)) return answer(null);
    // Another relay than its own: only once the owner said yes, warned; asked once for the link and
    // relay, never waited for: a no now, and the phone asks again with its next look.
    const foreign = plainRelay(url) !== plainRelay(own);
    if (foreign) {
      const on = this.servesOn.get(link);
      // A no holds for the whole link: a phone naming a new relay each time is not asked about again.
      if (on && [...on.values()].includes(false)) return answer(null);
      const said = on?.get(plainRelay(url));
      if (said === undefined) this.askToServe(link, url);
      if (said !== true) return answer(null);
    }
    const recent = (this.askedOf.get(link) ?? []).filter((at) => now - at < BRIDGE_WINDOW);
    const spent = (this.bytesOf.get(link) ?? []).filter((one) => now - one.at < BRIDGE_WINDOW);
    if (recent.length >= BRIDGE_ASKS || spent.reduce((sum, one) => sum + one.bytes, 0) >= BRIDGE_BYTES) return answer(null);
    recent.push(now);
    this.askedOf.set(link, recent);
    let reply: Uint8Array | null = null;
    try {
      reply = await read(own, url, k > 0 ? bytes.slice(5, 5 + k) : undefined, bytes.slice(7 + k + length), foreign);
    } catch {
      reply = null;
    }
    spent.push({ at: now, bytes: reply?.length ?? 0 });
    this.bytesOf.set(link, spent);
    answer(reply);
  }

  // Asks the owner whether to read on `url` for the phone on `link`, keeping the answer while linked.
  private askToServe(link: string, url: string) {
    const ask = this.askServe;
    if (!ask || this.serveAsking) return;
    this.serveAsking = true;
    ask(link, url)
      .catch(() => false)
      .then((yes) => {
        if (!this.links.has(link)) return;
        const on = this.servesOn.get(link) ?? new Map<string, boolean>();
        on.set(plainRelay(url), yes);
        this.servesOn.set(link, on);
      })
      .finally(() => {
        this.serveAsking = false;
      });
  }

  // The answer of a phone nearby to what this one asked it, on the link it was asked on.
  private answerIn(link: string, bytes: Uint8Array) {
    if (bytes.length < 5) return;
    const ask = this.asking.get(toHex(bytes.subarray(0, 4)));
    if (!ask || ask.link !== link) return;
    ask.done(bytes[4] === 1 ? bytes.slice(5) : null);
  }

  /** Keeps a packet that opened in none of the open chats, for the spaces opened later. */
  hold(packet: Uint8Array, now = Date.now()): void {
    const digest = digestOf(packet);
    this.held = this.held.filter((h) => now - h.at < HELD_FOR && h.digest !== digest);
    this.held.push({ packet, digest, at: now });
    if (this.held.length > MAX_HELD) this.held = this.held.slice(-MAX_HELD);
  }

  /** The packets kept for other spaces, oldest first. They stay kept until `dropHeld`. */
  heldPackets(now = Date.now()): Uint8Array[] {
    this.held = this.held.filter((h) => now - h.at < HELD_FOR);
    return this.held.map((h) => h.packet);
  }

  /** Forgets a kept packet: it opened, or never can. */
  dropHeld(packet: Uint8Array): void {
    this.held = this.held.filter((h) => h.packet !== packet);
  }
}

/** This phone's. */
export const nearby = new Nearby();
