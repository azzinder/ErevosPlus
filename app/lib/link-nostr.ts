// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { canNostrChat, nostrKeys, type Core } from './core';
import { fromHex, randomBytes, toHex, utf8Decode, utf8Encode } from './crypto';
import { t } from './i18n';
import { QUICK_RELAYS, quickText, readQuick, type QuickMessage } from './link-quick';
import { authEvent, type NostrDmState } from './nostr-dm';
import { NostrRelay, type NostrEvent } from './nostr-dm-net';

// The way a new computer and the phone talk while linking with the short code (lib/link-quick.ts):
// Nostr wraps (NIP-59, crates/erevos-nostr) on QUICK_RELAYS, each to a key made for this link
// alone, as Erevos's texts on Nostr go. A wrap is signed by a key made for it alone, so the relays
// see only that someone wrote to a key that names no one; what it carries is read only by that
// key's holder, and taken only with the secret of the code the phone read. Straight over
// WebSocket on a computer, which has no Tor; on the phone the space's Tor way, as its Nostr chats.

type Keys = Required<Pick<Core, 'nostrSecret' | 'nostrPublic' | 'nostrWrap' | 'nostrUnwrap'>>;

let keysOf: (() => Keys | null) | null = null;

/** For the checks: the core's Nostr calls. */
export function setQuickKeys(next: (() => Keys | null) | null): void {
  keysOf = next;
}

function keys(): Keys {
  const got = keysOf ? keysOf() : coreKeys();
  if (!got) throw new Error(t('This build of Erevos has no Nostr.'));
  return got;
}

function coreKeys(): Keys | null {
  return nostrKeys();
}

/** Whether this build can link with the short code. */
export function canQuickLink(): boolean {
  try {
    return (keysOf ? keysOf() : coreKeys()) !== null;
  } catch {
    return false;
  }
}

/** A message as sent: the channel adds the secret. */
export type QuickUnsigned = QuickMessage extends infer M ? (M extends QuickMessage ? Omit<M, 's'> : never) : never;

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

/**
 * One side of a link with the short code: a key of its own (`key`, the public one in hex), read for
 * on QUICK_RELAYS while it is open, each message with `secret` handed to `take`, and `send` to the
 * other side's key. `closed` once none of the relays can be reached, with why.
 */
export class QuickChannel {
  readonly key: string;
  private readonly secretKey: Uint8Array;
  private readonly secret: string;
  private readonly take: (message: QuickMessage) => void;
  private readonly relays = new Map<string, NostrRelay>();
  private readonly seen = new Set<string>();
  private readonly failed = new Set<string>();
  private readonly since = Math.floor(Date.now() / 1000) - SINCE;
  private stopped = false;
  private onDown: ((why: string) => void) | null = null;

  private constructor(secretKey: Uint8Array, key: string, secret: string, take: (message: QuickMessage) => void) {
    this.secretKey = secretKey;
    this.key = key;
    this.secret = secret;
    this.take = take;
  }

  /** Opens a side with a new key, reading for messages with `secret`. */
  static async open(secret: string, take: (message: QuickMessage) => void): Promise<QuickChannel> {
    const k = keys();
    const secretKey = await k.nostrSecret();
    const channel = new QuickChannel(secretKey, toHex(await k.nostrPublic(secretKey)), secret, take);
    for (const url of QUICK_RELAYS) void channel.read(url);
    return channel;
  }

  /** Told once every relay failed to open; at once when they all failed already. */
  whenDown(listener: (why: string) => void): void {
    this.onDown = listener;
    if (this.failed.size >= QUICK_RELAYS.length) listener(t('No Nostr server could be reached.'));
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
        if (this.failed.size >= QUICK_RELAYS.length) this.onDown?.(t('No Nostr server could be reached.'));
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
      const message = readQuick(utf8Decode(opened.slice(40)), this.secret);
      if (message && !this.stopped) this.take(message);
    } catch {
      // Not one for this link.
    }
  }

  /** Sends `message` to the other side's key: done once one relay took it. Throws when none did. */
  async send(to: string, message: QuickUnsigned): Promise<void> {
    const wrapped = await keys().nostrWrap(fromHex(to), utf8Encode(quickText({ ...message, s: this.secret } as QuickMessage)), be8(Date.now() / 1000));
    const text = typeof wrapped === 'string' ? wrapped : utf8Decode(wrapped as unknown as Uint8Array);
    const event = JSON.parse(text) as NostrEvent;
    const tries = QUICK_RELAYS.map(async (url) => {
      const open = this.relays.get(url);
      const relay = open?.open ? open : await NostrRelay.open(url, null);
      try {
        const said = await relay.publish(event);
        if (!said.ok) throw new Error(said.why || t('The Nostr server did not take it.'));
      } finally {
        if (relay !== open) relay.close();
      }
    });
    // Done once one took it; failed only once all failed.
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

/** A new secret for a short code: 16 random bytes, in hex. */
export function quickSecret(): string {
  return toHex(randomBytes(16));
}
