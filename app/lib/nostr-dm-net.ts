// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { canNostr, canTorHttp, nostrCore, torHttp } from './core';
import { utf8Decode } from './crypto';
import { t } from './i18n';
import { fetchCapped } from './net-http';
import { accountNeverStraight, accountThroughTor, type AccountTor } from './account-tor';
import { ensureTor } from './tor';

// How Erevos reaches Nostr relays for the chats with other Nostr apps (lib/nostr-dm.ts,
// docs/nostr-chats.md): through Tor on Android, on the core's own connection (crates/erevos-tor, as
// lib/nostr.ts does), while the space's Tor way says so; straight over WebSocket otherwise, and in
// the web app and on the computer, which have no Tor. JSON frames both ways (NIP-01).
//
// A relay (NostrRelay) is one connection: what is sent on it, the subscriptions it keeps, and the
// answers it waits for. One that reads the space's messages answers a relay that asks who reads
// (NIP-42 AUTH), as an inbox relay keeps its wraps for their reader only; one that sends never
// does, so no relay learns whose key sent what.

export type NostrEvent = { id: string; pubkey: string; created_at: number; kind: number; tags: string[][]; content: string; sig: string };
export type NostrFilter = Record<string, unknown>;

export type NostrLink = {
  tor: boolean;
  send(frame: unknown[]): Promise<void>;
  /** The relay's next frame, or null after `ms` of nothing. Throws once the connection ended. */
  next(ms: number): Promise<unknown[] | null>;
  close(): void;
};

/** `chat`: a chat's own circuits through Tor (openNostrLink), when given. */
export type NostrOpen = (url: string, chat?: string, choice?: AccountTor) => Promise<NostrLink>;

let opener: NostrOpen | null = null;

/** For the checks: relays of their own. */
export function setNostrOpen(next: NostrOpen | null): void {
  opener = next;
}

function be8(n: number): Uint8Array {
  const out = new Uint8Array(8);
  new DataView(out.buffer).setBigUint64(0, BigInt(Math.max(0, Math.round(n))));
  return out;
}

function parsed(frame: string): unknown[] | null {
  try {
    const said = JSON.parse(frame) as unknown;
    return Array.isArray(said) ? said : null;
  } catch {
    return null;
  }
}

async function torLink(url: string, chat?: string): Promise<NostrLink> {
  const core = nostrCore();
  // A chat's name after a line break: circuits of that chat's own (crates/erevos-ffi text_open).
  const id = await core.torTextOpen(chat ? `${url}\n${chat}` : url);
  return {
    tor: true,
    async send(frame) {
      await core.torTextSend(id, JSON.stringify(frame));
    },
    async next(ms) {
      const until = Date.now() + ms;
      for (;;) {
        const frame = await core.torTextNext(id, be8(Math.max(1, until - Date.now())));
        if (frame === '') return null;
        const said = parsed(frame);
        if (said) return said;
        if (Date.now() >= until) return null;
      }
    },
    close() {
      core.torTextClose(id).catch(() => undefined);
    },
  };
}

// The most frames kept that the app has not read yet: a relay that floods is cut off.
const KEPT_MOST = 5000;
const OPEN_WAIT = 20_000;

function socketLink(url: string): Promise<NostrLink> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const frames: unknown[][] = [];
    let ended: Error | null = null;
    let wake: (() => void) | null = null;
    const woken = () => {
      const w = wake;
      wake = null;
      w?.();
    };
    const end = (error: Error) => {
      if (ended) return;
      ended = error;
      clearTimeout(timer);
      reject(error);
      woken();
    };
    const timer = setTimeout(() => {
      end(new Error(t('The Nostr relay did not answer.')));
      socket.close();
    }, OPEN_WAIT);
    const link: NostrLink = {
      tor: false,
      async send(frame) {
        if (ended) throw ended;
        socket.send(JSON.stringify(frame));
      },
      async next(ms) {
        if (!frames.length && !ended) {
          await new Promise<void>((done) => {
            const timeout = setTimeout(() => {
              wake = null;
              done();
            }, ms);
            wake = () => {
              clearTimeout(timeout);
              done();
            };
          });
        }
        if (frames.length) return frames.shift()!;
        if (ended) throw ended;
        return null;
      },
      close() {
        end(new Error(t('The connection to the Nostr relay ended.')));
        try {
          socket.close();
        } catch {
          // Closed already.
        }
      },
    };
    socket.onopen = () => {
      clearTimeout(timer);
      resolve(link);
    };
    socket.onmessage = (message: { data: unknown }) => {
      if (typeof message.data !== 'string') return;
      const said = parsed(message.data);
      if (!said) return;
      if (frames.length >= KEPT_MOST) {
        link.close();
        return;
      }
      frames.push(said);
      woken();
    };
    socket.onclose = () => end(new Error(t('The connection to the Nostr relay ended.')));
    socket.onerror = () => end(new Error(t('Could not reach the Nostr relay.')));
  });
}

/** A connection to the relay at `url` straight over WebSocket, never through Tor: for the space's
 *  own Nostr chats (lib/nostr.ts) when its Tor way is Nothing. */
export function openNostrStraight(url: string): Promise<NostrLink> {
  return opener ? opener(url) : socketLink(url);
}

/** Whether the relays are reached through Tor now, on Android, as the account's Tor choice says
 *  (lib/account-tor.ts): 'space' (the way of the space's own Nostr, lib/nostr.ts) as the space's Tor way says. */
export function nostrChatsThroughTor(choice: AccountTor = 'space'): boolean {
  return canNostr() && accountThroughTor(choice);
}

/** How a connection goes with the account's choice now: through Tor, or straight should Tor
 *  fail ('tor'); only through Tor ('tor only'); or straight. */
export function nostrWay(choice: AccountTor): 'tor' | 'tor only' | 'straight' {
  if (accountNeverStraight(choice)) return 'tor only';
  return nostrChatsThroughTor(choice) ? 'tor' : 'straight';
}

/** A connection to the relay at `url`, as the account's Tor `choice` says (nostrWay); for the
 *  chat `chat`, through Tor only on its own circuits. */
export async function openNostrLink(url: string, chat?: string, choice: AccountTor = 'space'): Promise<NostrLink> {
  if (opener) return opener(url, chat, choice);
  if (chat) return chatTorLink(url, chat);
  const way = nostrWay(choice);
  if (way === 'straight') return socketLink(url);
  try {
    if (!canNostr()) throw new Error(t('Tor is not ready.'));
    // Always: Tor started for it when the space's way did not.
    if (choice === 'always') await ensureTor();
    return await torLink(url);
  } catch (error) {
    if (way === 'tor only') throw error;
  }
  return socketLink(url);
}

/** Whether this build reaches relays through Tor at all (Android): a chat sent through Tor by itself needs it. */
export function canNostrTor(): boolean {
  return canNostr();
}

/**
 * A connection for one chat sent through Tor by itself (NostrDmChat.tor): through Tor only,
 * whatever the space's Tor way, on circuits of the chat's own, so no exit carries its messages and
 * another's. Tor is started for it when the way did not; never straight, so it fails without Tor.
 */
async function chatTorLink(url: string, chat: string): Promise<NostrLink> {
  if (!canNostr()) throw new Error(t('Tor is not ready.'));
  await ensureTor();
  return torLink(url, chat);
}

/** Asks a relay to keep it from now on. */
type Subscription = { filters: NostrFilter[]; event: (event: NostrEvent) => void; eose?: () => void; closed?: (why: string) => void; asked: boolean };

/** Signs what a relay asks to prove who reads (NIP-42): the space's key, for a relay that reads only. */
export type NostrAuth = (relay: string, challenge: string) => Promise<NostrEvent>;

const ANSWER_WAIT = 15_000;
const FRAME_WAIT = 25_000;

/** One connection to one relay, with the subscriptions it keeps and the events it waits to hear were taken. */
export class NostrRelay {
  readonly url: string;
  private readonly auth: NostrAuth | null;
  private link: NostrLink | null = null;
  private readonly subs = new Map<string, Subscription>();
  private readonly oks = new Map<string, { done: (ok: boolean, why: string) => void }>();
  private authed: Promise<boolean> | null = null;
  private challenge = '';
  private ended: Error | null = null;
  private made = 0;
  private endListeners = new Set<(error: Error) => void>();

  private constructor(url: string, auth: NostrAuth | null) {
    this.url = url;
    this.auth = auth;
  }

  /** Connects: `auth` for a connection that reads the space's messages, null for one that only sends or looks up;
   *  `chat` for one of a chat's own, through Tor only (openNostrLink). */
  static async open(url: string, auth: NostrAuth | null, chat?: string, choice: AccountTor = 'space'): Promise<NostrRelay> {
    const relay = new NostrRelay(url, auth);
    relay.link = await openNostrLink(url, chat, choice);
    void relay.pump();
    return relay;
  }

  get open(): boolean {
    return !this.ended;
  }

  get tor(): boolean {
    return this.link?.tor ?? false;
  }

  /** Called once, when the connection ends. */
  onEnd(listener: (error: Error) => void): () => void {
    if (this.ended) {
      listener(this.ended);
      return () => undefined;
    }
    this.endListeners.add(listener);
    return () => this.endListeners.delete(listener);
  }

  /** Waits until it ends. */
  whenEnded(): Promise<Error> {
    return new Promise((resolve) => this.onEnd(resolve));
  }

  private async pump(): Promise<void> {
    const link = this.link!;
    try {
      while (!this.ended) {
        const frame = await link.next(FRAME_WAIT);
        if (frame) this.take(frame);
      }
    } catch (error) {
      this.end(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private end(error: Error): void {
    if (this.ended) return;
    this.ended = error;
    this.link?.close();
    for (const { done } of this.oks.values()) done(false, error.message);
    this.oks.clear();
    for (const sub of this.subs.values()) sub.closed?.(error.message);
    this.subs.clear();
    this.endListeners.forEach((listener) => listener(error));
    this.endListeners.clear();
  }

  close(): void {
    this.end(new Error(t('The connection to the Nostr relay ended.')));
  }

  private take(frame: unknown[]): void {
    const [type, a, b, c] = frame;
    if (type === 'EVENT' && typeof a === 'string') {
      const sub = this.subs.get(a);
      if (sub && isEvent(b)) sub.event(b);
    } else if (type === 'EOSE' && typeof a === 'string') {
      this.subs.get(a)?.eose?.();
    } else if (type === 'OK' && typeof a === 'string') {
      const waiting = this.oks.get(a);
      if (waiting) {
        this.oks.delete(a);
        waiting.done(b === true, typeof c === 'string' ? c : '');
      }
    } else if (type === 'CLOSED' && typeof a === 'string') {
      const sub = this.subs.get(a);
      const why = typeof b === 'string' ? b : '';
      if (!sub) return;
      // Closed until we say who reads: asked again once we have.
      if (why.startsWith('auth-required:') && this.auth) {
        sub.asked = false;
        void this.authenticate().then((ok) => {
          if (ok && this.subs.get(a) === sub && !sub.asked) {
            sub.asked = true;
            void this.link?.send(['REQ', a, ...sub.filters]).catch(() => undefined);
          } else if (!ok) {
            this.subs.delete(a);
            sub.closed?.(why);
          }
        });
        return;
      }
      this.subs.delete(a);
      sub.closed?.(why);
    } else if (type === 'AUTH' && typeof a === 'string') {
      this.challenge = a;
      this.authed = null;
      // A relay that reads ours: say who reads before it is asked again.
      if (this.auth) void this.authenticate();
    }
  }

  private authenticate(): Promise<boolean> {
    if (!this.auth) return Promise.resolve(false);
    if (this.authed) return this.authed;
    const challenge = this.challenge;
    this.authed = (async () => {
      if (!challenge) return false;
      const event = await this.auth!(this.url, challenge);
      const ok = this.answer(event.id);
      await this.link!.send(['AUTH', event]);
      return (await ok).ok;
    })().catch(() => false);
    return this.authed;
  }

  private answer(id: string): Promise<{ ok: boolean; why: string }> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.oks.delete(id);
        resolve({ ok: false, why: t('The Nostr relay did not answer.') });
      }, ANSWER_WAIT);
      this.oks.set(id, {
        done: (ok, why) => {
          clearTimeout(timer);
          resolve({ ok, why });
        },
      });
    });
  }

  /** Sends `event`; answers whether the relay took it, and why not. */
  async publish(event: NostrEvent): Promise<{ ok: boolean; why: string }> {
    if (this.ended) return { ok: false, why: this.ended.message };
    const answered = this.answer(event.id);
    try {
      await this.link!.send(['EVENT', event]);
    } catch (error) {
      return { ok: false, why: error instanceof Error ? error.message : String(error) };
    }
    const first = await answered;
    // A relay that reads ours and wants to know who sends: once more, after saying.
    if (!first.ok && first.why.startsWith('auth-required:') && this.auth && (await this.authenticate())) {
      const again = this.answer(event.id);
      await this.link!.send(['EVENT', event]).catch(() => undefined);
      return again;
    }
    return first;
  }

  /** Keeps asking for `filters`: each event as it comes, `eose` once what was stored came. Returns how to stop. */
  subscribe(filters: NostrFilter[], event: (event: NostrEvent) => void, eose?: () => void, closed?: (why: string) => void): () => void {
    const id = `e${++this.made}${Math.random().toString(36).slice(2, 8)}`;
    const sub: Subscription = { filters, event, eose, closed, asked: true };
    this.subs.set(id, sub);
    void this.link!.send(['REQ', id, ...filters]).catch(() => undefined);
    return () => {
      if (this.subs.delete(id) && !this.ended) void this.link!.send(['CLOSE', id]).catch(() => undefined);
    };
  }

  /** What the relay has for `filters`, up to `ms`: the events stored, then it stops asking. */
  async query(filters: NostrFilter[], ms = 8000): Promise<NostrEvent[]> {
    return (await this.ask(filters, ms)).events;
  }

  /**
   * As query, and how the relay answered: 'all' once it said it sent all it keeps (EOSE), 'closed'
   * when it closed the ask or the connection ended (with why), 'late' when `ms` went by first.
   */
  ask(filters: NostrFilter[], ms = 8000): Promise<{ events: NostrEvent[]; how: 'all' | 'closed' | 'late'; why?: string }> {
    if (this.ended) return Promise.resolve({ events: [], how: 'closed', why: this.ended.message });
    return new Promise((resolve) => {
      const got: NostrEvent[] = [];
      let stop = () => undefined as unknown;
      const done = (how: 'all' | 'closed' | 'late', why?: string) => {
        clearTimeout(timer);
        stop();
        resolve(why ? { events: got, how, why } : { events: got, how });
      };
      const timer = setTimeout(() => done('late'), ms);
      stop = this.subscribe(
        filters,
        (event) => got.push(event),
        () => done('all'),
        (why) => done('closed', why),
      );
    });
  }
}

export function isEvent(value: unknown): value is NostrEvent {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.pubkey === 'string' &&
    typeof e.created_at === 'number' &&
    typeof e.kind === 'number' &&
    Array.isArray(e.tags) &&
    e.tags.every((tag) => Array.isArray(tag) && tag.every((part) => typeof part === 'string')) &&
    typeof e.content === 'string' &&
    typeof e.sig === 'string'
  );
}

// The most a domain's nostr.json may be: names and relays, a few kilobytes as domains keep them.
const NIP05_MOST = 1024 * 1024;

/** A NIP-05 name's key and the relays it names, as its domain's /.well-known/nostr.json says:
 *  through Tor as relays are, straight otherwise. */
export async function lookUpNip05(name: string, choice: AccountTor = 'space'): Promise<{ public: string; relays: string[] } | null> {
  const match = /^([a-z0-9._-]+)@([a-z0-9.-]+\.[a-z]{2,})$/i.exec(name.trim());
  if (!match) return null;
  const [, local, domain] = match;
  const url = `https://${domain.toLowerCase()}/.well-known/nostr.json?name=${encodeURIComponent(local.toLowerCase())}`;
  let text: string;
  const way = nostrWay(choice);
  if (canTorHttp() && way !== 'straight') {
    if (choice === 'always') await ensureTor();
    const answer = await torHttp(JSON.stringify({ method: 'GET', url, headers: { Accept: 'application/json' } }), new Uint8Array(0));
    const status = (answer[0] << 8) | answer[1];
    if (status !== 200 || answer.length - 2 > NIP05_MOST) return null;
    text = utf8Decode(answer.slice(2));
  } else {
    if (way === 'tor only') throw new Error(t('Tor is not ready.'));
    // Read as it comes, and stopped once it is too large (lib/net-http.ts): a domain answers what it likes.
    const { response, bytes } = await fetchCapped(url, { headers: { Accept: 'application/json' } }, NIP05_MOST);
    if (!response.ok) return null;
    text = utf8Decode(bytes);
  }
  let json: { names?: Record<string, unknown>; relays?: Record<string, unknown> };
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    return null;
  }
  const key = json.names?.[local.toLowerCase()] ?? json.names?.[local];
  if (typeof key !== 'string' || !/^[0-9a-f]{64}$/.test(key)) return null;
  const relays = json.relays?.[key];
  return { public: key, relays: Array.isArray(relays) ? relays.filter((r): r is string => typeof r === 'string') : [] };
}
