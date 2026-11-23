// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Element Call in the web app and on the computer (lib/element-call-window.web.ts): the web app's
// service worker (pwa/sw.js) serves on Element Call's origin only Element Call's files, signed with
// the rest, and on the app's origin never them; each with its own policy; and Element Call's frame
// reaches no tracker nor the homeserver itself. And Element Call as pwa/element-call.mjs makes it:
// no inline script, an empty config, the files Android leaves out left out, the same policy where
// the worker and the computer serve it, and the script it adds telling Erevos only what it should.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';

const PWA = join(import.meta.dirname, '../../pwa');
// The worker of the plain Erevos's web app (pwa/build.mjs --edition erevos).
const WORKER = readFileSync(join(PWA, 'sw.js'), 'utf8').replace('__EREVOS_WEB_APP__', 'erevos-web');
const DIST = join(import.meta.dirname, '../node_modules/@element-hq/element-call-embedded/dist');
const APP = 'https://erevos.example';
const CALL = 'https://call.erevos.example';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const KEY = publicKey.export({ format: 'der', type: 'spki' }).subarray(-32).toString('base64');

// The files of a release, and the release as pwa/build.mjs lists them.
const FILES: Record<string, string> = {
  '/index.html': 'app page',
  '/app.js': 'app script',
  '/sw.js': 'worker',
  '/i/index.html': 'invite page',
  '/element-call/start.html': 'call start page',
  '/element-call/start.js': 'call start script',
  '/element-call/index.html': 'call page',
  '/element-call/assets/index.js': 'call script',
  '/element-call/config.json': '{}',
};
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const RELEASE = Buffer.from(JSON.stringify({ app: 'erevos-web', version: 9, origins: { app: APP, call: CALL }, files: Object.fromEntries(Object.entries(FILES).map(([p, body]) => [p, hash(body)])) }));
const SIGNATURE = sign(null, RELEASE, privateKey).toString('base64');

type Answer = Response | 'passed';

// The worker as pwa/build.mjs writes it, installed on `origin` by a browser whose server gives the
// release above, and what it asked that server for.
async function installed(origin: string, marks = { app: APP, call: CALL }) {
  const caches = new Map<string, Map<string, Response>>();
  const open = async (name: string) => {
    if (!caches.has(name)) caches.set(name, new Map());
    const store = caches.get(name)!;
    return {
      match: async (key: string) => store.get(key)?.clone(),
      put: async (key: string, response: Response) => void store.set(key, response.clone()),
    };
  };
  const asked: string[] = [];
  const fetch = async (path: string) => {
    asked.push(path);
    if (path === '/release.json') return new Response(RELEASE);
    if (path === '/release.sig') return new Response(SIGNATURE);
    return path in FILES ? new Response(FILES[path]) : new Response('', { status: 404 });
  };
  const listeners: Record<string, (event: unknown) => void> = {};
  const self = {
    addEventListener: (type: string, listener: (event: unknown) => void) => void (listeners[type] = listener),
    clients: { matchAll: async () => [], claim: async () => undefined },
    skipWaiting: async () => undefined,
    location: { origin },
  };
  const worker = WORKER.replace('__EREVOS_PUBLIC_KEY__', KEY).replace('__EREVOS_APP_ORIGIN__', marks.app).replace('__EREVOS_CALL_ORIGIN__', marks.call);
  vm.runInNewContext(worker, { self, caches: { open, keys: async () => [...caches.keys()], delete: async (name: string) => caches.delete(name) }, Response, URL, crypto, TextEncoder, TextDecoder, DOMException, setTimeout, fetch, atob });
  const fire = async (type: string) => {
    let work: Promise<unknown> = Promise.resolve();
    listeners[type]({ waitUntil: (promise: Promise<unknown>) => (work = promise) });
    await work;
  };
  await fire('install');
  await fire('activate');
  const got = (url: string, mode = 'no-cors'): Promise<Answer> => {
    let answer: Promise<Response> | undefined;
    listeners.fetch({ request: { url, method: 'GET', mode }, respondWith: (response: Promise<Response> | Response) => (answer = Promise.resolve(response)), waitUntil: () => undefined });
    return answer ?? Promise.resolve('passed');
  };
  return {
    asked,
    open: (path: string) => got(`${origin}${path}`, 'navigate'),
    load: (path: string) => got(`${origin}${path}`),
    elsewhere: (url: string) => got(url, 'cors'),
  };
}

const text = async (answer: Answer) => (answer === 'passed' ? 'passed' : `${answer.status} ${await answer.text()}`);

test("the app's origin keeps and serves the app, never Element Call", async () => {
  const app = await installed(APP);
  assert.deepEqual(app.asked.filter((p) => p.startsWith('/element-call/')), []);
  assert.ok(app.asked.includes('/index.html') && app.asked.includes('/app.js'));
  assert.equal(await text(await app.open('/')), '200 app page');
  assert.equal(await text(await app.open('/i/')), '200 invite page');
  // Element Call's pages open the app here, and its files are not served.
  assert.equal(await text(await app.open('/element-call/index.html')), '200 app page');
  assert.equal(await text(await app.open('/element-call/start.html')), '200 app page');
  for (const path of ['/element-call/assets/index.js', '/element-call/config.json']) assert.match(await text(await app.load(path)), /^404 /, path);
  // The app's page may frame Element Call's origin, and nothing else.
  const page = (await app.open('/')) as Response;
  assert.match(page.headers.get('Content-Security-Policy') ?? '', /frame-ancestors 'none'; frame-src https:\/\/call\.erevos\.example$/);
  // What the app asks of other hosts goes as it asked, the homeserver included.
  assert.equal(await app.elsewhere('https://matrix.example/_matrix/client/versions'), 'passed');
});

test("Element Call's origin keeps and serves only Element Call, shown only in the app's frame", async () => {
  const call = await installed(CALL);
  assert.deepEqual(
    call.asked.filter((p) => !p.startsWith('/element-call/')),
    ['/release.json', '/release.sig'],
  );
  assert.equal(await text(await call.open('/element-call/start.html')), '200 call start page');
  assert.equal(await text(await call.open('/element-call/')), '200 call page');
  assert.equal(await text(await call.load('/element-call/assets/index.js')), '200 call script');
  // Nothing of the app, at any address.
  for (const path of ['/', '/index.html', '/i/', '/chat/abc']) assert.match(await text(await call.open(path)), /^404 /, path);
  for (const path of ['/index.html', '/app.js']) assert.match(await text(await call.load(path)), /^404 /, path);
  const page = (await call.open('/element-call/index.html')) as Response;
  const policy = page.headers.get('Content-Security-Policy') ?? '';
  assert.match(policy, /frame-ancestors https:\/\/erevos\.example$/);
  assert.doesNotMatch(policy, /'unsafe-eval'|script-src[^;]*'unsafe-inline'/);
});

test("Element Call's frame reaches no tracker nor the homeserver itself, and its media server as it asks", async () => {
  const call = await installed(CALL);
  for (const url of ['https://matrix.example/_matrix/client/versions', 'https://eu.posthog.com/e/', 'https://o1.ingest.sentry.io/api/', 'https://www.google.com/x']) {
    const answer = await call.elsewhere(url);
    assert.ok(answer !== 'passed' && answer.status === 403, url);
  }
  for (const url of ['https://sfu.example.org/livekit/jwt/sfu/get', 'https://matrix.example/.well-known/matrix/client']) assert.equal(await call.elsewhere(url), 'passed', url);
});

test('a web app built without Element Call serves as before', async () => {
  const plain = await installed(APP, { app: '', call: '' });
  const page = (await plain.open('/')) as Response;
  assert.doesNotMatch(page.headers.get('Content-Security-Policy') ?? '', /frame-src/);
  assert.equal(await plain.elsewhere('https://matrix.example/_matrix/client/versions'), 'passed');
});

// Element Call as the web app and the computer carry it.
const made = mkdtempSync(join(tmpdir(), 'erevos-element-call-'));
const tool = (await import('../../pwa/element-call.mjs')) as { makeElementCall: (dist: string, out: string) => void; CALL_CSP: string };
tool.makeElementCall(DIST, made);

test('Element Call runs no inline script, reports to no one, and leaves out what Android leaves out', () => {
  const page = readFileSync(join(made, 'index.html'), 'utf8');
  assert.equal([...page.matchAll(/<script>/g)].length, 0);
  assert.doesNotMatch(page, /\son[a-z]+=/i);
  assert.match(page, /<script src="\.\/erevos-call\.js"><\/script><script type="module"/);
  assert.equal(readFileSync(join(made, 'config.json'), 'utf8').trim(), '{}');
  const names = readdirSync(join(made, 'assets'));
  assert.ok(names.length > 20);
  assert.deepEqual(names.filter((n) => /\.map$|vision_wasm_internal|selfie_segmenter|matrix_sdk_crypto_wasm|\.woff$/.test(n)), []);
  for (const name of ['start.html', 'start.js', 'erevos-call.js']) assert.ok(existsSync(join(made, name)), name);
  // Every name one the worker takes.
  for (const name of names) assert.match(`/element-call/assets/${name}`, /^\/[\w.@/-]+$/);
});

test('the worker and the computer give Element Call the policy pwa/element-call.mjs says', () => {
  const policy = (source: string, name: string) => new RegExp(`const ${name} =\\s*"([^"]+)"`).exec(source)?.[1];
  assert.equal(policy(WORKER, 'CALL_CSP'), tool.CALL_CSP);
  const desktop = readFileSync(join(import.meta.dirname, '../../desktop/main.js'), 'utf8');
  assert.equal(policy(desktop, 'CALL_CSP'), `${tool.CALL_CSP}; frame-ancestors app://erevos`);
  assert.match(policy(desktop, 'CSP') ?? '', /; frame-src blob: app:\/\/element-call$/);
  assert.match(readFileSync(join(made, 'index.html'), 'utf8'), new RegExp(`content="${tool.CALL_CSP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
});

type Posted = { message: unknown; origin: string };

// The script Element Call's page runs first, in a window framed by Erevos at `parentUrl`.
function framed(parentUrl: string) {
  const posted: Posted[] = [];
  const listeners: Record<string, ((event: unknown) => void)[]> = {};
  // Made plain objects here: one from the page's context has another Object, which deepEqual minds.
  const parent = { postMessage: (message: unknown, origin: string) => posted.push({ message: JSON.parse(JSON.stringify(message)), origin }) };
  const pip: string[] = [];
  const window: Record<string, unknown> = {
    parent,
    addEventListener: (type: string, listener: (event: unknown) => void) => (listeners[type] ??= []).push(listener),
  };
  const context = { window, location: { hash: `#?widgetId=w1&parentUrl=${encodeURIComponent(parentUrl)}&roomId=%21r` }, navigator: {}, URL, URLSearchParams, Promise };
  vm.runInNewContext(readFileSync(join(made, 'erevos-call.js'), 'utf8'), context);
  return {
    posted,
    pip,
    // Element Call loads, and sets its controls.
    load() {
      window.controls = { enablePip: () => pip.push('on'), disablePip: () => pip.push('off') };
      for (const listener of listeners.load ?? []) listener({});
    },
    back: () => (window.controls as { onBackButtonPressed?: () => void }).onBackButtonPressed?.(),
    hear: (data: unknown, origin: string, fromParent = true) => {
      for (const listener of listeners.message ?? []) listener({ data, origin, source: fromParent ? parent : {} });
    },
  };
}

test("Element Call's back arrow tells Erevos, only at Erevos's origin, and Erevos alone puts it small", () => {
  const page = framed('https://erevos.example/');
  page.load();
  page.back();
  assert.deepEqual(page.posted, [{ message: { erevos: 'back' }, origin: 'https://erevos.example' }]);
  page.hear({ erevos: { small: true } }, 'https://erevos.example');
  page.hear({ erevos: { small: false } }, 'https://erevos.example');
  // From another origin, or not from the frame's parent: nothing.
  page.hear({ erevos: { small: true } }, 'https://evil.example');
  page.hear({ erevos: { small: true } }, 'https://erevos.example', false);
  page.hear({ api: 'toWidget', action: 'capabilities' }, 'https://erevos.example');
  assert.deepEqual(page.pip, ['on', 'off']);
  // The computer's origin as the app gives it.
  const desktop = framed('app://erevos/');
  desktop.load();
  desktop.back();
  assert.deepEqual(desktop.posted.map((p) => p.origin), ['app://erevos']);
});

test.after(() => rmSync(made, { recursive: true, force: true }));
