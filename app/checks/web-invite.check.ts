// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The page an invite sent by text message opens (pwa/i/): what it reads of an invite, and that the
// web app's worker (pwa/sw.js) gives that page, not the app, at /i and /i/.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';

import { randomBytes, toHex } from '../lib/crypto';
import { toBase64Url } from '../lib/e2e';
import { TEXT_INVITE_PAGE, textInviteLink, textInviteOf } from '../lib/text-invite';
import { START_RELAY } from '../lib/welcome';

const PAGE = readFileSync(join(import.meta.dirname, '../../pwa/i/invite.js'), 'utf8');
// The worker of the plain Erevos's web app (pwa/build.mjs --edition erevos).
const WORKER = readFileSync(join(import.meta.dirname, '../../pwa/sw.js'), 'utf8').replace('__EREVOS_WEB_APP__', 'erevos-web');

type Shown = { data: string; expires?: number; name?: string; newer?: boolean; card?: boolean } | null;

// The page's reader, run as the browser runs it but with no page to show.
const context: { erevosReadInvite?: (fragment: string) => Shown; erevosInvitePage?: string } = {};
vm.runInNewContext(PAGE, Object.assign(context, { atob, TextDecoder, Uint8Array, DataView }));
// Made a plain object here: one from the other context has another Object, which deepEqual minds.
const readInvite = (fragment: string): Shown => {
  const shown = context.erevosReadInvite!(fragment);
  return shown && { ...shown };
};

// An invite as the app writes it: version, flags (1: a relay key, 2: a relay address), the time it
// runs out, the sender's id, the answer key, the relay invite code, the relay key, the name, the
// relay address.
function invite({ version = 1, flags = 0, expires = 2_000_000_000, name = '', address = '', extra = 0 } = {}): string {
  const named = Buffer.from(name, 'utf8');
  const head = Buffer.alloc(6);
  head[0] = version;
  head[1] = flags;
  head.writeUInt32BE(expires, 2);
  return Buffer.concat([
    head,
    Buffer.alloc(24, 1),
    Buffer.alloc(32, 2),
    Buffer.alloc(32, 3),
    flags & 1 ? Buffer.alloc(32, 4) : Buffer.alloc(0),
    Buffer.from([named.length]),
    named,
    flags & 2 ? Buffer.from(address, 'utf8') : Buffer.alloc(0),
    Buffer.alloc(extra, 5),
  ]).toString('base64url');
}

test('reads who invites and until when, with or without a relay key and address', () => {
  for (const flags of [0, 1, 2, 3]) {
    const data = invite({ flags, expires: 1_800_000_000, name: 'Μαρία Π.', address: 'wss://erevos.example' });
    assert.deepEqual(readInvite(`#${data}`), { data, expires: 1_800_000_000, name: 'Μαρία Π.' });
  }
  const nameless = invite();
  assert.deepEqual(readInvite(nameless), { data: nameless, expires: 2_000_000_000, name: '' });
});

test("reads the invites the app writes, and hands on what the app reads", () => {
  for (const [relay, relayKey, name] of [
    [START_RELAY, toBase64Url(randomBytes(32)), 'Νίκος'],
    ['wss://relay.example.org/erevos', '', ''],
    ['wss://relay.example.org/erevos', toBase64Url(randomBytes(32)), 'Μαρία Παπαδοπούλου'],
  ]) {
    const made = { sender: toHex(randomBytes(24)), key: randomBytes(32), code: toHex(randomBytes(32)), relay, relayKey, name, expires: 1_800_000_000_000 };
    const link = textInviteLink(made);
    assert.ok(link.startsWith(`${TEXT_INVITE_PAGE}#`));
    const shown = readInvite(link.slice(link.indexOf('#')));
    assert.deepEqual(shown, { data: link.slice(link.indexOf('#') + 1), expires: 1_800_000_000, name });
    // What the page opens in the app, erevos://text-invite?d= or /text-invite?d=, is what the app reads.
    assert.deepEqual(textInviteOf(shown?.data), made);
  }
});

test('an invite cut short, or not one, is none', () => {
  const data = invite({ flags: 3, name: 'Nikos', address: 'wss://erevos.example' });
  for (const fragment of ['', '#', '#top', 'not*base64', data.slice(0, 80), data.slice(0, 127), `${data}${'A'.repeat(600)}`, invite({ version: 0 })]) {
    assert.equal(readInvite(fragment), null, fragment);
  }
  // A name longer than the app writes, or bytes no flag accounts for.
  assert.equal(readInvite(invite({ name: 'x'.repeat(121) })), null);
  assert.equal(readInvite(invite({ name: 'x', extra: 3 })), null);
  // A relay address flagged but missing.
  assert.equal(readInvite(invite({ flags: 2, name: 'x' })), null);
});

test('an invite from a later Erevos is still handed on, for the app to read', () => {
  for (const data of [invite({ version: 2 }), invite({ flags: 8 })]) assert.deepEqual(readInvite(data), { data, newer: true });
});

test('reads the contact cards the app writes, with no end, and hands on what the app reads', () => {
  for (const [relay, relayKey, name] of [
    [START_RELAY, toBase64Url(randomBytes(32)), 'Νίκος'],
    [START_RELAY, '', ''],
    ['wss://relay.example.org/erevos', '', 'Ana'],
    ['wss://relay.example.org/erevos', toBase64Url(randomBytes(32)), 'Μαρία Παπαδοπούλου'],
  ]) {
    const made = { sender: toHex(randomBytes(24)), key: randomBytes(32), code: '', relay, relayKey, name, expires: 0, card: true as const };
    const link = textInviteLink(made);
    const data = link.slice(link.indexOf('#') + 1);
    assert.deepEqual(readInvite(`#${data}`), { data, card: true, name });
    assert.deepEqual(textInviteOf(data), made);
  }
  // The shortest card, with no relay key, name or address, is under 100 characters, and still read.
  const bare = textInviteLink({ sender: toHex(randomBytes(24)), key: randomBytes(32), code: '', relay: START_RELAY, relayKey: '', name: '', expires: 0, card: true });
  const data = bare.slice(bare.indexOf('#') + 1);
  assert.ok(data.length >= 84 && data.length < 100, `${data.length}`);
  assert.deepEqual(readInvite(data), { data, card: true, name: '' });
  // Cut short, it is none.
  assert.equal(readInvite(data.slice(0, 83)), null);
});

test('a name shows as the app shows it: never turned around, and as text', () => {
  for (const name of ['<b>Eve</b>\u202egnp.exe', 'Ana \u{1F469}\u200d\u{1F4BB}', 'حسین\u200cزاده', 'Eve\nAdams\u2066x\u2069']) {
    const made = { sender: toHex(randomBytes(24)), key: randomBytes(32), code: toHex(randomBytes(32)), relay: START_RELAY, relayKey: '', name, expires: 1_800_000_000_000 };
    const link = textInviteLink(made);
    const shown = readInvite(link.slice(link.indexOf('#')))?.name;
    assert.equal(shown, textInviteOf(link.slice(link.indexOf('#') + 1))?.name, name);
    assert.doesNotMatch(shown ?? '', /[\u200e\u200f\u202a-\u202e\u2066-\u2069\n]/);
  }
  assert.equal(readInvite(invite({ name: '<b>Eve</b>\u202egnp.exe' }))?.name, '<b>Eve</b> gnp.exe');
  // Not UTF-8: no name, the invite all the same.
  const broken = Buffer.from(invite({ name: 'ab' }), 'base64url');
  broken[broken.length - 2] = 0xff;
  assert.equal(readInvite(broken.toString('base64url'))?.name, '');
});

test('the link the page copies is the one the app takes when pasted', () => {
  assert.equal(context.erevosInvitePage, TEXT_INVITE_PAGE);
});

// The worker with one release in use, as it keeps it.
async function worker(files: Record<string, string>) {
  const caches = new Map<string, Map<string, string>>();
  const open = async (name: string) => {
    if (!caches.has(name)) caches.set(name, new Map());
    const store = caches.get(name)!;
    return {
      match: async (key: string) => (store.has(key) ? new Response(store.get(key)) : undefined),
      put: async (key: string, response: Response) => void store.set(key, await response.text()),
    };
  };
  const release = { app: 'erevos-web', version: 7, files: Object.fromEntries(Object.keys(files).map((path) => [path, '0'.repeat(64)])) };
  const meta = await open('erevos-meta');
  await meta.put('/__erevos/state', new Response(JSON.stringify({ current: release, pending: null, refused: [], checked: Date.now(), error: '' })));
  const kept = await open('erevos-r7');
  for (const [path, body] of Object.entries(files)) await kept.put(path, new Response(body));
  const listeners: Record<string, (event: unknown) => void> = {};
  const self = {
    addEventListener: (type: string, listener: (event: unknown) => void) => void (listeners[type] = listener),
    clients: { matchAll: async () => [] },
    location: { origin: 'https://erevos.example' },
  };
  vm.runInNewContext(WORKER, { self, caches: { open, keys: async () => [...caches.keys()] }, Response, URL, crypto, TextEncoder, TextDecoder, setTimeout, fetch: async () => { throw new Error('offline'); } });
  return async (path: string) => {
    let answer: Promise<Response> | undefined;
    listeners.fetch({ request: { url: `https://erevos.example${path}`, method: 'GET', mode: 'navigate' }, respondWith: (response: Promise<Response>) => (answer = response), waitUntil: () => undefined });
    return (await answer!).text();
  };
}

test('the worker gives the invite page at /i and /i/, and the app everywhere else', async () => {
  const open = await worker({ '/index.html': 'app', '/sw.js': 'worker', '/i/index.html': 'invite page', '/i/invite.js': 'script' });
  assert.equal(await open('/i'), 'invite page');
  assert.equal(await open('/i/'), 'invite page');
  assert.equal(await open('/i/index.html'), 'invite page');
  for (const path of ['/', '/text-invite', '/chat/abc', '/index.html', '/i/invite.js']) assert.equal(await open(path), 'app', path);
  // A release from before the invite page opens the app there, as it always did.
  const before = await worker({ '/index.html': 'app', '/sw.js': 'worker' });
  assert.equal(await before('/i'), 'app');
});
