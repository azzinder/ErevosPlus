// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A contact link for a website (lib/contact-code.ts, contactPageLink) and the page it opens
// (pwa/c/): that the app takes it as the contact link it came from, with no place on a relay in it,
// that the page reads what the app writes, and that the web app's worker gives that page, not the
// app, at /c and /c/.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';

import { CONTACT_PAGE, contactLink, contactLinkName, contactPageLink, linkOfFields, parseContact, type ContactCode } from '../lib/contact-code';

const PAGE = readFileSync(join(import.meta.dirname, '../../pwa/c/contact.js'), 'utf8');
// The worker of the plain Erevos's web app (pwa/build.mjs --edition erevos).
const WORKER = readFileSync(join(import.meta.dirname, '../../pwa/sw.js'), 'utf8').replace('__EREVOS_WEB_APP__', 'erevos-web');

type Shown = { data: string; name: string } | null;
const context: { erevosReadContact?: (fragment: string) => Shown; erevosContactPage?: string } = {};
vm.runInNewContext(PAGE, context);
const readContact = (fragment: string): Shown => {
  const shown = context.erevosReadContact!(fragment);
  return shown && { ...shown };
};

const KEY = 'Ab_-'.repeat(450);
const FULL: ContactCode = {
  senderHex: 'ab'.repeat(24),
  relayUrl: 'wss://erevos.example',
  key: KEY,
  d: true,
  relayKey: 'k'.repeat(43),
  spare: { senderHex: 'cd'.repeat(24), relayUrl: 'wss://home.example:7879', relayKey: 'h'.repeat(43) },
  lend: `ticket.${'0f'.repeat(40)}`,
  nostr: { k: 'ef'.repeat(32), r: ['wss://nos.example', 'wss://other.example/path'] },
};

test('the app takes a link for a website as the contact link it came from, with no place on a relay', () => {
  const page = contactPageLink(contactLink(FULL), 'Νέκταρ')!;
  assert.ok(page.startsWith(`${CONTACT_PAGE}#id=`));
  assert.ok(!page.includes('lend='));
  const { lend: _lend, ...kept } = FULL;
  assert.deepEqual(parseContact(page), kept);
  assert.equal(contactLinkName(page), 'Νέκταρ');
  // Copied from the address bar after the server sent /c on to /c/.
  assert.deepEqual(parseContact(page.replace('/c#', '/c/#')), kept);
  // With no name, none.
  const nameless = contactPageLink(contactLink(FULL))!;
  assert.ok(!nameless.includes('&n='));
  assert.equal(contactLinkName(nameless), '');
});

test('a link with no relay queue yet, only keys and Nostr, still makes one', () => {
  const bare: ContactCode = { senderHex: '', relayUrl: '', key: KEY, nostr: FULL.nostr, d: true };
  const page = contactPageLink(contactLink(bare))!;
  assert.deepEqual(parseContact(page), bare);
  assert.equal(contactPageLink(contactLink({ senderHex: 'ab'.repeat(24), relayUrl: 'wss://erevos.example', key: '' })), null);
});

test('a name never turns around and stays short', () => {
  const page = contactPageLink(contactLink(FULL), ' A‮B\nC  ' + 'x'.repeat(80))!;
  const name = contactLinkName(page);
  assert.ok(name.startsWith('A B C x'));
  assert.equal([...name].length, 40);
  assert.equal(readContact(page.slice(page.indexOf('#')))?.name, name);
});

test('the screen a link opens reads all of it, as pasted', () => {
  const page = contactPageLink(contactLink(FULL), 'Μαρία')!;
  const fields: Record<string, string> = {};
  for (const pair of page.slice(page.indexOf('#') + 1).split('&')) fields[pair.slice(0, pair.indexOf('='))] = decodeURIComponent(pair.slice(pair.indexOf('=') + 1));
  const link = linkOfFields({ ...fields, unrelated: ['a', 'b'] });
  assert.deepEqual(parseContact(link), parseContact(page));
  assert.equal(contactLinkName(link), 'Μαρία');
});

test('the page reads the links the app writes, and hands on what the app reads', () => {
  assert.equal(context.erevosContactPage, CONTACT_PAGE);
  const page = contactPageLink(contactLink(FULL), 'Μαρία')!;
  const data = page.slice(page.indexOf('#') + 1);
  assert.deepEqual(readContact(`#${data}`), { data, name: 'Μαρία' });
  assert.deepEqual(parseContact(`erevos://contact?${data}`), parseContact(page));
  for (const wrong of ['', '#', '#id=zz&key=abc', `#id=${'ab'.repeat(24)}`, `#id=&relay=wss%3A%2F%2Fa.example&key=${KEY}`, `#id=${'ab'.repeat(24)}&key=a b`])
    assert.equal(readContact(wrong), null, wrong);
});

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

test('the worker gives the contact page at /c and /c/, and the app at /contact', async () => {
  const open = await worker({ '/index.html': 'app', '/sw.js': 'worker', '/c/index.html': 'contact page', '/c/contact.js': 'script', '/i/index.html': 'invite page' });
  assert.equal(await open('/c'), 'contact page');
  assert.equal(await open('/c/'), 'contact page');
  assert.equal(await open('/i'), 'invite page');
  for (const path of ['/', '/contact', '/chat', '/c/contact.js']) assert.equal(await open(path), 'app', path);
});
