// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Collection on a WebDAV server (lib/collection-webdav.ts): each place's chunks copied as they
// are to a random subfolder there, only what is missing, going on after a failure, deletions
// copied too, nothing else there touched; a file missing on the phone fetched back from there,
// only chunks that open with its key, with how far it is, stopped and gone on with; and a backup
// made while the copies are whole leaving the chunks out, also after Erevos starts again, until
// the catalogue names other chunks. A copy is read back as the server lists it before it counts as
// whole; the owner can check what is there, and bring back at once every file not on the phone.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { bytesSource } from '../lib/attachments';
import { setCloudHttp } from '../lib/backup-cloud';
import { bringBackAll, checkCollectionServer, connectCollectionServer, copyToServer, fillItem, serverFolder, serverStatus, SERVER_SAMPLE, setServerRetry, testCollectionServer, turnCollectionServer } from '../lib/collection-webdav';
import { randomBytes } from '../lib/crypto';
import { PREFIX } from '../lock/attachment-files';
import {
  addToCollection,
  backupSkips,
  deleteItems,
  fillItemHere,
  FillStoppedError,
  forgetCollectionRuns,
  loadCollection,
  openCollectionsLeftOut,
  openItem,
  openThumb,
  renameItem,
  setCollectionBackup,
  type CollectionPlace,
  type FillProgress,
} from '../lock/collection-data';
import { setCurrentSpace } from '../lock/keys';
import { blobs, files } from './files-memory';

const ROOT = 'https://cloud.example/dav/Erevos/';
const AUTH = `Basic ${Buffer.from('me:app-pass').toString('base64')}`;

// An in-memory WebDAV server: its files by path under ROOT, folders ending in /, and every request asked.
function davServer() {
  const there = new Map<string, Uint8Array>([['notes.txt', new Uint8Array(12)]]);
  const asked: string[] = [];
  let failPut = 0;
  let down = false;
  let putsLeft = Infinity;
  const said = (status: number, bytes: Uint8Array = new Uint8Array(0)) => ({ status, bytes });
  setCloudHttp(async (method, url, headers, body) => {
    if (down) throw new Error('no network');
    asked.push(`${method} ${url.slice(ROOT.length)}`);
    if (headers.Authorization !== AUTH) return said(401);
    if (!url.startsWith(ROOT)) return said(404);
    const path = url.slice(ROOT.length);
    const parent = path.replace(/[^/]+\/?$/, '');
    const folderThere = (folder: string) => folder === '' || there.has(folder);
    if (method === 'PROPFIND') {
      if (!folderThere(path)) return said(404);
      if (headers.Depth !== '1') return said(207);
      const entry = (href: string, size: number) =>
        `<d:response><d:href>/dav/Erevos/${href}</d:href><d:propstat><d:prop><d:getlastmodified>Thu, 01 Oct 2026 12:00:00 GMT</d:getlastmodified><d:getcontentlength>${size}</d:getcontentlength></d:prop></d:propstat></d:response>`;
      const inside = [...there].filter(([name]) => name !== path && name.startsWith(path) && !name.slice(path.length).replace(/\/$/, '').includes('/'));
      return said(207, new TextEncoder().encode(`<?xml version="1.0"?><d:multistatus xmlns:d="DAV:">${entry(path, 0)}${inside.map(([name, bytes]) => entry(name, bytes.length)).join('')}</d:multistatus>`));
    }
    if (method === 'MKCOL') {
      if (there.has(path)) return said(405);
      if (!folderThere(parent)) return said(409);
      there.set(path, new Uint8Array(0));
      return said(201);
    }
    if (method === 'PUT') {
      if (!folderThere(parent)) return said(409);
      if (failPut > 0) {
        failPut--;
        throw new Error('connection reset');
      }
      there.set(path, body!.slice());
      if (--putsLeft <= 0) down = true;
      return said(201);
    }
    if (method === 'DELETE') return said(there.delete(path) ? 204 : 404);
    if (method === 'GET') return there.has(path) ? said(200, there.get(path)) : said(404);
    return said(405);
  });
  return {
    there,
    asked,
    failPuts: (n: number) => {
      failPut = n;
    },
    setDown: (value: boolean) => {
      down = value;
      putsLeft = Infinity;
    },
    downAfterPuts: (n: number) => {
      putsLeft = n;
    },
  };
}

const t = (name: string, fn: () => Promise<void>) =>
  test(name, async () => {
    files.clear();
    blobs.clear();
    setCurrentSpace(null);
    setServerRetry([0, 0]);
    try {
      await fn();
    } finally {
      setCloudHttp(null);
    }
  });

const place = (key = randomBytes(32)): CollectionPlace => ({ holder: 'space', space: 0, key });
const photo = { name: 'IMG_2041.jpg', mime: 'image/jpeg', kind: 'photo' as const, w: 40, h: 30 };
const localChunks = () => new Map([...blobs].filter(([name]) => name.startsWith(PREFIX)));

// The chunks in the place's subfolder on the server, by name.
async function chunksThere(dav: ReturnType<typeof davServer>, p: CollectionPlace): Promise<Map<string, Uint8Array>> {
  const { folder } = (await loadCollection(p)).server!;
  return new Map([...dav.there].filter(([path]) => path.startsWith(`${folder}/`) && /^erevos-file-[0-9a-f]{32}-\d+$/.test(path.slice(folder.length + 1))).map(([path, bytes]) => [path.slice(folder.length + 1), bytes]));
}

t('off until a server is given; the server and password are checked, kept sealed in the place', async () => {
  const dav = davServer();
  const p = place();
  await addToCollection(p, bytesSource(randomBytes(1000)), photo);
  assert.equal((await copyToServer(p)).total, 0);
  assert.deepEqual(dav.asked, []);
  await assert.rejects(testCollectionServer('http://cloud.example/dav/Erevos', 'me', 'app-pass'), /https/);
  await assert.rejects(connectCollectionServer(p, ROOT, 'me', 'wrong'), /did not take/);
  await assert.rejects(connectCollectionServer(p, 'https://cloud.example/dav/Elsewhere', 'me', 'app-pass'), /not on the server/);
  const server = await connectCollectionServer(p, 'https://cloud.example/dav/Erevos', ' me ', 'app-pass');
  assert.equal(server.url, ROOT);
  assert.equal(server.user, 'me');
  assert.match(server.folder, /^[0-9a-f]{24}$/);
  assert.ok(dav.there.has(`${server.folder}/`));
  // Kept in the place's sealed catalogue only: no password nor address in what is stored.
  for (const text of files.values()) assert.ok(!text.includes('app-pass') && !text.includes('cloud.example'));
  assert.deepEqual((await loadCollection(p)).server, server);
  // Another key sees no server, and copies nothing.
  const other = place();
  assert.equal((await loadCollection(other)).server, undefined);
  const before = dav.asked.length;
  await copyToServer(other);
  assert.equal(dav.asked.length, before);
});

t('the first copy sends every chunk, the next only the new ones, and one with nothing new changes nothing', async () => {
  const dav = davServer();
  const p = place();
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  await addToCollection(p, bytesSource(randomBytes(300 * 1024)), photo, { thumb: randomBytes(2000) });
  const first = await copyToServer(p, undefined, () => 1000);
  assert.equal(first.error, '');
  assert.equal(first.done, first.total);
  assert.equal(first.last, 1000);
  assert.deepEqual(await chunksThere(dav, p), localChunks());
  assert.equal((await loadCollection(p)).server?.last, 1000);

  await addToCollection(p, bytesSource(randomBytes(5000)), { ...photo, name: 'b.jpg' });
  dav.asked.length = 0;
  await copyToServer(p);
  assert.equal(dav.asked.filter((a) => a.startsWith('PUT')).length, 1);
  assert.deepEqual(await chunksThere(dav, p), localChunks());

  dav.asked.length = 0;
  await copyToServer(p);
  assert.deepEqual(
    dav.asked.filter((a) => !a.startsWith('PROPFIND')),
    [],
  );
  // The owner's own file in the folder is never touched.
  assert.ok(dav.there.has('notes.txt'));
});

t('a copy cut short by the network goes on where it stopped; a chunk there of another size goes again', async () => {
  const dav = davServer();
  const p = place();
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  await addToCollection(p, bytesSource(randomBytes(3 * 1024 * 1024)), { ...photo, name: 'big.bin', kind: 'file' });
  const count = localChunks().size;
  assert.ok(count >= 3);
  // One chunk goes, then the network is gone for good.
  dav.downAfterPuts(1);
  const cut = await copyToServer(p);
  assert.match(cut.error, /Could not reach/);
  assert.ok(cut.done < cut.total);
  assert.equal((await chunksThere(dav, p)).size, 1);
  // Fails once, then goes: tried again within the same copy.
  dav.setDown(false);
  dav.failPuts(1);
  const resumed = await copyToServer(p);
  assert.equal(resumed.error, '');
  assert.equal(resumed.done, resumed.total);
  assert.deepEqual(await chunksThere(dav, p), localChunks());
  assert.equal(dav.asked.filter((a) => a.startsWith('PUT')).length, 1 + (count - 1) + 1);

  // A chunk cut short there, of the wrong size: sent again whole.
  const { folder } = (await loadCollection(p)).server!;
  const [name, bytes] = [...localChunks()][0];
  dav.there.set(`${folder}/${name}`, bytes.slice(0, 100));
  dav.asked.length = 0;
  await copyToServer(p);
  assert.deepEqual(
    dav.asked.filter((a) => a.startsWith('PUT')),
    [`PUT ${folder}/${name}`],
  );
  assert.deepEqual(await chunksThere(dav, p), localChunks());
});

t('deleting a file deletes its chunks there an hour later, and its small picture, but nothing that is not a chunk of this place', async () => {
  const dav = davServer();
  const p = place();
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  const a = await addToCollection(p, bytesSource(randomBytes(100 * 1024)), photo, { thumb: randomBytes(500) });
  const b = await addToCollection(p, bytesSource(randomBytes(1000)), { ...photo, name: 'b.jpg' });
  await copyToServer(p);
  const { folder } = (await loadCollection(p)).server!;
  // Files of the owner's in the subfolder, one named almost as a chunk.
  dav.there.set(`${folder}/holiday.jpg`, new Uint8Array(5));
  dav.there.set(`${folder}/erevos-file-xyz`, new Uint8Array(5));
  await deleteItems(p, [a.id]);
  // The first copy after only notes that the catalogue no longer names them: a linked device's
  // new file, not yet heard of here, is kept so. An hour on, they go.
  await copyToServer(p, undefined, () => 1_000);
  assert.ok(dav.there.has(`${folder}/${PREFIX}${a.file.id}-0`));
  await copyToServer(p, undefined, () => 1_000 + 30 * 60_000);
  assert.ok(dav.there.has(`${folder}/${PREFIX}${a.file.id}-0`));
  await copyToServer(p, undefined, () => 1_000 + 61 * 60_000);
  const left = await chunksThere(dav, p);
  assert.deepEqual([...left.keys()].sort(), [...localChunks().keys()].sort());
  assert.ok([...left.keys()].every((name) => name.includes(b.file.id)));
  assert.ok(!dav.there.has(`${folder}/${PREFIX}${a.thumb!.id}-0`));
  assert.ok(dav.there.has(`${folder}/holiday.jpg`));
  assert.ok(dav.there.has(`${folder}/erevos-file-xyz`));
  assert.ok(dav.there.has('notes.txt'));
});

t('a file missing on the phone is fetched from the server as it opens; a changed chunk there is refused', async () => {
  const dav = davServer();
  const p = place();
  setCurrentSpace(0, p.key);
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  const bytes = randomBytes(2500 * 1024);
  const item = await addToCollection(p, bytesSource(bytes), photo, { thumb: randomBytes(700) });
  assert.ok(item.file.count >= 2);
  await copyToServer(p);
  // As on a new phone with the catalogue from a backup, without the chunks.
  blobs.clear();
  assert.deepEqual(await openItem(item), bytes);
  assert.equal((await openThumb(item))?.length, 700);

  // A chunk changed on the server, or another file's put in its place: not kept.
  const { folder } = (await loadCollection(p)).server!;
  const name = `${PREFIX}${item.file.id}-1`;
  const good = dav.there.get(`${folder}/${name}`)!;
  const tampered = good.slice();
  tampered[100] ^= 1;
  dav.there.set(`${folder}/${name}`, tampered);
  blobs.clear();
  assert.equal(await openItem(item), null);
  assert.equal(blobs.has(name), false);
  dav.there.set(`${folder}/${name}`, dav.there.get(`${folder}/${PREFIX}${item.file.id}-0`)!);
  assert.equal(await fillItem(p, item), false);
  assert.equal(blobs.has(name), false);
  dav.there.set(`${folder}/${name}`, good);
  assert.equal(await fillItem(p, item), true);
  assert.deepEqual(await openItem(item), bytes);

  // A place with another key knows no such file, nor server: nothing is fetched for it.
  blobs.clear();
  const other = place();
  assert.equal(await fillItem(other, item), false);
  setCurrentSpace(0, other.key);
  assert.equal(await openItem(item), null);
});

t('turned off, nothing goes; a backup made while the copies are whole leaves the chunks out', async () => {
  const dav = davServer();
  const p = place();
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  await addToCollection(p, bytesSource(randomBytes(2000)), photo);
  // Not copied yet: the backup takes them.
  assert.equal((await backupSkips([p])).size, 0);
  await copyToServer(p);
  assert.deepEqual(await backupSkips([p]), new Set(localChunks().keys()));
  // A change not yet copied: taken again.
  await addToCollection(p, bytesSource(randomBytes(2000)), { ...photo, name: 'b.jpg' });
  assert.equal((await backupSkips([p])).size, 0);
  await copyToServer(p);
  assert.equal((await backupSkips([p])).size, 2);
  await turnCollectionServer(p, false);
  assert.equal((await backupSkips([p])).size, 0);
  await addToCollection(p, bytesSource(randomBytes(2000)), { ...photo, name: 'c.jpg' });
  dav.asked.length = 0;
  const off = await copyToServer(p);
  assert.equal(off.running, false);
  assert.equal(dav.asked.length, 0);
  assert.equal(serverStatus(p)?.error, '');
  // On again, the same subfolder: only the new one goes.
  await turnCollectionServer(p, true);
  await copyToServer(p);
  assert.equal(dav.asked.filter((a) => a.startsWith('PUT')).length, 1);
  assert.deepEqual(serverFolder((await loadCollection(p)).server!).url.startsWith(ROOT), true);
});

t('a copy stopped as it runs sends no more, and says no error', async () => {
  const dav = davServer();
  const p = place();
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  await addToCollection(p, bytesSource(randomBytes(3 * 1024 * 1024)), { ...photo, name: 'big.bin', kind: 'file' });
  const stop = new AbortController();
  const push = dav.asked.push.bind(dav.asked);
  dav.asked.push = (...items: string[]) => {
    if (items.some((a) => a.startsWith('PUT'))) stop.abort();
    return push(...items);
  };
  const stopped = await copyToServer(p, stop.signal);
  assert.equal(stopped.running, false);
  assert.equal(stopped.error, '');
  assert.equal((await chunksThere(dav, p)).size, 1);
});

t('after Erevos starts again, the copies are still whole for the same chunks; any file added or deleted takes them into backups again', async () => {
  const dav = davServer();
  const p = place();
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  const a = await addToCollection(p, bytesSource(randomBytes(2000)), photo, { thumb: randomBytes(300) });
  await copyToServer(p);
  const all = new Set(localChunks().keys());
  assert.deepEqual(await backupSkips([p]), all);
  // The mark is kept sealed with the server, not in plain storage.
  assert.match((await loadCollection(p)).server?.whole ?? '', /^[0-9a-f]{64}$/);
  // As after a restart: nothing in memory, the catalogue as it was.
  forgetCollectionRuns();
  assert.deepEqual(await backupSkips([p]), all);
  // A rename names the same chunks: still whole.
  await renameItem(p, a.id, 'renamed.jpg');
  forgetCollectionRuns();
  assert.deepEqual(await backupSkips([p]), all);
  // A file added: not whole, in memory nor after a restart.
  const b = await addToCollection(p, bytesSource(randomBytes(2000)), { ...photo, name: 'b.jpg' });
  assert.equal((await backupSkips([p])).size, 0);
  forgetCollectionRuns();
  assert.equal((await backupSkips([p])).size, 0);
  await copyToServer(p);
  forgetCollectionRuns();
  assert.equal((await backupSkips([p])).size, localChunks().size);
  // A file deleted: not whole until copied again.
  await deleteItems(p, [b.id]);
  forgetCollectionRuns();
  assert.equal((await backupSkips([p])).size, 0);
  await copyToServer(p);
  forgetCollectionRuns();
  assert.equal((await backupSkips([p])).size, localChunks().size);
  // Turned off: taken again; the server given anew: not whole until copied.
  await turnCollectionServer(p, false);
  assert.equal((await backupSkips([p])).size, 0);
  await turnCollectionServer(p, true);
  forgetCollectionRuns();
  assert.equal((await backupSkips([p])).size, localChunks().size);
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  forgetCollectionRuns();
  assert.equal((await backupSkips([p])).size, 0);
  assert.ok(dav.there.size > 0);
});

t('a file fetched from the server says how far it is; stopped, it keeps what came and goes on from there', async () => {
  const dav = davServer();
  const p = place();
  setCurrentSpace(0, p.key);
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  const bytes = randomBytes(4 * 1024 * 1024 + 5000);
  const item = await addToCollection(p, bytesSource(bytes), { ...photo, name: 'film.mp4', mime: 'video/mp4', kind: 'file' });
  const count = item.file.count;
  assert.ok(count >= 5);
  await copyToServer(p);
  blobs.clear();
  assert.equal(await fillItemHere(item, {}).then(() => blobs.size > 0), true);
  blobs.clear();

  // Stopped once two chunks came.
  const stop = new AbortController();
  const heard: FillProgress[] = [];
  await assert.rejects(
    fillItemHere(item, {
      signal: stop.signal,
      progress: (progress) => {
        heard.push(progress);
        if (progress.done === 2) stop.abort();
      },
    }),
    FillStoppedError,
  );
  assert.deepEqual(
    heard.map((h) => h.done),
    [0, 1, 2],
  );
  assert.ok(heard.every((h) => h.total === count && h.size === item.file.size));
  assert.equal(heard[0].bytes, 0);
  assert.ok(heard[2].bytes > heard[1].bytes);
  const kept = [...blobs.keys()].filter((name) => name.includes(item.file.id));
  assert.equal(kept.length, 2);

  // Gone on with: only the rest is asked of the server, counted from where it stopped.
  dav.asked.length = 0;
  const again: FillProgress[] = [];
  assert.equal(await fillItemHere(item, { progress: (progress) => again.push(progress) }), true);
  assert.equal(again[0].done, 2);
  assert.equal(again[again.length - 1].done, count);
  assert.equal(again[again.length - 1].bytes, item.file.size);
  assert.equal(dav.asked.filter((a) => a.startsWith('GET')).length, count - 2);
  assert.deepEqual(await openItem(item), bytes);

  // All here: nothing is asked.
  dav.asked.length = 0;
  assert.equal(await fillItemHere(item), true);
  assert.equal(dav.asked.length, 0);

  // openItem is stopped the same way, and says so.
  blobs.clear();
  const early = new AbortController();
  early.abort();
  await assert.rejects(openItem(item, { signal: early.signal }), FillStoppedError);
});

t('a copy is read back as the server lists it before it counts as whole: a chunk the server took and did not keep goes again', async () => {
  const dav = davServer();
  const p = place();
  setCurrentSpace(0, p.key);
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  await addToCollection(p, bytesSource(randomBytes(2500 * 1024)), photo);
  // The server says it took every chunk, and keeps all but the first.
  const keep = dav.there.set.bind(dav.there);
  let dropped = '';
  dav.there.set = (path: string, bytes: Uint8Array) => {
    if (!dropped && path.includes(PREFIX)) {
      dropped = path;
      return dav.there;
    }
    return keep(path, bytes);
  };
  const short = await copyToServer(p, undefined, () => 5000);
  assert.match(short.error, /1 of its pieces is not on the server whole/);
  assert.equal(short.began, 5000);
  // Not whole: a backup made now takes its chunks, and says nothing of the server.
  assert.equal((await backupSkips([p])).size, 0);
  assert.deepEqual(await openCollectionsLeftOut(), { byChoice: false, onServer: false });
  dav.there.set = keep;
  const again = await copyToServer(p, undefined, () => 6000);
  assert.equal(again.error, '');
  assert.equal(again.began, 6000);
  assert.equal(again.last, 6000);
  assert.deepEqual(await chunksThere(dav, p), localChunks());
  // Whole now: a backup leaves them out, and the backup screen can say why.
  assert.deepEqual(await openCollectionsLeftOut(), { byChoice: false, onServer: true });
  await setCollectionBackup(p, false);
  assert.deepEqual(await openCollectionsLeftOut(), { byChoice: true, onServer: false });
  setCurrentSpace(null);
  assert.deepEqual(await openCollectionsLeftOut(), { byChoice: false, onServer: false });
});

t('a check finds every piece there, of its size, and opens a few with their key; one missing or changed there is found, and nothing is changed', async () => {
  const dav = davServer();
  const p = place();
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  const item = await addToCollection(p, bytesSource(randomBytes(2500 * 1024)), photo, { thumb: randomBytes(700) });
  await addToCollection(p, bytesSource(randomBytes(4000)), { ...photo, name: 'b.jpg' });
  await copyToServer(p);
  const pieces = localChunks().size;
  assert.ok(pieces > SERVER_SAMPLE);
  assert.deepEqual(await checkCollectionServer(p, { now: () => 7000 }), { at: 7000, files: 2, pieces, missing: 0, damaged: 0, read: SERVER_SAMPLE, error: '' });
  // Only looked at and fetched: nothing sent, nothing deleted.
  const before = dav.asked.length;
  await checkCollectionServer(p);
  assert.deepEqual(dav.asked.slice(before).filter((a) => !a.startsWith('PROPFIND') && !a.startsWith('GET')), []);
  // One gone there.
  const { folder } = (await loadCollection(p)).server!;
  const name = `${folder}/${PREFIX}${item.file.id}-1`;
  const good = dav.there.get(name)!;
  dav.there.delete(name);
  const gone = await checkCollectionServer(p);
  assert.equal(gone.missing, 1);
  assert.equal(gone.damaged, 0);
  // One changed there, of its size: found once it is among those fetched, here all of them.
  const tampered = good.slice();
  tampered[100] ^= 1;
  dav.there.set(name, tampered);
  const changed = await checkCollectionServer(p, { sample: pieces });
  assert.equal(changed.damaged, 1);
  assert.equal(changed.read, pieces - 1);
  // One of another size, without fetching it.
  dav.there.set(name, good.slice(0, 10));
  assert.equal((await checkCollectionServer(p, { sample: 0 })).damaged, 1);
  // The server out of reach: said.
  dav.setDown(true);
  assert.match((await checkCollectionServer(p)).error, /Could not reach/);
});

t('every file not on this phone comes back from the server at once, with its small picture; one the server lacks is said, and a stop keeps what came', async () => {
  const dav = davServer();
  const p = place();
  await connectCollectionServer(p, ROOT, 'me', 'app-pass');
  const a = randomBytes(2500 * 1024);
  const b = randomBytes(5000);
  const one = await addToCollection(p, bytesSource(a), photo, { thumb: randomBytes(700) });
  const two = await addToCollection(p, bytesSource(b), { ...photo, name: 'b.jpg' });
  const three = await addToCollection(p, bytesSource(randomBytes(3000)), { ...photo, name: 'c.jpg' });
  await copyToServer(p);
  // All here: nothing to bring.
  assert.deepEqual(await bringBackAll(p), { wanted: 0, came: 0, failed: 0 });
  // As on a new phone with the catalogue from a backup and none of the chunks; and one file lost on the server too.
  blobs.clear();
  for (const path of [...dav.there.keys()]) if (path.includes(three.file.id)) dav.there.delete(path);
  const told: [number, number][] = [];
  assert.deepEqual(await bringBackAll(p, { progress: (done, all) => told.push([done, all]) }), { wanted: 3, came: 2, failed: 1 });
  assert.deepEqual(told, [
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
  ]);
  // They open here now, the server gone.
  dav.setDown(true);
  assert.deepEqual(await openItem(one), a);
  assert.deepEqual(await openItem(two), b);
  assert.equal((await openThumb(one))?.length, 700);
  // Stopped: says so.
  dav.setDown(false);
  const stop = new AbortController();
  stop.abort();
  await assert.rejects(bringBackAll(p, { signal: stop.signal }), FillStoppedError);
  // Out of reach: said, with nothing lost of what came.
  dav.setDown(true);
  await assert.rejects(bringBackAll(p), /Could not reach/);
  assert.deepEqual(await openItem(one), a);
});

t('the Collection’s server card says it holds only this Collection’s files and when the last copy began and ended, and offers a check and bringing them all back', async () => {
  const screen = readFileSync(join(import.meta.dirname, '..', 'app', 'collection-settings.tsx'), 'utf8');
  assert.match(screen, /t\('Only this Collection’s files, encrypted: \{done\} of \{total\} are on the server\.'/);
  assert.match(screen, /t\('The last copy began \{start\} and ended \{end\}\.'/);
  assert.doesNotMatch(screen, /Uploaded \{done\} of \{total\}/);
  assert.match(screen, /onPress=\{\(\) => void check\(\)\}/);
  assert.match(screen, /onPress=\{\(\) => void bringBack\(\)\}/);
  assert.match(screen, /setChecked\(await checkCollectionServer\(place\)\)/);
  assert.match(screen, /await bringBackAll\(place, \{ signal: stop\.signal, progress: \(done, all\) => setBringing\(\{ done, all \}\) \}\)/);
});

