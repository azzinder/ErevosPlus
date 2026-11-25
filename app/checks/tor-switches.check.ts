// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Tor switches of what reaches a server of its own (lib/net-http.ts httpFor): with a switch on,
// only through Tor, which is started for it, whatever the space's Tor way, and never straight,
// should Tor fail or not be in the build; with it off, as before. Backups to a server and the
// sign-in with Nextcloud, the Collection's server, link previews and updates each keep their own,
// off unless turned on, and left out of what is kept while off.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { bytesSource } from '../lib/attachments';
import { CloudError, cloudServer, listCloud, loadCloudBackup, sendToCloud, setCloudHttp, setCloudTor, startCloudBackup, stopCloudBackup, type CloudAnswer } from '../lib/backup-cloud';
import { connectCollectionServer, copyToServer, serverFolder, setServerRetry, testCollectionServer } from '../lib/collection-webdav';
import { setCore, type Core } from '../lib/core';
import { randomBytes, utf8Encode } from '../lib/crypto';
import { partsThroughTor, previewWay } from '../lib/link-preview';
import { httpFor, NoTorError, throughTorNow } from '../lib/net-http';
import { nextcloudFolder, startLoginFlow, waitForLogin } from '../lib/nextcloud-login';
import { setThroughTor, setTorReady, setTorStarter } from '../lib/relay';
import { latestTold, loadNotice, lookForRelease, mayAsk, NOTICE_EVERY, NOTICE_SERVER, setUpdatesTor, torGet } from '../lib/release-notice';
import { addToCollection, checkedCollection, loadCollection, setCollectionOption, type CollectionPlace } from '../lock/collection-data';
import { setCurrentSpace } from '../lock/keys';
import { EMPTY_SPACE, loadSpaceData, saveSpaceData } from '../lock/space-data';

const EMPTY = new Uint8Array(0);
type Asked = { method: string; url: string; headers: Record<string, string> };
type Answer = { status: number; bytes?: Uint8Array };

// A build whose Tor answers as `answer` says: what it was asked, in order.
function torCore(answer: (asked: Asked, body: Uint8Array) => Answer): Asked[] {
  const asked: Asked[] = [];
  setCore({
    torRequest: async () => EMPTY,
    torHttp: async (head: string, body: Uint8Array) => {
      const one = JSON.parse(head) as Asked;
      asked.push(one);
      const { status, bytes = EMPTY } = answer(one, body);
      const out = new Uint8Array(2 + bytes.length);
      out[0] = status >> 8;
      out[1] = status & 0xff;
      out.set(bytes, 2);
      return out;
    },
  } as unknown as Core);
  return asked;
}

// What went straight, by address: nothing should, with a switch on.
const realFetch = globalThis.fetch;
function straightSpy(): string[] {
  const went: string[] = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    went.push(String(url));
    return new Response('', { status: 200 });
  }) as typeof fetch;
  return went;
}

// How often Tor was started for a switch.
let started = 0;

afterEach(() => {
  globalThis.fetch = realFetch;
  setCore(null);
  setCloudHttp(null);
  setThroughTor('off');
  setTorReady(false);
  started = 0;
  setTorStarter(async () => {
    started++;
  });
});

setTorStarter(async () => {
  started++;
});

test('a switch on goes only through Tor, started for it, whatever the way; off, as before', async () => {
  const straight = straightSpy();
  const asked = torCore(() => ({ status: 200, bytes: utf8Encode('hi') }));
  for (const way of ['off', 'messages', 'all'] as const) {
    setThroughTor(way);
    const answer = await httpFor(true)('GET', `https://example.org/${way}`, {});
    assert.equal(answer.status, 200);
    assert.equal(throughTorNow(true), true);
  }
  assert.equal(asked.length, 3);
  assert.equal(started, 3);
  assert.deepEqual(straight, []);

  // Off, with the space's Tor off: straight, as before, and Tor is neither asked nor started.
  setThroughTor('off');
  assert.equal(throughTorNow(false), false);
  await httpFor(false)('GET', 'https://example.org/straight', {});
  assert.deepEqual(straight, ['https://example.org/straight']);
  assert.equal(asked.length, 3);
  assert.equal(started, 3);
  // Off, with Everything through Tor: through Tor, as before.
  setThroughTor('all');
  await httpFor(false)('GET', 'https://example.org/all', {});
  assert.equal(asked.length, 4);
  assert.equal(straight.length, 1);

  // Tor failing: on, nothing goes straight, even with Messages, which off goes straight then.
  setCore({
    torRequest: async () => EMPTY,
    torHttp: async () => {
      throw new Error('no circuit');
    },
  } as unknown as Core);
  setThroughTor('messages');
  setTorReady(true);
  await assert.rejects(httpFor(true)('GET', 'https://example.org/failing', {}), /no circuit/);
  assert.equal(straight.length, 1);
  await httpFor(false)('GET', 'https://example.org/after', {});
  assert.deepEqual(straight.slice(1), ['https://example.org/after']);

  // A build without Tor: on, nothing goes, and it says why.
  setCore(null);
  setThroughTor('off');
  await assert.rejects(httpFor(true)('GET', 'https://example.org/none', {}), NoTorError);
  assert.equal(straight.length, 2);
});

const FOLDER = 'https://cloud.example/dav/Backups/';

test('backups to a server with their switch on go only through Tor, which is kept with the server', async () => {
  const straight = straightSpy();
  const asked = torCore(({ method }) => ({ status: method === 'PROPFIND' ? 207 : method === 'PUT' ? 201 : 404 }));
  try {
    let cloud = await startCloudBackup(FOLDER, 'me', 'app-pass', true);
    assert.equal(cloud.tor, true);
    assert.equal((await loadCloudBackup())?.tor, true);
    cloud = await sendToCloud(cloud, async () => randomBytes(100), 3, 1);
    assert.equal(cloud.error, '');
    assert.deepEqual(
      asked.map((one) => one.method),
      ['PROPFIND', 'PUT'],
    );
    // A server typed in to restore from takes the switch as the screen shows it.
    assert.deepEqual(await listCloud(cloudServer(FOLDER, 'me', 'app-pass', true)), []);
    assert.equal(asked.length, 3);
    assert.deepEqual(straight, []);
    assert.ok(started >= 3);

    // Turned off, it is left out, as at first, and the server is asked as before: straight with Tor off.
    cloud = (await setCloudTor(false))!;
    assert.equal('tor' in cloud, false);
    assert.equal('tor' in (await loadCloudBackup())!, false);
    await listCloud(cloud);
    assert.deepEqual(straight, [FOLDER]);
    assert.equal(asked.length, 3);

    // A build without Tor, the switch on: nothing goes, and it says why.
    setCore(null);
    await assert.rejects(listCloud(cloudServer(FOLDER, 'me', 'app-pass', true)), (error) => error instanceof CloudError && /only through Tor/.test(error.message));
    assert.equal(straight.length, 1);
  } finally {
    await stopCloudBackup();
  }
});

const said = (status: number, value?: unknown): CloudAnswer => ({ status, bytes: utf8Encode(value === undefined ? '' : JSON.stringify(value)) });

test('the sign-in with Nextcloud goes as the server it signs in for', async () => {
  const BASE = 'https://cloud.example/nextcloud';
  // Its own Tor here, so a switch on may go.
  torCore(() => ({ status: 500 }));
  const tors: boolean[] = [];
  setCloudHttp(async (method, url, _headers, _body, _most, tor) => {
    tors.push(tor === true);
    if (url.endsWith('/login/v2')) return said(200, { login: `${BASE}/index.php/login/v2/flow/a`, poll: { endpoint: `${BASE}/poll`, token: 't' } });
    if (url.endsWith('/poll')) return said(200, { loginName: 'me', appPassword: 'app-pass' });
    return said(method === 'PROPFIND' ? 207 : 201);
  });
  const flow = await startLoginFlow(BASE, true);
  const login = await waitForLogin(BASE, flow, new AbortController().signal, { every: 1, tor: true });
  assert.equal(login.tor, true);
  const server = await nextcloudFolder(login, 'backups');
  assert.equal(server.tor, true);
  assert.ok(tors.length >= 5);
  assert.ok(tors.every((tor) => tor));

  // Off: as before, and nothing of it says Tor.
  tors.length = 0;
  const plain = await waitForLogin(BASE, await startLoginFlow(BASE), new AbortController().signal, { every: 1 });
  assert.deepEqual(plain, { base: BASE, user: 'me', password: 'app-pass' });
  assert.equal('tor' in (await nextcloudFolder(plain, 'collection')), false);
  assert.ok(tors.length >= 5);
  assert.ok(tors.every((tor) => !tor));
});

test("the Collection's server goes only through Tor while the place's switch for it is on", async () => {
  setCurrentSpace(null);
  setServerRetry([0]);
  torCore(() => ({ status: 500 }));
  const ROOT = 'https://cloud.example/dav/Erevos/';
  const made = new Set<string>([ROOT]);
  // What was put there, by its address, with its size: the server lists it, as the copy reads back.
  const put = new Map<string, number>();
  const asked: string[] = [];
  setCloudHttp(async (method, url, headers, body, _most, tor) => {
    asked.push(`${method} ${tor === true}`);
    if (method === 'PROPFIND') {
      if (!made.has(url)) return said(404);
      if (headers.Depth !== '1') return said(207);
      const entry = (href: string, size: number) =>
        `<d:response><d:href>${href}</d:href><d:propstat><d:prop><d:getlastmodified>Thu, 01 Oct 2026 12:00:00 GMT</d:getlastmodified><d:getcontentlength>${size}</d:getcontentlength></d:prop></d:propstat></d:response>`;
      const path = (address: string) => new URL(address).pathname;
      const inside = [...put].filter(([address]) => address.startsWith(url) && !address.slice(url.length).includes('/'));
      const listing = `<?xml version="1.0"?><d:multistatus xmlns:d="DAV:">${entry(path(url), 0)}${inside.map(([address, size]) => entry(path(address), size)).join('')}</d:multistatus>`;
      return { status: 207, bytes: utf8Encode(listing) };
    }
    if (method === 'MKCOL') {
      made.add(url);
      return said(201);
    }
    if (method === 'PUT') {
      put.set(url, body?.length ?? 0);
      return said(201);
    }
    return said(404);
  });
  const place: CollectionPlace = { holder: 'space', space: 0, key: randomBytes(32) };
  await setCollectionOption(place, 'serverTor', true);
  assert.equal((await loadCollection(place)).serverTor, true);
  await testCollectionServer(ROOT, 'me', 'app-pass', true);
  const server = await connectCollectionServer(place, ROOT, 'me', 'app-pass');
  await addToCollection(place, bytesSource(randomBytes(1000)), { name: 'a.jpg', mime: 'image/jpeg', kind: 'photo', w: 4, h: 3 });
  assert.equal((await copyToServer(place)).error, '');
  assert.ok(asked.some((one) => one.startsWith('PUT')));
  assert.ok(asked.every((one) => one.endsWith('true')));
  assert.equal(serverFolder(server, true).tor, true);
  assert.equal('tor' in serverFolder(server), false);

  // Off again: left out, as at first, and the copies go as before.
  await setCollectionOption(place, 'serverTor', false);
  assert.equal('serverTor' in (await loadCollection(place)), false);
  asked.length = 0;
  await copyToServer(place);
  assert.ok(asked.length > 0);
  assert.ok(asked.every((one) => one.endsWith('false')));

  // Each switch is kept only when on; anything else is off.
  const kept = checkedCollection({ items: [], folders: [], gone: [], backup: true, serverTor: true, listsTor: 'yes' });
  assert.equal(kept.serverTor, true);
  assert.equal('listsTor' in kept, false);
});

test('a link preview with its own switch on is fetched only through Tor, page and picture', async () => {
  assert.equal(previewWay(false, true, false), 'none');
  assert.equal(previewWay(true, false, false), 'straight');
  assert.equal(previewWay(true, false, true), 'none');
  assert.equal(previewWay(true, true, false), 'tor');
  assert.equal(previewWay(true, true, true), 'tor');

  const straight = straightSpy();
  const PAGE = 'https://site.example/story';
  const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
  const asked = torCore(({ url }) =>
    url === PAGE
      ? { status: 200, bytes: utf8Encode('<html><head><meta property="og:title" content="A story"><meta property="og:description" content="Told."><meta property="og:image" content="/p.png"></head></html>') }
      : url === 'https://site.example/p.png'
        ? { status: 200, bytes: PNG }
        : { status: 301 },
  );
  setThroughTor('off');
  const parts = await partsThroughTor(PAGE, 1024 * 1024);
  assert.equal(parts?.title, 'A story');
  assert.equal(parts?.text, 'Told.');
  assert.equal(parts?.picture?.type, 'image/png');
  assert.deepEqual(parts?.picture?.bytes, PNG);
  assert.deepEqual(
    asked.map((one) => one.url),
    [PAGE, 'https://site.example/p.png'],
  );
  assert.equal(started, 2);
  // A page that sends elsewhere gives none through Tor.
  assert.equal(await partsThroughTor('https://site.example/moved', 1024 * 1024), null);
  // Too large: none of it is taken.
  await assert.rejects(partsThroughTor(PAGE, 16));
  // A build without Tor: nothing goes.
  setCore(null);
  await assert.rejects(partsThroughTor(PAGE, 1024 * 1024), NoTorError);
  assert.deepEqual(straight, []);
});

test("the previews' Tor switch is kept only when on, and is off as at first", async () => {
  assert.equal('previewsTor' in EMPTY_SPACE, false);
  const key = randomBytes(32);
  await saveSpaceData(5, key, { ...EMPTY_SPACE, previewsTor: true });
  assert.equal((await loadSpaceData(5, key)).previewsTor, true);
  await saveSpaceData(5, key, { ...EMPTY_SPACE, previewsTor: 'yes' as unknown as boolean });
  assert.equal('previewsTor' in (await loadSpaceData(5, key)), false);
  await saveSpaceData(5, key, { ...EMPTY_SPACE, previewsTor: false });
  assert.equal('previewsTor' in (await loadSpaceData(5, key)), false);
});

test('updates with their own switch on ask only through Tor, also with Everything through Tor', async () => {
  const LPHL = 'wss://erevos.lphl.nekten.eu';
  assert.equal(mayAsk({ url: LPHL, tor: 'all' }), false);
  assert.equal(mayAsk({ url: LPHL, tor: 'all' }, true), true);
  assert.equal(mayAsk({ url: 'wss://relay.example.org', tor: 'off' }, true), false);

  assert.equal('tor' in (await loadNotice()), false);
  await setUpdatesTor(true);
  assert.equal((await loadNotice()).tor, true);
  const files = ['android-update-erevos.json', 'android-update.json', 'release.json', 'release.sig'].map((name) => NOTICE_SERVER + name).sort();
  const fetched: string[] = [];
  const fetchImpl = (async (url: string) => {
    fetched.push(url);
    return new Response('', { status: 200 });
  }) as unknown as typeof fetch;
  const straight = straightSpy();
  const asked = torCore(() => ({ status: 404 }));
  setThroughTor('all');
  const day = Date.UTC(2026, 10, 12);
  await assert.rejects(lookForRelease({ url: LPHL, tor: 'all' }, 28, day, fetchImpl));
  assert.deepEqual(asked.map((one) => one.url).sort(), files);
  // Check for updates through Tor asks the same files; unsigned, they tell of nothing.
  torCore(() => ({ status: 200, bytes: utf8Encode('{}') }));
  assert.equal(await latestTold(torGet), null);
  assert.deepEqual(fetched, []);
  assert.deepEqual(straight, []);

  // Off: left out, as at first; not asked with Everything through Tor, and straight otherwise, as before.
  await setUpdatesTor(false);
  assert.equal('tor' in (await loadNotice()), false);
  const before = asked.length;
  assert.equal(await lookForRelease({ url: LPHL, tor: 'all' }, 28, day + NOTICE_EVERY, fetchImpl), null);
  assert.deepEqual(fetched, []);
  setThroughTor('messages');
  assert.equal(await lookForRelease({ url: LPHL, tor: 'messages' }, 28, day + NOTICE_EVERY, fetchImpl), null);
  // Erevos's own channel's statement answers, so only it is asked.
  assert.deepEqual([...fetched].sort(), [NOTICE_SERVER + 'android-update-erevos.json']);
  assert.equal(asked.length, before);
});
