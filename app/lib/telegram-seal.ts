// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { sha256 } from '@noble/hashes/sha2.js';

import { acceptConversation, accountBundle, accountIdentity, bundleIdentity, conversationPeer, firstMessageId, newAccount, open, packetKind, safetyNumber, seal, startConversation } from './core';
import { fromBase64, toBase64, toHex, utf8Decode, utf8Encode } from './crypto';

// End-to-end encryption through an ordinary private Telegram chat (the ErevosGram build only,
// lib/telegram.ts), with Erevos's own protocol (lib/core.ts), word for word as the ErevosGram app
// speaks it (azzinder/ErevosGram, app/…/e2e/E2E.kt), so the two talk to each other and what that
// app kept comes in as it is (`adopt`).
//
// One side sends an invitation: a line people without the app can read, then the keys on a line of
// their own, `EGI1:` and base64url. The other side accepts: the first sealed message finishes the
// handshake on both phones, and both delete the invitations for everyone. Then every message
// travels as `EGM1:` and base64url, in pieces below the 1 KB padding bucket so one fits a Telegram
// message. A packet opens only once (the double ratchet forgets its keys), so what each one said is
// kept here, keyed by a hash of the text that carried it; the caller keeps this state sealed in its
// space (`SealStore`), never in the clear. Not audited.

/** Starts the keys of an invitation, after a line people without the app can read. */
export const INVITE = 'EGI1:';
/** Starts a sealed message. */
export const SEALED = 'EGM1:';
/** A text piece stays below the 1 KB padding bucket, so its packet fits one Telegram message. */
export const PIECE_BYTES = 900;
/** First-message ids kept against replays. */
export const MAX_SEEN = 200;
const INVITE_KEYS = /(?:^|\n)EGI1:([A-Za-z0-9_-]{200,})\s*$/;

/** Where the encryption stands in one private chat. */
export type SealState = 'NONE' | 'INVITED' | 'INVITE_IN' | 'ACTIVE';

/** What a sealed packet carried: a piece of text, the handshake's hello, or an invitation seen. */
export type SealBody = { t: 'text'; s: string } | { t: 'hello' } | { t: 'invite' } | { t: string; s?: string };

/** One chat, in the same fields as the ErevosGram app keeps it (base64url for bytes). */
export type SealChat = {
  state: SealState;
  conv?: string;
  peer?: string;
  mine?: boolean;
  verified?: boolean;
  changed?: boolean;
  bundle_in?: string;
  invites?: number[];
  /** Hash of the wire text → what it said, or '!' for one that cannot be opened here. */
  msgs?: Record<string, SealBody | '!'>;
};

/** Everything kept: the account (its secret keys), the first messages seen, and each chat. */
export type SealData = { account?: string; seen: string[]; chats: Record<string, SealChat> };

/** Where the state lives, sealed by the caller (in the space of this Telegram account). */
export type SealStore = { load(): Promise<SealData | null>; save(data: SealData): Promise<void> };

/** What a message of ours shows. `kind`: its own text, a line about the encryption, or one that cannot be opened. */
export type Shown = { kind: 'text'; text: string } | { kind: 'hello' | 'invite-in' | 'invite-out' } | { kind: 'unreadable' };

/**
 * What the chat screen needs to know of a chat. `sealed`: it has a conversation, so what is written
 * goes sealed, also while an invitation with other keys waits for an answer (INVITE_IN).
 */
export type SealInfo = { state: SealState; verified: boolean; keysChanged: boolean; sealed: boolean };

export const b64e = (bytes: Uint8Array) => toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const b64d = (text: string) => {
  const plain = text.replace(/-/g, '+').replace(/_/g, '/');
  return fromBase64(plain + '='.repeat((4 - (plain.length % 4)) % 4));
};

/** The key a wire text is kept under: SHA-256 of its trimmed UTF-8, in hex. */
export const wireKey = (text: string) => toHex(sha256(utf8Encode(text.trim())));

export const isInvite = (text: string) => INVITE_KEYS.test(text);
/** True for text that is one of ours: an invitation or a sealed message. */
export const isWire = (text: string) => text.startsWith(SEALED) || isInvite(text);

/** The keys in an invitation's text, or null. */
export function inviteBundle(text: string): Uint8Array | null {
  const found = INVITE_KEYS.exec(text);
  return found ? b64d(found[1]) : null;
}

/** `text` cut into pieces of at most PIECE_BYTES of UTF-8, never inside a character. */
export function pieces(text: string): string[] {
  const out: string[] = [];
  let piece = '';
  let bytes = 0;
  for (const ch of text) {
    const len = utf8Encode(ch).length;
    if (bytes + len > PIECE_BYTES && piece) {
      out.push(piece);
      piece = '';
      bytes = 0;
    }
    piece += ch;
    bytes += len;
  }
  if (piece) out.push(piece);
  return out;
}

function compare(a: Uint8Array, b: Uint8Array): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;
}

const bodyOf = (plain: Uint8Array): SealBody => {
  const parsed: unknown = JSON.parse(utf8Decode(plain));
  if (!parsed || typeof parsed !== 'object' || typeof (parsed as { t?: unknown }).t !== 'string') throw new Error('not a body');
  return parsed as SealBody;
};

const encode = (body: SealBody) => utf8Encode(JSON.stringify(body));

function describe(body: SealBody | '!'): Shown {
  if (body === '!') return { kind: 'unreadable' };
  if (body.t === 'text' && typeof body.s === 'string') return { kind: 'text', text: body.s };
  if (body.t === 'hello') return { kind: 'hello' };
  if (body.t === 'invite') return { kind: 'invite-in' };
  return { kind: 'unreadable' };
}

/** What the caller does with Telegram: send a text, and delete messages for everyone. */
export type SealWire = {
  send(chatId: number, text: string, replyTo?: number): Promise<void>;
  /** Recent texts of the chat, newest first: to find our own invitation to delete. */
  recent(chatId: number): Promise<{ id: number; text: string }[]>;
  remove(chatId: number, ids: number[]): Promise<void>;
};

/**
 * The encryption of one Telegram account. Every call runs one after another, so a packet opens
 * once and in order, even when the list and the chat ask at the same time.
 */
export class TelegramSeal {
  private data: SealData | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private listeners = new Set<() => void>();

  private store: SealStore;
  private wire: SealWire;
  /** The line before an invitation's keys, for people without the app. */
  private inviteLine: () => string;

  constructor(store: SealStore, wire: SealWire, inviteLine: () => string) {
    this.store = store;
    this.wire = wire;
    this.inviteLine = inviteLine;
  }

  /** Called after anything changed, so lists and the chat draw again. */
  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private changed() {
    for (const listener of this.listeners) listener();
  }

  private run<T>(job: () => Promise<T>): Promise<T> {
    const next = this.queue.then(job, job);
    this.queue = next.catch(() => undefined);
    return next;
  }

  private async state(): Promise<SealData> {
    if (!this.data) this.data = (await this.store.load()) ?? { seen: [], chats: {} };
    return this.data;
  }

  private chat(data: SealData, chatId: number): SealChat {
    return (data.chats[String(chatId)] ??= { state: 'NONE' });
  }

  private async account(data: SealData): Promise<Uint8Array> {
    if (!data.account) {
      data.account = b64e(await newAccount());
      await this.store.save(data);
    }
    return b64d(data.account);
  }

  private async keep(data: SealData) {
    await this.store.save(data);
    this.changed();
  }

  /** Where the encryption stands in each chat that has begun it. */
  infos(): Promise<Map<number, SealInfo>> {
    return this.run(async () => {
      const out = new Map<number, SealInfo>();
      for (const [id, c] of Object.entries((await this.state()).chats)) {
        if (c.state !== 'NONE') out.set(Number(id), { state: c.state, verified: !!c.verified, keysChanged: !!c.changed, sealed: !!c.conv });
      }
      return out;
    });
  }

  /** Sends an invitation with this account's public keys into the chat. */
  invite(chatId: number): Promise<void> {
    return this.run(async () => {
      const data = await this.state();
      const bundle = await accountBundle(await this.account(data));
      await this.wire.send(chatId, `${this.inviteLine()}\n\n${INVITE}${b64e(bundle)}`);
      const c = this.chat(data, chatId);
      if (c.state !== 'ACTIVE') {
        c.state = 'INVITED';
        await this.keep(data);
      }
    });
  }

  /** Accepts the invitation that came into the chat: the first sealed message finishes it. */
  accept(chatId: number): Promise<void> {
    return this.run(async () => {
      const data = await this.state();
      const c = this.chat(data, chatId);
      if (!c.bundle_in) return;
      const bundle = b64d(c.bundle_in);
      const hello: SealBody = { t: 'hello' };
      const started = await startConversation(await this.account(data), bundle, encode(hello));
      c.conv = b64e(started.conversation);
      c.peer = b64e(await bundleIdentity(bundle));
      c.mine = true;
      c.state = 'ACTIVE';
      delete c.bundle_in;
      const wire = SEALED + b64e(started.packet);
      (c.msgs ??= {})[wireKey(wire)] = hello;
      await this.keep(data);
      await this.wire.send(chatId, wire);
      await this.cleanUp(data, chatId);
    });
  }

  /** Turns down an invitation that came in. */
  decline(chatId: number): Promise<void> {
    return this.run(async () => {
      const data = await this.state();
      const c = data.chats[String(chatId)];
      if (!c) return;
      delete c.bundle_in;
      c.state = c.conv ? 'ACTIVE' : 'NONE';
      await this.keep(data);
    });
  }

  /** Sends `text` sealed, in pieces when long; the first piece answers `replyTo`. */
  send(chatId: number, text: string, replyTo?: number): Promise<void> {
    return this.run(async () => {
      const data = await this.state();
      const c = this.chat(data, chatId);
      if (!c.conv) throw new Error('This chat is not encrypted');
      const all = pieces(text);
      for (let i = 0; i < all.length; i++) {
        const body: SealBody = { t: 'text', s: all[i] };
        const sealed = await seal(b64d(c.conv), encode(body));
        c.conv = b64e(sealed.conversation);
        const wire = SEALED + b64e(sealed.packet);
        (c.msgs ??= {})[wireKey(wire)] = body;
        await this.keep(data);
        await this.wire.send(chatId, wire, i === 0 ? replyTo : undefined);
      }
    });
  }

  /** The sixty digits to compare with the other person; null before the chat is encrypted. */
  safetyNumber(chatId: number): Promise<string | null> {
    return this.run(async () => {
      const data = await this.state();
      const peer = data.chats[String(chatId)]?.peer;
      if (!peer) return null;
      return safetyNumber(await accountIdentity(await this.account(data)), b64d(peer));
    });
  }

  setVerified(chatId: number, verified: boolean): Promise<void> {
    return this.run(async () => {
      const data = await this.state();
      const c = data.chats[String(chatId)];
      if (!c) return;
      c.verified = verified;
      c.changed = false;
      await this.keep(data);
    });
  }

  /**
   * What a message of ours shows, opening it the first time it is seen. Null for text that is not
   * ours. Called for each message drawn and for each that comes in; opening happens once.
   */
  shown(chatId: number, messageId: number, text: string, outgoing: boolean): Promise<Shown | null> {
    if (!isWire(text)) return Promise.resolve(null);
    return this.run(async () => {
      const data = await this.state();
      const c = this.chat(data, chatId);
      const key = wireKey(text);
      const kept = c.msgs?.[key];
      if (kept) return describe(kept);
      if (outgoing) return text.startsWith(SEALED) ? { kind: 'unreadable' } : { kind: 'invite-out' };
      return this.receive(data, c, chatId, messageId, text, key);
    });
  }

  private async receive(data: SealData, c: SealChat, chatId: number, messageId: number, text: string, key: string): Promise<Shown> {
    try {
      if (!text.startsWith(SEALED)) {
        // An invitation: kept for the card, and its message for deleting once accepted.
        const bundle = inviteBundle(text);
        if (!bundle) throw new Error('no keys');
        const theirs = b64e(await bundleIdentity(bundle));
        const active = c.state === 'ACTIVE';
        if (!(active && c.peer === theirs)) {
          c.bundle_in = b64e(bundle);
          c.state = 'INVITE_IN';
          if (active) c.changed = true;
        }
        (c.invites ??= []).push(messageId);
        const body: SealBody = { t: 'invite' };
        (c.msgs ??= {})[key] = body;
        await this.keep(data);
        return describe(body);
      }
      const packet = b64d(text.slice(SEALED.length).trim());
      const kind = await packetKind(packet);
      let plain: Uint8Array;
      if (kind === 'first') {
        const first = await this.acceptFirst(data, c, chatId, packet);
        if (!first) return this.fail(data, c, key);
        plain = first;
      } else if (kind === 'following') {
        // No conversation yet: its first message has not been opened. Not kept as failed, so it
        // opens once the first one has.
        if (!c.conv) return { kind: 'unreadable' };
        const opened = await open(b64d(c.conv), packet);
        c.conv = b64e(opened.conversation);
        plain = opened.plaintext;
      } else {
        return this.fail(data, c, key);
      }
      const body = bodyOf(plain);
      (c.msgs ??= {})[key] = body;
      await this.keep(data);
      return describe(body);
    } catch {
      return this.fail(data, c, key);
    }
  }

  /** A first message: the other side accepted our invitation, or one crossed ours. Null for a replayed one. */
  private async acceptFirst(data: SealData, c: SealChat, chatId: number, packet: Uint8Array): Promise<Uint8Array | null> {
    const id = toHex(await firstMessageId(packet));
    if (data.seen.includes(id)) return null;
    const account = await this.account(data);
    const accepted = await acceptConversation(account, packet);
    data.seen.push(id);
    while (data.seen.length > MAX_SEEN) data.seen.shift();
    const theirsBytes = await conversationPeer(accepted.conversation);
    const theirs = b64e(theirsBytes);
    const mine = await accountIdentity(account);
    // Both accepted each other's invitation at once: the conversation started by the side with
    // the lower identity key wins on both phones.
    const keepOurs = c.state === 'ACTIVE' && !!c.mine && compare(mine, theirsBytes) < 0;
    if (!keepOurs) {
      const samePeer = c.peer === theirs;
      c.conv = b64e(accepted.conversation);
      c.peer = theirs;
      c.mine = false;
      c.state = 'ACTIVE';
      delete c.bundle_in;
      if (!samePeer) {
        if (c.verified) c.changed = true;
        c.verified = false;
      }
    }
    void this.cleanUp(data, chatId).catch(() => undefined);
    return accepted.plaintext;
  }

  private async fail(data: SealData, c: SealChat, key: string): Promise<Shown> {
    (c.msgs ??= {})[key] = '!';
    await this.keep(data);
    return { kind: 'unreadable' };
  }

  /** Once encrypted, the invitations go for both: the keys in them are public, but need not stay in Telegram. */
  private async cleanUp(data: SealData, chatId: number) {
    const c = data.chats[String(chatId)];
    const ids = new Set<number>(c?.invites ?? []);
    try {
      for (const m of await this.wire.recent(chatId)) if (isInvite(m.text)) ids.add(m.id);
    } catch {
      // The invitations that came in are still known.
    }
    if (ids.size === 0) return;
    await this.wire.remove(chatId, [...ids]).catch(() => undefined);
    if (c) {
      delete c.invites;
      await this.keep(data);
    }
  }

  /**
   * Takes in what the ErevosGram app kept: its account, its first messages seen and its chats, in
   * the same fields. Chats already here stay as they are; the account is taken only when none was
   * made here yet, or `replace` says so (then this account's own chats go: their keys were its).
   */
  adopt(from: SealData, replace = false): Promise<{ chats: number; account: boolean }> {
    return this.run(async () => {
      const data = await this.state();
      const takeAccount = !!from.account && (replace || !data.account);
      if (takeAccount) {
        data.account = from.account;
        data.seen = [...from.seen].slice(-MAX_SEEN);
        if (replace) data.chats = {};
      }
      let chats = 0;
      if (takeAccount) {
        for (const [id, c] of Object.entries(from.chats ?? {})) {
          if (data.chats[id] && data.chats[id].state !== 'NONE') continue;
          data.chats[id] = c;
          chats++;
        }
      }
      await this.keep(data);
      return { chats, account: takeAccount };
    });
  }
}
