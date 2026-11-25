// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The camera with Erevos locked (lock/camera-drop.ts, lib/camera-drops.ts): what it takes is kept
// encrypted, with nothing on the phone that opens it; only the key of the space it was taken for
// opens it, and brings it into that space's Collection, once; another space's key opens nothing
// and takes nothing; turned off, no key is kept; and the locked screen's camera reaches no space's
// key, no Collection and no other screen.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import { bytesSource, readFile as readKept } from '../lib/attachments';
import { dropsOfClosedSpaces, keepDropped, takeDrops } from '../lib/camera-drops';
import { relaySeal, sealPublic, setCore, type Core } from '../lib/core';
import { randomBytes, toBase64, toHex, utf8Encode } from '../lib/crypto';
import { forgetPendingChunks } from '../lib/pending-chunks';
import { PREFIX, type FileRef } from '../lock/attachment-files';
import {
  CAMERA_DROP_KEY,
  CAMERA_OPEN_KEY,
  cameraOpensLocked,
  discardDrops,
  discardOthersDrops,
  DROP_PREFIX,
  dropKey,
  dropSecret,
  forgetDropKey,
  keepDrop,
  openDrop,
  publishDropKey,
  setCameraOpensLocked,
  waitingDrops,
} from '../lock/camera-drop';
import { COLLECTION_CHUNKS, loadCollection, openItem, openThumb, type CollectionPlace } from '../lock/collection-data';
import { setCurrentSpace } from '../lock/keys';
import { blobs, files } from './files-memory';
import { store } from './secure-memory';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built);
if (coreReady) {
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, call]) => [name, async (...args: never[]) => call(...args)])) as unknown as Core);
} else {
  console.log('Skipping the checks of the camera with Erevos locked: build the core first with node checks/build-core.mjs');
}

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

// A phone with two spaces behind passwords, nothing taken yet.
async function phone(): Promise<{ first: CollectionPlace; second: CollectionPlace }> {
  files.clear();
  blobs.clear();
  store.clear();
  setCurrentSpace(null);
  await forgetPendingChunks();
  return { first: { holder: 'space', space: 0, key: randomBytes(32) }, second: { holder: 'space', space: 1, key: randomBytes(32) } };
}

const chunks = () => [...blobs.keys()].filter((name) => name.startsWith(PREFIX));
const photo = (length: number) => Uint8Array.from({ length }, (_, i) => (i * 31 + 7) % 251);
const same = (a: Uint8Array | null, b: Uint8Array) => !!a && a.length === b.length && a.every((byte, i) => byte === b[i]);

test('what the locked camera keeps says nothing in the clear, and only its space’s key opens it', { skip: !coreReady }, async () => {
  const { first, second } = await phone();
  await publishDropKey(first.key);
  const to = await dropKey();
  assert.ok(to);
  // The key kept on the phone is the public half only: the secret is made from the space's key.
  assert.equal(store.get(CAMERA_DROP_KEY), toHex(await sealPublic(dropSecret(first.key))));
  assert.notEqual(store.get(CAMERA_DROP_KEY), toHex(dropSecret(first.key)));

  const taken = photo(300_000);
  const small = photo(4_000);
  await keepDropped(to, bytesSource(taken), { name: 'IMG_20261125_101500.jpg', mime: 'image/jpeg', kind: 'photo', w: 4000, h: 3000 }, small, 1_795_000_000_000);

  const [name] = await waitingDrops();
  assert.ok(name?.startsWith(DROP_PREFIX));
  assert.equal((await waitingDrops()).length, 1);
  // Its note names the chunks, as their own names do, and nothing more: not the name, the type, the size or a key.
  const note = files.get(name)!;
  const said = JSON.parse(note) as { v: number; files: { id: string; count: number }[]; sealed: string };
  assert.deepEqual(Object.keys(said).sort(), ['files', 'sealed', 'v']);
  assert.equal(said.files.length, 2);
  assert.ok(!/IMG_|jpeg|jpg|4000|3000|300000|"key"/.test(note));
  for (const file of said.files) for (let n = 0; n < file.count; n++) assert.ok(blobs.has(`${PREFIX}${file.id}-${n}`));
  assert.equal(chunks().length, said.files.reduce((sum, file) => sum + file.count, 0));
  // No chunk holds the photo's bytes as they are.
  const head = toHex(taken.slice(0, 32));
  for (const chunk of chunks()) assert.ok(!toHex(blobs.get(chunk)!).includes(head));
  // Nothing in the keystore opens it: no entry holds a secret key of the camera.
  assert.deepEqual([...store.keys()].filter((key) => key.startsWith('erevos.camera')).sort(), [CAMERA_DROP_KEY]);

  // Another space's key opens nothing of it, and cannot tell it from one that does not read.
  assert.deepEqual(await openDrop(name, second.key), { mine: false, held: null });
  // Its own space's key does.
  const { mine, held } = await openDrop(name, first.key);
  assert.equal(mine, true);
  assert.ok(held);
  assert.equal(held.file.name, 'IMG_20261125_101500.jpg');
  assert.equal(held.file.size, taken.length);
  assert.equal(held.at, 1_795_000_000_000);
  assert.ok(same(await readKept(held.file), taken));
  assert.ok(held.thumb && same(await readKept(held.thumb), small));
});

test('it comes into the Collection of the space it was taken for, once, and into no other', { skip: !coreReady }, async () => {
  const { first, second } = await phone();
  await publishDropKey(first.key);
  const to = (await dropKey())!;
  const before = Date.now() - 60_000;
  const taken = photo(70_000);
  const film = photo(2_300_000);
  await keepDropped(to, bytesSource(film), { name: 'VID_20261125_101600.mp4', mime: 'video/mp4', kind: 'file' }, undefined, before + 1000);
  await keepDropped(to, bytesSource(taken), { name: 'IMG_20261125_101500.jpg', mime: 'image/jpeg', kind: 'photo', w: 800, h: 600 }, photo(900), before);
  assert.equal((await waitingDrops()).length, 2);

  // The second password's space opens first: nothing comes in, nothing goes.
  assert.equal(await takeDrops(second), 0);
  assert.equal((await loadCollection(second)).items.length, 0);
  assert.equal((await waitingDrops()).length, 2);
  const kept = new Map(files);

  // Its own space: both, the oldest first, with when they were taken, at the top.
  assert.equal(await takeDrops(first), 2);
  const collection = await loadCollection(first);
  assert.deepEqual(collection.items.map((item) => [item.file.name, item.folder, item.added]), [
    ['IMG_20261125_101500.jpg', '', before],
    ['VID_20261125_101600.mp4', '', before + 1000],
  ]);
  assert.ok(same(await openItem(collection.items[0]), taken));
  assert.ok(same(await openThumb(collection.items[0]), photo(900)));
  assert.ok(same(await openItem(collection.items[1]), film));
  assert.equal(collection.items[1].thumb, undefined);
  assert.deepEqual(await waitingDrops(), []);
  assert.equal((await loadCollection(second)).items.length, 0);

  // Erevos stopped after the catalogue was written and before the notes went: they are there
  // again, and nothing is added twice.
  for (const [name, text] of kept) if (name.startsWith(DROP_PREFIX)) files.set(name, text);
  assert.equal((await waitingDrops()).length, 2);
  await takeDrops(first);
  assert.equal((await loadCollection(first)).items.length, 2);
  assert.deepEqual(await waitingDrops(), []);
  // And every chunk on the phone is one the Collection names.
  const named = new Set((await loadCollection(first)).items.flatMap((item) => [item.file, ...(item.thumb ? [item.thumb] : [])]).flatMap((ref) => Array.from({ length: ref.count }, (_, n) => `${PREFIX}${ref.id}-${n}`)));
  assert.deepEqual(chunks().sort(), [...named].sort());
});

test('what is taken for the space opened last is not the next space’s: each takes its own', { skip: !coreReady }, async () => {
  const { first, second } = await phone();
  await publishDropKey(first.key);
  await keepDropped((await dropKey())!, bytesSource(photo(1000)), { name: 'one.jpg', mime: 'image/jpeg', kind: 'photo' });
  // The other space opens: from now on the camera takes for it.
  await publishDropKey(second.key);
  assert.equal(store.get(CAMERA_DROP_KEY), toHex(await sealPublic(dropSecret(second.key))));
  assert.equal(await takeDrops(second), 0);
  await keepDropped((await dropKey())!, bytesSource(photo(2000)), { name: 'two.jpg', mime: 'image/jpeg', kind: 'photo' });
  assert.equal(await takeDrops(second), 1);
  assert.deepEqual((await loadCollection(second)).items.map((item) => item.file.name), ['two.jpg']);
  assert.equal((await waitingDrops()).length, 1);
  assert.equal(await takeDrops(first), 1);
  assert.deepEqual((await loadCollection(first)).items.map((item) => item.file.name), ['one.jpg']);
  assert.deepEqual(await waitingDrops(), []);
});

test('turned off, no key is kept and none is given; on again, the open space gives its own', { skip: !coreReady }, async () => {
  const { first } = await phone();
  // On until turned off.
  assert.equal(await cameraOpensLocked(), true);
  assert.equal(await dropKey(), null);
  await publishDropKey(first.key);
  assert.ok(await dropKey());
  await setCameraOpensLocked(false);
  assert.equal(await cameraOpensLocked(), false);
  assert.equal(store.get(CAMERA_OPEN_KEY), 'no');
  assert.equal(store.has(CAMERA_DROP_KEY), false);
  assert.equal(await dropKey(), null);
  // A space that opens meanwhile gives none.
  await publishDropKey(first.key);
  assert.equal(store.has(CAMERA_DROP_KEY), false);
  await setCameraOpensLocked(true, first.key);
  assert.equal(store.get(CAMERA_DROP_KEY), toHex(await sealPublic(dropSecret(first.key))));
  // The lock turned off: no password screen for the camera to open in front of.
  await forgetDropKey();
  assert.equal(await dropKey(), null);
});

test('a note that is not as the camera writes it, or whose chunks are gone, goes; one that cannot be kept leaves no chunk', { skip: !coreReady }, async () => {
  const { first } = await phone();
  await publishDropKey(first.key);
  const to = (await dropKey())!;

  // Its chunks are gone (a backup restored since): the note goes, nothing comes in.
  await keepDropped(to, bytesSource(photo(5000)), { name: 'gone.jpg', mime: 'image/jpeg', kind: 'photo' }, photo(300));
  for (const chunk of chunks()) blobs.delete(chunk);
  assert.equal(await takeDrops(first), 0);
  assert.deepEqual(await waitingDrops(), []);
  assert.equal((await loadCollection(first)).items.length, 0);

  // Only its small picture is gone: the file comes in without one.
  await keepDropped(to, bytesSource(photo(5000)), { name: 'bare.jpg', mime: 'image/jpeg', kind: 'photo' }, photo(300));
  const [bare] = await waitingDrops();
  const thumb = (JSON.parse(files.get(bare)!) as { files: { id: string }[] }).files[1].id;
  blobs.delete(`${PREFIX}${thumb}-0`);
  assert.equal(await takeDrops(first), 1);
  assert.equal((await loadCollection(first)).items[0].thumb, undefined);

  // Sealed for this space, but not a file as the Collection keeps one: it goes, with the chunks it names.
  const id = 'c3'.repeat(16);
  blobs.set(`${PREFIX}${id}-0`, new Uint8Array(65536));
  const mark = new Uint8Array(24);
  mark.set(utf8Encode('erevos camera drop v1'));
  const sealed = await relaySeal(to, mark, utf8Encode(JSON.stringify({ file: { id, key: 'zz', name: '../x' }, at: 5 })));
  files.set(`${DROP_PREFIX}${'d4'.repeat(16)}`, JSON.stringify({ v: 1, files: [{ id, count: 1 }], sealed: toBase64(sealed) }));
  assert.deepEqual(await openDrop(`${DROP_PREFIX}${'d4'.repeat(16)}`, first.key), { mine: true, held: null });
  assert.equal(await takeDrops(first), 0);
  assert.deepEqual(await waitingDrops(), []);
  assert.equal(blobs.has(`${PREFIX}${id}-0`), false);

  // Sealed for the same key with another mark: never read as a note.
  const other = await relaySeal(to, new Uint8Array(24), utf8Encode('{}'));
  files.set(`${DROP_PREFIX}${'e5'.repeat(16)}`, JSON.stringify({ v: 1, files: [{ id, count: 1 }], sealed: toBase64(other) }));
  assert.deepEqual(await openDrop(`${DROP_PREFIX}${'e5'.repeat(16)}`, first.key), { mine: true, held: null });
  files.delete(`${DROP_PREFIX}${'e5'.repeat(16)}`);

  // A note whose chunks it says in the clear are not the ones it holds sealed is not taken.
  const real: FileRef = { name: 'a.jpg', mime: 'image/jpeg', kind: 'photo', size: 10, id: 'a1'.repeat(16), key: 'b2'.repeat(32), chunk: 65536, count: 1 };
  const kept = await keepDrop(to, real, null, 1);
  const lied = JSON.parse(files.get(kept)!) as { files: { id: string; count: number }[] };
  lied.files[0].id = 'f6'.repeat(16);
  files.set(kept, JSON.stringify(lied));
  assert.deepEqual(await openDrop(kept, first.key), { mine: true, held: null });
  files.delete(kept);

  // The note cannot be written (the phone is full): no chunk of it stays, and none waits to be swept.
  const before = chunks().length;
  const set = files.set.bind(files);
  files.set = (name, value) => {
    if (name.startsWith(DROP_PREFIX)) throw new Error('no room');
    return set(name, value);
  };
  try {
    await assert.rejects(keepDropped(to, bytesSource(photo(5000)), { name: 'full.jpg', mime: 'image/jpeg', kind: 'photo' }, photo(300)), /no room/);
  } finally {
    files.set = set;
  }
  assert.equal(chunks().length, before);
  assert.ok(![...store.keys()].some((key) => key.startsWith('erevos.chunks-pending') && store.get(key) !== '[]' && /[0-9a-f]{32}/.test(store.get(key) ?? '')));
});

test('a restore takes away what waits, with its chunks, and whom the camera takes for', { skip: !coreReady }, async () => {
  const { first } = await phone();
  await publishDropKey(first.key);
  await keepDropped((await dropKey())!, bytesSource(photo(5000)), { name: 'old.jpg', mime: 'image/jpeg', kind: 'photo' }, photo(300));
  assert.equal(chunks().length, 2);
  await discardDrops();
  assert.deepEqual(await waitingDrops(), []);
  assert.equal(chunks().length, 0);
  assert.equal(store.has(CAMERA_DROP_KEY), false);
  const backup = read('../lock/backup.ts');
  assert.match(backup, /const NEVER_KEPT = \['erevos\.phone-speed', CAMERA_DROP_KEY\];/);
  assert.match(backup, /const STAYS_UNSAID = \[CAMERA_OPEN_KEY\];/);
  assert.match(backup, /await discardDrops\(\)\.catch\(\(\) => undefined\);/);
});

test('when the first space closes the others for good, what waited for them goes with its chunks, and its own stays', { skip: !coreReady }, async () => {
  const { first, second } = await phone();
  const third: CollectionPlace = { holder: 'space', space: 2, key: randomBytes(32) };
  const take = async (place: CollectionPlace, name: string) => {
    await publishDropKey(place.key);
    await keepDropped((await dropKey())!, bytesSource(photo(3000)), { name, mime: 'image/jpeg', kind: 'photo' }, photo(200));
  };
  await take(first, 'mine.jpg');
  await take(second, 'theirs.jpg');
  await take(third, 'further.jpg');
  assert.equal((await waitingDrops()).length, 3);
  assert.equal(chunks().length, 6);
  // A note that does not read as one is no one's to delete.
  const torn = `${DROP_PREFIX}${'a7'.repeat(16)}`;
  files.set(torn, '{"v":1,"files":[');

  // From any space but the first, a note it does not open may be for a space before it: nothing goes.
  assert.equal(await dropsOfClosedSpaces(1, second.key), 0);
  assert.equal(await dropsOfClosedSpaces(2, third.key), 0);
  assert.equal((await waitingDrops()).length, 4);
  assert.equal(chunks().length, 6);

  // The first space removed its second password, or turned its lock off: only its own waits on.
  assert.equal(await dropsOfClosedSpaces(0, first.key), 2);
  assert.equal((await waitingDrops()).length, 2);
  assert.equal(chunks().length, 2);
  assert.equal(files.has(torn), true);
  assert.equal(await takeDrops(first), 1);
  assert.deepEqual((await loadCollection(first)).items.map((item) => item.file.name), ['mine.jpg']);
  assert.ok((await loadCollection(first)).items[0].thumb);
  // Nothing of the others' is left to take, whichever opens.
  assert.equal(await takeDrops(second), 0);
  assert.equal(await discardOthersDrops(first.key), 0);
  assert.deepEqual(await waitingDrops(), [torn]);
});

test('the lock screen settings call it as the second password goes or the lock is turned off, and the camera follows the lock', () => {
  const security = read('../app/security.tsx');
  assert.match(security, /await removePasswordLock\(space, currentSpace\(\)\.key\);\s*\/\/[^\n]*\n\s*await dropsOfClosedSpaces\(space, currentSpace\(\)\.key\)\.catch\(\(\) => undefined\);/);
  assert.match(security, /await removeSecondPassword\(space, currentSpace\(\)\.key\);\s*await dropsOfClosedSpaces\(space, currentSpace\(\)\.key\)\.catch\(\(\) => undefined\);/);
  // Only from the first space: elsewhere a note may be for a space that still opens.
  assert.match(read('../lib/camera-drops.ts'), /return space === 0 \? discardOthersDrops\(spaceKey\) : 0;/);
  // The lock turned on or off in the open space: the camera takes for it at once, or for none.
  assert.match(read('../app/_layout.tsx'), /setPasswordLock: \(on\) => \{\s*setPhase\(\(p\) => \(p\.kind === 'open' \? \{ \.\.\.p, passwordLock: on \} : p\)\);[\s\S]{0,300}cameraFollows\(on\);\s*\},/);
});

test('a file of the Collection and one the locked camera keeps may have as many chunks', () => {
  assert.match(read('../lock/camera-drop.ts'), new RegExp(`const MOST_CHUNKS = ${COLLECTION_CHUNKS};`));
});

test('the locked screen’s camera reaches no space’s key, no Collection and no other screen', () => {
  const layout = read('../app/_layout.tsx');
  const locked = layout.slice(layout.indexOf('function Locked('), layout.indexOf('// Whether Erevos’s camera is in this build') >= 0 ? layout.indexOf('// Whether Erevos’s camera is in this build') : layout.indexOf("// Whether Erevos's camera is in this build"));
  assert.ok(locked.length > 500);
  // It takes with the public key only, into no place, and shows the password screen when closed.
  assert.match(locked, /<ErevosCamera\s+visible\s+place=\{null\}\s+folder=""\s+sealTo=\{camera\}/);
  assert.match(locked, /setCamera\(null\);\s*\}\}\s*\/>\s*<\/View>\s*\);\s*\}\s*return <PasswordGate/);
  assert.ok(!/currentSpace|spaceCollection|loadCollection|openItem|openThumb|router\.|useLock/.test(locked));
  // Its link is taken only with a key to seal for, which is given only with the camera here, the Collection on and the switch on.
  assert.match(locked, /path === '\/collection' && params\.camera === '1' && sealTo\.current/);
  assert.match(layout, /return CAMERA_HERE && moduleOn\('collection'\) \? dropKey\(\) : null;/);

  // The camera itself: with a key to seal for it keeps through that alone.
  const camera = read('../components/erevos-camera.tsx');
  assert.match(camera, /if \(sealTo\) await dropPicture\(sealTo, photo\);\s*else if \(place\) onAdded\?\.\(await keepPicture\(place, folder, photo\)\);/);
  assert.match(camera, /if \(sealTo\) await dropRecording\(sealTo, uri\);\s*else if \(place\) onAdded\?\.\(await keepRecording\(place, folder, uri\)\);/);
  // It closes as Erevos leaves the screen, locked too.
  assert.match(camera, /if \(state !== 'active' && !isPicking\(\)\) \{[\s\S]{0,200}onClose\(\);/);

  // What seals and what keeps the notes never ask for the open space, nor read a Collection.
  for (const path of ['../lock/camera-drop.ts']) assert.ok(!/lock\/keys|currentSpace|collection-data/.test(read(path).replace(/^\/\/.*$/gm, '')), path);
  const drops = read('../lib/camera-drops.ts');
  const keeping = drops.slice(drops.indexOf('export async function keepDropped'), drops.indexOf('let taking'));
  assert.ok(!/place|loadCollection|addTakenToCollection|openDrop|dropSecret/.test(keeping));
});

test('with the space open, the camera opens before the Collection’s password, unless the owner keeps it behind it', () => {
  const screen = read('../app/collection.tsx');
  assert.match(screen, /if \(forCamera && cameraFirst === null\) return null;\s*if \(forCamera && cameraFirst\) return <CameraFirst/);
  assert.match(screen, /const forCamera = camera === '1' && hidden !== '1' && CAN_TAKE_PHOTO;/);
  // It shows nothing of the Collection: the camera alone, into the space's own place.
  const first = screen.slice(screen.indexOf('function CameraFirst('), screen.indexOf('function OpenCollection('));
  assert.match(first, /<ErevosCamera visible place=\{place\} folder="" onClose=\{onClose\} \/>/);
  assert.ok(!/loadCollection|Thumb|openItem|CollectionGate/.test(first));
  // The switch is the phone's own, shown only behind a password, never in hidden chats.
  const settings = read('../app/collection-settings.tsx');
  assert.match(settings, /!DESK && CAN_TAKE_PHOTO && passwordLock && hidden !== '1'/);
  assert.match(settings, /await setCameraOpensLocked\(next, currentSpace\(\)\.key\);/);
});
