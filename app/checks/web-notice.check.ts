// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The web app's notice while it is closed (pwa/sw.js): how many messages came since Erevos was last
// open ("3 new messages"), as a relay that counts says in its pushes, or else "New message", or
// "New messages" once more pushes came, or "Call" when only a call rang, in the app's language, on an
// iPhone as on other browsers. And the number on Erevos's icon: what the open space had not read, as
// the app counted it (lib/icon-number.ts), and what came since. And that the open app hears when the
// browser changes its push address. And the worker a space registers for its own push address
// (lib/web-push.web.ts), which only shows notices, with the count the app's worker keeps too.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';

import { LANGS } from '../lib/i18n';
import { iconNumber, type IconParts } from '../lib/icon-number';

// The worker of the plain Erevos's web app (pwa/build.mjs --edition erevos).
const WORKER = readFileSync(join(import.meta.dirname, '../../pwa/sw.js'), 'utf8').replace('__EREVOS_WEB_APP__', 'erevos-web');

type Notice = { title: string; body: string; tag: string; renotify?: boolean; data?: unknown; closed: boolean; close(): void };
type Listener = (event: unknown) => void;

// A browser for the worker: its cache survives a restart of the worker, as a real one does. An
// iPhone keeps every notice of a tag; other browsers replace the one of the same tag, silently
// unless asked to sound again (renotify). Its badges may answer never ('hangs').
function browser(kind: 'iphone' | 'other', store = new Map<string, string>(), badges: 'yes' | 'refused' | 'none' | 'hangs' = 'yes', scope = 'https://erevos.example/') {
  let notices: Notice[] = [];
  // The notices that sounded.
  let sounded = 0;
  // The number on the icon, as the browser shows it: none until one is set.
  let badge = 0;
  const never = () => new Promise<void>(() => undefined);
  const navigator =
    badges === 'none'
      ? {}
      : {
          setAppBadge: async (count: number) => {
            if (badges === 'refused') throw new Error('not allowed');
            if (badges === 'hangs') return never();
            assert.ok(Number.isSafeInteger(count) && count > 0);
            badge = count;
          },
          clearAppBadge: async () => {
            if (badges === 'refused') throw new Error('not allowed');
            if (badges === 'hangs') return never();
            badge = 0;
          },
        };
  const windows: { visibilityState: string; postMessage?: (message: unknown) => void }[] = [];
  let cacheFails = false;
  const caches = {
    open: async () => {
      if (cacheFails) throw new Error('no cache');
      return {
        match: async (key: string) => (store.has(key) ? new Response(store.get(key)) : undefined),
        put: async (key: string, response: Response) => void store.set(key, await response.text()),
      };
    },
  };
  const registration = {
    scope,
    getNotifications: async ({ tag }: { tag: string }) => notices.filter((notice) => notice.tag === tag && !notice.closed),
    showNotification: async (title: string, options: { body: string; tag: string; renotify?: boolean; data?: unknown }) => {
      const replaces = kind === 'other' && notices.some((notice) => notice.tag === options.tag && !notice.closed);
      if (!replaces || options.renotify === true) sounded++;
      if (kind === 'other') notices = notices.filter((notice) => notice.tag !== options.tag);
      notices.push({ title, ...options, closed: false, close() { this.closed = true; } });
    },
  };
  const listeners: Record<string, Listener> = {};
  const self = {
    addEventListener: (type: string, listener: Listener) => void (listeners[type] = listener),
    registration,
    navigator,
    clients: { matchAll: async () => windows },
    skipWaiting: async () => undefined,
    location: { origin: 'https://erevos.example' },
  };
  // Its timers end at once: what waits on one waits no longer than a check should.
  const timers = { setTimeout: (done: () => void) => setTimeout(done, 0), clearTimeout };
  vm.runInContext(WORKER, vm.createContext({ self, caches, Response, URL, crypto, TextEncoder, TextDecoder, ...timers, fetch: async () => { throw new Error('offline'); } }));

  // Fires an event and waits for what it asked the browser to wait for.
  function fire(type: string, data?: unknown): Promise<unknown> {
    let waiting: Promise<unknown> = Promise.resolve();
    let answer: unknown;
    listeners[type]({ data, ports: [{ postMessage: (value: unknown) => (answer = value) }], waitUntil: (work: Promise<unknown>) => (waiting = work) });
    return waiting.then(() => answer);
  }

  return {
    store,
    windows,
    failCache: () => (cacheFails = true),
    // A push, empty or with what a relay that counts puts in it, as the browser opened it.
    push: (bytes?: Uint8Array) => fire('push', bytes ? { arrayBuffer: () => bytes.slice().buffer } : null),
    tell: (question: Record<string, unknown>) => fire('message', question),
    // The browser changed its push address, or dropped it.
    addressChanged: () => fire('pushsubscriptionchange'),
    install: () => fire('install'),
    activate: () => fire('activate'),
    // A page asked of the worker: its status, and where it sends it.
    navigate: async (path: string) => {
      let answer: Promise<Response> | undefined;
      listeners.fetch({ request: { url: `https://erevos.example${path}`, method: 'GET', mode: 'navigate' }, respondWith: (response: Response | Promise<Response>) => (answer = Promise.resolve(response)), waitUntil: () => undefined });
      const response = await answer!;
      return `${response.status} ${response.headers.get('location') ?? ''}`;
    },
    shown: () => notices.filter((notice) => !notice.closed).map((notice) => notice.body),
    sounded: () => sounded,
    badge: () => badge,
    // The pushes counted since Erevos was last open, as the worker keeps them.
    count: () => (JSON.parse(store.get('/__erevos/notice') ?? '{"pushes":0}') as { pushes: number }).pushes,
    // The streams the worker keeps, as anyone who can read the browser's storage sees them: the
    // notice's, and the icon's.
    streams: () => Object.keys((JSON.parse(store.get('/__erevos/notice') ?? '{}') as { streams?: object }).streams ?? {}),
    iconStreams: () => Object.keys((JSON.parse(store.get('/__erevos/notice') ?? '{}') as { cameStreams?: object }).cameStreams ?? {}),
    // The rounds told, as the worker keeps them once Erevos was open.
    told: () => (JSON.parse(store.get('/__erevos/notice') ?? '{}') as { told?: object[] }).told ?? [],
  };
}

// What a relay that counts puts in a push (crates/erevos-relay/src/push.rs): version 1, flags
// (none), the queue's stream, the round, and the round's totals so far: messages, sends that did
// not say what they carry, and calls that rang.
function counted(stream: number, round: number, total: number, unmarked = 0, rings = 0): Uint8Array {
  const bytes = new Uint8Array(26);
  const view = new DataView(bytes.buffer);
  bytes[0] = 1;
  view.setUint32(6, stream);
  view.setUint32(10, round);
  view.setUint32(14, total);
  view.setUint32(18, unmarked);
  view.setUint32(22, rings);
  return bytes;
}

// As a relay that says when it sent each push does: flag 1, and the time, in seconds since 1970.
function timed(sentAt: number, stream: number, round: number, total: number, unmarked = 0, rings = 0): Uint8Array {
  const bytes = new Uint8Array(30);
  bytes.set(counted(stream, round, total, unmarked, rings));
  bytes[1] = 1;
  new DataView(bytes.buffer).setUint32(26, sentAt);
  return bytes;
}

const now = () => Math.floor(Date.now() / 1000);

test('pushes while Erevos is closed show one notice, and opening Erevos starts again', async () => {
  const other = browser('other');
  await other.push();
  assert.deepEqual(other.shown(), ['New message']);
  await other.push();
  await other.push();
  assert.deepEqual(other.shown(), ['New messages']);
  assert.equal(other.count(), 3);
  assert.equal(await other.tell({ erevos: 'seen' }), true);
  assert.deepEqual(other.shown(), []);
  assert.equal(other.count(), 0);
  await other.push();
  assert.deepEqual(other.shown(), ['New message']);
});

test('on an iPhone, which keeps every notice, the older ones close once the new one shows', async () => {
  const iphone = browser('iphone');
  await iphone.push();
  await iphone.push();
  await iphone.push();
  assert.deepEqual(iphone.shown(), ['New messages']);
});

test('the count does not live in the notices: swiping them away does not start it again', async () => {
  const iphone = browser('iphone');
  await iphone.push();
  // Swiped away, without opening Erevos.
  const swiped = browser('iphone', iphone.store);
  await swiped.push();
  assert.deepEqual(swiped.shown(), ['New messages']);
  assert.equal(swiped.count(), 2);
});

test('pushes that come together are each counted once', async () => {
  const other = browser('other');
  await Promise.all([other.push(), other.push(), other.push()]);
  assert.equal(other.count(), 3);
  assert.deepEqual(other.shown(), ['New messages']);
  await Promise.all([other.push(), other.tell({ erevos: 'seen' }), other.push()]);
  assert.equal(other.count(), 1);
  assert.deepEqual(other.shown(), ['New message']);
});

test("the notice speaks the app's language, kept when the worker starts again", async () => {
  const first = browser('other');
  assert.equal(await first.tell({ erevos: 'lang', lang: 'el' }), true);
  await first.push();
  assert.deepEqual(first.shown(), ['Νέο μήνυμα']);
  const again = browser('other', first.store);
  await again.push();
  assert.deepEqual(again.shown(), ['Νέα μηνύματα']);
  // A name that is no language here changes nothing.
  for (const lang of ['constructor', '__proto__', 'xx', 42]) await again.tell({ erevos: 'lang', lang });
  await again.tell({ erevos: 'seen' });
  await again.push();
  assert.deepEqual(again.shown(), ['Νέο μήνυμα']);
});

test("every app language has the notice's words", async () => {
  const words: Record<string, [string, string, string, string]> = {
    en: ['New message', 'New messages', '3 new messages', 'Call'],
    el: ['Νέο μήνυμα', 'Νέα μηνύματα', '3 νέα μηνύματα', 'Κλήση'],
    de: ['Neue Nachricht', 'Neue Nachrichten', '3 neue Nachrichten', 'Anruf'],
    es: ['Mensaje nuevo', 'Mensajes nuevos', '3 mensajes nuevos', 'Llamada'],
    fr: ['Nouveau message', 'Nouveaux messages', '3 nouveaux messages', 'Appel'],
    it: ['Nuovo messaggio', 'Nuovi messaggi', '3 nuovi messaggi', 'Chiamata'],
    pt: ['Nova mensagem', 'Novas mensagens', '3 novas mensagens', 'Chamada'],
    sh: ['Nova poruka', 'Nove poruke', '3 nove poruke', 'Poziv'],
  };
  assert.deepEqual(Object.keys(words).sort(), [...LANGS].sort());
  for (const [lang, [one, more, three, call]] of Object.entries(words)) {
    const other = browser('other');
    await other.tell({ erevos: 'lang', lang });
    await other.push();
    assert.deepEqual(other.shown(), [one]);
    await other.push();
    assert.deepEqual(other.shown(), [more]);
    await other.tell({ erevos: 'seen' });
    await other.push(counted(1, 1, 1));
    assert.deepEqual(other.shown(), [one]);
    await other.push(counted(1, 1, 3));
    assert.deepEqual(other.shown(), [three]);
    await other.tell({ erevos: 'seen' });
    await other.push(counted(2, 1, 0, 0, 1));
    assert.deepEqual(other.shown(), [call]);
  }
});

test('Serbo-Croatian says how many with the right ending', async () => {
  const other = browser('other');
  await other.tell({ erevos: 'lang', lang: 'sh' });
  const said: Record<number, string> = {
    2: '2 nove poruke',
    5: '5 novih poruka',
    11: '11 novih poruka',
    12: '12 novih poruka',
    21: '21 nova poruka',
    22: '22 nove poruke',
    101: '101 nova poruka',
    111: '111 novih poruka',
  };
  for (const [total, words] of Object.entries(said)) {
    await other.tell({ erevos: 'seen' });
    await other.push(counted(1, Number(total), Number(total)));
    assert.deepEqual(other.shown(), [words]);
  }
});

test('a relay that counts: the notice says how many messages came, and a push lost or repeated changes nothing', async () => {
  const iphone = browser('iphone');
  await iphone.push(counted(1, 7, 1));
  assert.deepEqual(iphone.shown(), ['New message']);
  // The push for the second message was lost: the next says the round's total.
  await iphone.push(counted(1, 7, 3));
  assert.deepEqual(iphone.shown(), ['3 new messages']);
  await iphone.push(counted(1, 7, 3));
  assert.deepEqual(iphone.shown(), ['3 new messages']);
  // Another space's queue counts apart.
  await iphone.push(counted(2, 9, 2));
  assert.deepEqual(iphone.shown(), ['5 new messages']);
  // Opened and taken: the relay starts a new round.
  await iphone.tell({ erevos: 'seen' });
  await iphone.push(counted(1, 8, 2));
  assert.deepEqual(iphone.shown(), ['2 new messages']);
  // Kept when the worker starts again.
  const again = browser('iphone', iphone.store);
  await again.push(counted(1, 8, 3));
  assert.deepEqual(again.shown(), ['3 new messages']);
});

test('a push come late, from this round or the ones before, adds only what it had not said', async () => {
  const other = browser('other');
  const said: string[] = [];
  for (const [round, total] of [[7, 3], [7, 4], [7, 3], [7, 5]]) {
    await other.push(counted(1, round, total));
    said.push(other.shown()[0]);
  }
  assert.deepEqual(said, ['3 new messages', '4 new messages', '4 new messages', '5 new messages']);
  await other.tell({ erevos: 'seen' });
  said.length = 0;
  for (const [round, total] of [[8, 2], [9, 1], [8, 3], [9, 2], [8, 3]]) {
    await other.push(counted(1, round, total));
    said.push(other.shown()[0]);
  }
  assert.deepEqual(said, ['2 new messages', '3 new messages', '4 new messages', '5 new messages', '5 new messages']);
  // Kept as it was when the worker starts again.
  const again = browser('other', other.store);
  await again.push(counted(1, 8, 4));
  assert.deepEqual(again.shown(), ['6 new messages']);
  // Come late after more rounds than one: an open tab out of sight empties the queue each time.
  await again.tell({ erevos: 'seen' });
  said.length = 0;
  for (const [round, total] of [[1, 1], [2, 1], [3, 1], [1, 2], [2, 1], [4, 2]]) {
    await again.push(counted(1, round, total));
    said.push(again.shown()[0]);
  }
  assert.deepEqual(said, ['New message', '2 new messages', '3 new messages', '4 new messages', '4 new messages', '6 new messages']);
});

test('the rounds kept by the worker before it kept several go on', async () => {
  const before = { round: 7, total: 3, unmarked: 0, rings: 0, before: { round: 6, total: 1 } };
  const store = new Map([['/__erevos/notice', JSON.stringify({ pushes: 2, messages: 4, exact: true, lang: 'en', streams: { '0000000000000001': before } })]]);
  const other = browser('other', store);
  await other.push(counted(1, 7, 4));
  assert.deepEqual(other.shown(), ['5 new messages']);
  await other.push(counted(1, 6, 2));
  assert.deepEqual(other.shown(), ['6 new messages']);
});

test('opening Erevos forgets which queues pushed, so its storage does not keep them from one open to the next', async () => {
  const other = browser('other');
  await other.push(counted(1, 7, 1));
  await other.push(counted(2, 9, 2));
  assert.equal(other.streams().length, 2);
  await other.tell({ erevos: 'seen' });
  assert.deepEqual(other.streams(), []);
  // Their rounds stay, told, with no stream: numbers the relay drew at random.
  assert.deepEqual(other.told(), [
    { round: 9, total: 2, unmarked: 0, rings: 0 },
    { round: 7, total: 1, unmarked: 0, rings: 0 },
  ]);
  // A queue Erevos did not empty, of a space not opened: its round goes on, and adds only what
  // came since.
  await other.push(counted(2, 9, 5));
  assert.deepEqual(other.shown(), ['3 new messages']);
});

test('a push of a round told before Erevos was open adds nothing after it, and one that goes on only what came since', async () => {
  const other = browser('other');
  await other.push(counted(1, 7, 3));
  assert.deepEqual(other.shown(), ['3 new messages']);
  // Erevos opened and took them; then a push of that round comes late, as to a phone that was offline.
  await other.tell({ erevos: 'seen' });
  await other.push(counted(1, 7, 3));
  await other.push(counted(2, 9, 2));
  assert.deepEqual(other.shown(), ['2 new messages']);
  // The same once the worker starts again.
  await other.tell({ erevos: 'seen' });
  const again = browser('other', other.store);
  await again.push(counted(2, 9, 2));
  await again.push(counted(1, 7, 3));
  // A round that goes on, of a queue Erevos did not empty: its new messages alone.
  await again.push(counted(1, 7, 5));
  assert.deepEqual(again.shown(), ['2 new messages']);
});

test('a push its push service held back, of a round never pushed here, sent before the app last took from its relay, counts nothing', async () => {
  const other = browser('other');
  await other.push(timed(now(), 5, 3, 1));
  // The phone was offline: Erevos opened, took its messages from the relay and read them, and only
  // then does the push come.
  await other.tell({ erevos: 'seen', at: now() });
  await other.tell({ erevos: 'badge', unread: 0, at: now() });
  await other.push(timed(now() - 600, 1, 7, 3));
  assert.deepEqual(other.shown(), ['New message']);
  assert.equal(other.badge(), 0);
  // Its round goes on (a queue Erevos did not empty): what came after it alone, on the icon too.
  await other.push(timed(now(), 1, 7, 5));
  assert.deepEqual(other.shown(), ['2 new messages']);
  assert.equal(other.badge(), 2);
  // A new round sent since counts whole, and so does one a few seconds before, as clocks differ.
  await other.push(timed(now() - 10, 2, 9, 2));
  assert.deepEqual(other.shown(), ['4 new messages']);
  assert.equal(other.badge(), 4);
  // The same once the worker starts again.
  await other.tell({ erevos: 'seen', at: now() });
  const again = browser('other', other.store);
  await again.push(timed(now() - 600, 3, 11, 4));
  assert.deepEqual(again.shown(), ['New message']);
});

test("a relay whose clock is behind the phone's, or ahead of it, has a new round counted all the same", async () => {
  for (const off of [-120, 120]) {
    const other = browser('other');
    // Pushes come as soon as they are sent, by a relay `off` seconds from the phone's clock.
    await other.push(timed(now() + off, 1, 7, 2));
    await other.tell({ erevos: 'seen', at: now() });
    await other.push(timed(now() + off, 2, 9, 3));
    assert.deepEqual(other.shown(), ['3 new messages']);
    // One its push service held back is still told apart.
    await other.tell({ erevos: 'seen', at: now() });
    await other.push(timed(now() + off - 600, 3, 11, 4));
    assert.deepEqual(other.shown(), ['New message']);
  }
});

test('lags of a relay that ran ahead, or a time kept from a phone clock that ran fast, do not make a new round count nothing', async () => {
  // Pushes of a relay two minutes ahead, then of one that is not (another space's, or the same set right).
  const other = browser('other');
  await other.push(timed(now() + 120, 1, 7, 2));
  await other.tell({ erevos: 'seen', at: now() });
  await other.tell({ erevos: 'badge', unread: 0, at: now() });
  await other.push(timed(now(), 2, 9, 3));
  assert.deepEqual(other.shown(), ['3 new messages']);
  assert.equal(other.badge(), 3);
  // What the worker kept while the phone's clock ran an hour fast, now set right.
  const store = new Map([['/__erevos/notice', JSON.stringify({ seenAt: now() + 3600, countedAt: now() + 3600 })]]);
  const again = browser('other', store);
  await again.tell({ erevos: 'seen', at: now() });
  await again.tell({ erevos: 'badge', unread: 0, at: now() });
  await again.push(timed(now(), 3, 11, 4));
  assert.deepEqual(again.shown(), ['4 new messages']);
  assert.equal(again.badge(), 4);
});

test('Erevos opened while offline, taking nothing from its relay, leaves a held-back push its count', async () => {
  const other = browser('other');
  await other.push(timed(now(), 5, 3, 1));
  // The app last took from its relay an hour ago; the push was sent since, while the phone was offline.
  await other.tell({ erevos: 'seen', at: now() - 3600 });
  await other.tell({ erevos: 'badge', unread: 0, at: now() - 3600 });
  await other.push(timed(now() - 600, 1, 7, 3));
  assert.deepEqual(other.shown(), ['3 new messages']);
  assert.equal(other.badge(), 3);
  // Nor does a time from before what the app said, or after now, change what it said.
  await other.tell({ erevos: 'seen', at: now() - 7200 });
  await other.push(timed(now() - 600, 2, 9, 2));
  assert.deepEqual(other.shown(), ['2 new messages']);
  await other.tell({ erevos: 'seen', at: now() + 86400 });
  await other.push(timed(now() - 10, 3, 11, 4));
  assert.deepEqual(other.shown(), ['4 new messages']);
});

test('a push that does not say when it was sent, from a relay before, counts as ever', async () => {
  const other = browser('other');
  await other.tell({ erevos: 'seen', at: now() });
  await other.push(counted(1, 7, 3));
  assert.deepEqual(other.shown(), ['3 new messages']);
  // A time with no flag is no count this worker reads: one thing came.
  const odd = timed(now(), 2, 9, 2);
  odd[1] = 0;
  await other.push(odd);
  assert.deepEqual(other.shown(), ['New messages']);
});

test('an app from before, which does not say when it last took from its relay, has a held-back push counted as ever', async () => {
  const other = browser('other');
  await other.push(timed(now(), 5, 3, 1));
  await other.tell({ erevos: 'seen' });
  await other.push(timed(now() - 600, 1, 7, 3));
  assert.deepEqual(other.shown(), ['3 new messages']);
});

test('on the icon too, a push of a round the app counted adds nothing, and one that goes on only what came since', async () => {
  const iphone = browser('iphone');
  await iphone.tell({ erevos: 'badge', unread: 0 });
  await iphone.push(counted(1, 7, 3));
  assert.equal(iphone.badge(), 3);
  // The app took them and counted: all read.
  await iphone.tell({ erevos: 'badge', unread: 0 });
  assert.equal(iphone.badge(), 0);
  assert.deepEqual(iphone.iconStreams(), []);
  // A push of that round, come late, once the worker starts again.
  const again = browser('iphone', iphone.store);
  await again.push(counted(1, 7, 3));
  assert.equal(again.badge(), 0);
  await again.push(counted(1, 7, 4));
  assert.equal(again.badge(), 1);
});

test('a send that did not say what it carries, or an empty push, leaves the number out until Erevos is open', async () => {
  const other = browser('other');
  await other.push(counted(1, 1, 0, 1));
  assert.deepEqual(other.shown(), ['New message']);
  await other.push(counted(1, 1, 1, 1));
  assert.deepEqual(other.shown(), ['New messages']);
  await other.push(counted(1, 1, 2, 1));
  assert.deepEqual(other.shown(), ['New messages']);
  // Opened and taken: a new round, with a number again.
  await other.tell({ erevos: 'seen' });
  await other.push(counted(1, 2, 2));
  assert.deepEqual(other.shown(), ['2 new messages']);
  await other.push();
  assert.deepEqual(other.shown(), ['New messages']);
  // What is not a count this worker knows is as an empty push.
  await other.tell({ erevos: 'seen' });
  const later = counted(1, 1, 9);
  later[0] = 2;
  for (const bytes of [later, counted(1, 1, 9).slice(0, 25), counted(1, 1, 9).slice(0, 18), new Uint8Array(0)]) await other.push(bytes);
  assert.deepEqual(other.shown(), ['New messages']);
  assert.equal(other.count(), 4);
});

test('a call that rang, with no message since Erevos was open, says so; with messages, the number', async () => {
  const other = browser('other');
  await other.push(counted(1, 5, 0, 0, 1));
  assert.deepEqual(other.shown(), ['Call']);
  // The same push come twice.
  await other.push(counted(1, 5, 0, 0, 1));
  assert.deepEqual(other.shown(), ['Call']);
  await other.push(counted(1, 5, 2, 0, 1));
  assert.deepEqual(other.shown(), ['2 new messages']);
  // Another call: the messages are still what to tell of.
  await other.push(counted(1, 5, 2, 0, 2));
  assert.deepEqual(other.shown(), ['2 new messages']);
  // Opening Erevos starts again: a message alone is a message.
  await other.tell({ erevos: 'seen' });
  await other.push(counted(1, 6, 1));
  assert.deepEqual(other.shown(), ['New message']);
  // With a send that did not say what it carries, no number and no call: one thing came, in
  // whichever order the pushes come.
  const orders = [
    [counted(1, 7, 0, 1, 1)],
    [counted(1, 8, 0, 0, 1), counted(1, 8, 0, 1, 1)],
    [counted(1, 9, 0, 1), counted(1, 9, 0, 1, 1)],
  ];
  for (const pushes of orders) {
    await other.tell({ erevos: 'seen' });
    for (const bytes of pushes) await other.push(bytes);
    assert.deepEqual(other.shown(), ['New message']);
  }
  // Nor with an empty push.
  await other.tell({ erevos: 'seen' });
  await other.push(counted(1, 10, 0, 0, 1));
  await other.push();
  assert.deepEqual(other.shown(), ['New message']);
  // A call while Erevos is on the screen says so, but is not kept for later.
  await other.tell({ erevos: 'seen' });
  other.windows.push({ visibilityState: 'visible' });
  await other.push(counted(2, 1, 0, 0, 1));
  assert.deepEqual(other.shown(), ['Call']);
  await other.push(counted(2, 1, 1, 0, 1));
  assert.deepEqual(other.shown(), ['New message']);
  other.windows.pop();
  assert.equal(other.count(), 0);
  // Erevos left the screen, having taken its messages: a new round.
  await other.tell({ erevos: 'seen' });
  await other.push(counted(2, 2, 1));
  assert.deepEqual(other.shown(), ['New message']);
});

test('a count kept by the worker before counts were sent goes on without a number', async () => {
  const store = new Map([['/__erevos/notice', JSON.stringify({ count: 2, lang: 'el' })]]);
  const iphone = browser('iphone', store);
  await iphone.push(counted(1, 1, 1));
  assert.deepEqual(iphone.shown(), ['Νέα μηνύματα']);
  assert.equal(iphone.count(), 3);
  await iphone.tell({ erevos: 'seen' });
  await iphone.push(counted(1, 2, 2));
  assert.deepEqual(iphone.shown(), ['2 νέα μηνύματα']);
});

test('a push while Erevos is on the screen still shows, but is not counted', async () => {
  const other = browser('other');
  other.windows.push({ visibilityState: 'visible' });
  await other.push();
  await other.push();
  assert.deepEqual(other.shown(), ['New message']);
  assert.equal(other.count(), 0);
  other.windows[0].visibilityState = 'hidden';
  await other.push();
  await other.push();
  assert.deepEqual(other.shown(), ['New messages']);

  // Nor is the queue it came for kept.
  const counting = browser('other');
  counting.windows.push({ visibilityState: 'visible' });
  await counting.push(counted(1, 1, 2));
  assert.deepEqual(counting.shown(), ['New message']);
  assert.deepEqual(counting.streams(), []);
});

test('without its cache the worker still shows a notice for every push', async () => {
  const other = browser('other');
  other.failCache();
  await other.push();
  assert.deepEqual(other.shown(), ['New message']);
  assert.equal(await other.tell({ erevos: 'seen' }), false);
});

test('each notice sounds, where another browser would replace the one before silently', async () => {
  for (const kind of ['other', 'iphone'] as const) {
    const one = browser(kind);
    await one.push(counted(1, 7, 1));
    await one.push(counted(1, 7, 2));
    await one.push();
    assert.equal(one.sounded(), 3, kind);
  }
});

test('a push address the browser changed is told to every open window, and the worker keeps nothing', async () => {
  const other = browser('other');
  const said: unknown[] = [];
  const window = (visibilityState: string) => ({ visibilityState, postMessage: (message: unknown) => void said.push((message as { erevos?: unknown }).erevos) });
  other.windows.push(window('hidden'), window('visible'));
  await other.addressChanged();
  assert.deepEqual(said, ['push-changed', 'push-changed']);
  assert.equal(other.store.size, 0);
  // None open: nothing to tell, and nothing fails.
  await browser('iphone').addressChanged();
});

test("the icon shows what the open space had not read, and what came since Erevos was on the screen", async () => {
  const iphone = browser('iphone');
  // Erevos leaves the screen with 2 not read.
  await iphone.tell({ erevos: 'seen' });
  assert.equal(await iphone.tell({ erevos: 'badge', unread: 2 }), true);
  assert.equal(iphone.badge(), 2);
  await iphone.push(counted(1, 1, 1));
  assert.equal(iphone.badge(), 3);
  // Lost, late or twice: counted once, as on the notice.
  await iphone.push(counted(1, 1, 3));
  await iphone.push(counted(1, 1, 3));
  assert.equal(iphone.badge(), 5);
  assert.deepEqual(iphone.shown(), ['3 new messages']);
  // A push that did not say how many is one more.
  await iphone.push();
  assert.equal(iphone.badge(), 6);
  // Kept when the worker starts again.
  const again = browser('iphone', iphone.store);
  await again.push(counted(2, 1, 1));
  assert.equal(again.badge(), 7);
  // Erevos open again: the number waits for the app to count, which takes what the pushes said.
  await again.tell({ erevos: 'seen' });
  assert.equal(again.badge(), 7);
  await again.tell({ erevos: 'badge', unread: 6 });
  assert.equal(again.badge(), 6);
  // All read, and no more: no number.
  await again.tell({ erevos: 'badge', unread: 0 });
  assert.equal(again.badge(), 0);
});

test('Erevos opened only to its password keeps the number, and a round that goes on is not counted twice', async () => {
  const iphone = browser('iphone');
  await iphone.tell({ erevos: 'badge', unread: 2 });
  await iphone.push(counted(1, 1, 2));
  assert.equal(iphone.badge(), 4);
  // Shown and left, no space opened, so the app counted nothing: the notice starts again, the icon
  // does not.
  await iphone.tell({ erevos: 'seen' });
  await iphone.tell({ erevos: 'seen' });
  assert.deepEqual(iphone.shown(), []);
  assert.equal(iphone.badge(), 4);
  // The notice tells of the new message alone.
  await iphone.push(counted(1, 1, 3));
  assert.deepEqual(iphone.shown(), ['New message']);
  assert.equal(iphone.badge(), 5);
  // Kept when the worker starts again.
  const again = browser('iphone', iphone.store);
  await again.push(counted(1, 1, 4));
  assert.equal(again.badge(), 6);
  // The app counted before it took them (another space's, say): the round adds only what came since.
  await again.tell({ erevos: 'badge', unread: 2 });
  assert.equal(again.badge(), 2);
  await again.push(counted(1, 1, 5));
  assert.equal(again.badge(), 3);
});

test('the icon keeps which queues pushed only until the app counts', async () => {
  const other = browser('other');
  await other.push(counted(1, 1, 1));
  await other.push(counted(2, 1, 2));
  await other.tell({ erevos: 'seen' });
  assert.deepEqual(other.streams(), []);
  assert.equal(other.iconStreams().length, 2);
  await other.tell({ erevos: 'badge', unread: 0 });
  assert.deepEqual(other.iconStreams(), []);
  assert.equal(other.badge(), 0);
});

test('without its cache the icon still follows what the worker was told', async () => {
  const iphone = browser('iphone');
  await iphone.tell({ erevos: 'badge', unread: 2 });
  await iphone.push(counted(1, 1, 3));
  assert.equal(iphone.badge(), 5);
  iphone.failCache();
  // Not kept, so the app is answered no and tells it again later; shown all the same.
  assert.equal(await iphone.tell({ erevos: 'badge', unread: 0 }), false);
  assert.equal(iphone.badge(), 0);
  await iphone.push(counted(1, 2, 1));
  assert.deepEqual(iphone.shown(), ['4 new messages']);
  assert.equal(iphone.badge(), 1);
  // A worker started again with no cache shows what the app says.
  const again = browser('iphone', new Map());
  again.failCache();
  assert.equal(await again.tell({ erevos: 'badge', unread: 3 }), false);
  assert.equal(again.badge(), 3);
});

test('a browser whose badges never answer holds back no notice', async () => {
  const iphone = browser('iphone', new Map(), 'hangs');
  await iphone.push(counted(1, 1, 1));
  assert.deepEqual(iphone.shown(), ['New message']);
  assert.equal(await iphone.tell({ erevos: 'badge', unread: 2 }), true);
  await iphone.push(counted(1, 1, 2));
  assert.deepEqual(iphone.shown(), ['2 new messages']);
  assert.equal(await iphone.tell({ erevos: 'seen' }), true);
});

test('a push while Erevos is on the screen leaves the number to the app', async () => {
  const other = browser('other');
  await other.tell({ erevos: 'badge', unread: 1 });
  other.windows.push({ visibilityState: 'visible' });
  await other.push(counted(1, 1, 2));
  assert.equal(other.badge(), 1);
  await other.tell({ erevos: 'badge', unread: 3 });
  assert.equal(other.badge(), 3);
});

test('what is not a count the app says is none', async () => {
  const other = browser('other');
  await other.tell({ erevos: 'badge', unread: 4 });
  for (const unread of [-3, 1.5, 'x', null, Number.MAX_VALUE, Infinity, undefined]) {
    await other.tell({ erevos: 'badge', unread: 4 });
    await other.tell({ erevos: 'badge', unread });
    assert.equal(other.badge(), 0, String(unread));
  }
  // A count as large as can be stays one the icon can show, pushes or not.
  await other.tell({ erevos: 'badge', unread: Number.MAX_SAFE_INTEGER });
  await other.push(counted(1, 1, 1));
  assert.equal(other.badge(), Number.MAX_SAFE_INTEGER);
});

test('without badges, or where they are not allowed, the notices show all the same', async () => {
  for (const badges of ['none', 'refused'] as const) {
    const iphone = browser('iphone', new Map(), badges);
    assert.equal(await iphone.tell({ erevos: 'badge', unread: 2 }), true);
    await iphone.push(counted(1, 1, 2));
    assert.deepEqual(iphone.shown(), ['2 new messages']);
    assert.equal(iphone.badge(), 0);
    assert.equal(await iphone.tell({ erevos: 'seen' }), true);
    assert.deepEqual(iphone.shown(), []);
  }
});

// The app's side (lib/icon-number.ts), with the space, its settings and the worker as a check
// sets them.
function app(start: Partial<{ wanted: boolean; space: object | null; on: boolean; unread: number | null; answer: unknown; showing: boolean }> = {}) {
  const now = { wanted: true, space: {} as object | null, on: true, unread: 3 as number | null, answer: true as unknown, showing: true, ...start };
  const told: (number | 'off')[] = [];
  let counts = 0;
  // A count held until the check lets it go.
  let held: Promise<void> | null = null;
  const parts: IconParts = {
    wanted: async () => now.wanted,
    space: () => now.space,
    on: async () => now.on,
    unread: async () => {
      counts++;
      await held;
      return now.unread;
    },
    tell: async (said) => {
      told.push(said);
      return now.answer;
    },
    showing: () => now.showing,
  };
  return { now, told, counts: () => counts, hold: (until: Promise<void>) => (held = until), icon: iconNumber(parts) };
}

// Until every count asked has ended.
async function settled(): Promise<void> {
  for (let i = 0; i < 10; i++) await new Promise((done) => setImmediate(done));
}

test("the app tells the open space's unread with notifications on, and 0 with them off", async () => {
  const on = app();
  on.icon.seen();
  await settled();
  assert.deepEqual(on.told, [3]);
  const off = app({ on: false });
  off.icon.seen();
  await settled();
  assert.deepEqual(off.told, [0]);
  assert.equal(off.counts(), 0);
});

test('with no space open, or its chats not read, the app tells nothing: the number stays', async () => {
  const none = app({ space: null });
  none.icon.seen();
  none.icon.changed();
  await settled();
  assert.deepEqual(none.told, []);
  const unread = app({ unread: null });
  unread.icon.seen();
  await settled();
  assert.deepEqual(unread.told, []);
});

test('the same number is told again only when Erevos shows or leaves, or when the worker did not take it', async () => {
  const shown = app();
  shown.icon.seen();
  shown.icon.changed();
  await settled();
  shown.icon.changed();
  await settled();
  assert.deepEqual(shown.told, [3]);
  shown.icon.seen();
  await settled();
  assert.deepEqual(shown.told, [3, 3]);
  shown.now.unread = 1;
  shown.icon.changed();
  await settled();
  assert.deepEqual(shown.told, [3, 3, 1]);

  for (const answer of [null, false]) {
    const lost = app({ answer });
    lost.icon.seen();
    await settled();
    lost.icon.changed();
    await settled();
    assert.deepEqual(lost.told, [3, 3], String(answer));
  }
});

test('out of sight, a message or a while that goes by counts nothing: the pushes count then', async () => {
  const hidden = app({ showing: false });
  hidden.icon.changed();
  await settled();
  assert.equal(hidden.counts(), 0);
  // As it leaves, it is counted.
  hidden.icon.seen();
  await settled();
  assert.deepEqual(hidden.told, [3]);
});

test('one count at a time, and one for another space opened meanwhile is told for that one', async () => {
  const two = app();
  let letGo = () => undefined as void;
  two.hold(new Promise<void>((done) => (letGo = done)));
  two.icon.seen();
  two.icon.changed();
  two.icon.changed();
  await settled();
  assert.equal(two.counts(), 1);
  // Another space opens while the count reads the first one's chats.
  two.now.space = {};
  two.now.unread = 5;
  letGo();
  await settled();
  assert.deepEqual(two.told, [5]);
  assert.equal(two.counts(), 2);
});

test('turned off, the app tells the worker to show no number, a space open or not; on again, the number', async () => {
  const off = app({ wanted: false, space: null });
  off.icon.seen();
  off.icon.changed();
  await settled();
  assert.deepEqual(off.told, ['off']);
  assert.equal(off.counts(), 0);
  off.now.wanted = true;
  off.now.space = {};
  off.icon.seen();
  await settled();
  assert.deepEqual(off.told, ['off', 3]);
});

test('turned off, the icon shows no number, and the pushes count none until the app says one', async () => {
  const iphone = browser('iphone');
  await iphone.tell({ erevos: 'badge', unread: 2 });
  await iphone.push(counted(1, 1, 1));
  assert.equal(iphone.badge(), 3);
  assert.equal(await iphone.tell({ erevos: 'badge', off: true, unread: 5 }), true);
  assert.equal(iphone.badge(), 0);
  await iphone.push(counted(1, 1, 3));
  await iphone.push();
  assert.equal(iphone.badge(), 0);
  assert.deepEqual(iphone.iconStreams(), []);
  // The notice still counts.
  assert.deepEqual(iphone.shown(), ['New messages']);
  // Kept when the worker starts again; on again with the app's count.
  const again = browser('iphone', iphone.store);
  await again.push(counted(2, 9, 1));
  assert.equal(again.badge(), 0);
  await again.tell({ erevos: 'badge', unread: 4 });
  assert.equal(again.badge(), 4);
  await again.push(counted(2, 9, 2));
  assert.equal(again.badge(), 6);
});

test("a space's own worker for its notices keeps no release, serves no page, and counts with the app's worker", async () => {
  const app = browser('other');
  const scope = 'https://erevos.example/__erevos/push/0123456789abcdef0123456789abcdef/';
  const space = browser('other', app.store, 'yes', scope);
  // It fetches no release (offline, the app's worker would fail) and keeps no state of one.
  await space.install();
  await space.activate();
  assert.equal(app.store.has('/__erevos/state'), false);
  // A page asked for there goes to the app's, which the app's worker serves.
  assert.equal(await space.navigate('/__erevos/push/0123456789abcdef0123456789abcdef/'), '302 https://erevos.example/');
  // It answers nothing of the releases.
  assert.equal(await space.tell({ erevos: 'status' }), undefined);
  assert.equal(await space.tell({ erevos: 'check' }), undefined);
  // One count for all the workers, read again each time: the app's worker counts on from what the space's counted.
  await app.push(counted(2, 1, 1));
  assert.deepEqual(app.shown(), ['New message']);
  await space.push(counted(1, 1, 2));
  assert.deepEqual(space.shown(), ['3 new messages']);
  await app.push(counted(2, 1, 2));
  assert.deepEqual(app.shown(), ['4 new messages']);
  // Erevos open again: the app's worker starts the count again, and the space's closes its notices.
  assert.equal(await app.tell({ erevos: 'seen' }), true);
  assert.equal(app.count(), 0);
  assert.equal(await space.tell({ erevos: 'close' }), true);
  assert.deepEqual(space.shown(), []);
  // The app's worker takes no 'close' of the spaces'.
  assert.equal(await app.tell({ erevos: 'close' }), undefined);
});
