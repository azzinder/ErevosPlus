// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Backups of everything Erevos keeps on the phone (lock/backup.ts), with their parts, into a folder
// (lib/backup-place.ts, desktop/backups.js) and to a server (lib/backup-cloud.ts), made by hand or
// by themselves (lib/backup-folder.ts), which name again the parts of earlier ones (lib/backup-ledger.ts).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import * as nodeCrypto from 'node:crypto';
import * as nodeFs from 'node:fs';
import { mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { decryptBytes, encryptBytes, HARD, hardCost, nodeStyleGcm, randomBytes, setGcm, setHardCost, setPbkdf2, sha256Bytes, toHex, utf8Decode, utf8Encode, webCryptoPbkdf2 } from '../lib/crypto';
import { SmsLink } from '../lib/sms-link';
import { sendDue, waitsForOwner } from '../lib/sms-later';
import {
  BARE_PART,
  backupFileName,
  backupFileOf,
  backupKey,
  backupName,
  backupNative,
  backupPhoneCalls,
  backupPhoneSms,
  backupStem,
  DamagedPartError,
  earlierParts,
  freeStem,
  hardBackupKey,
  makeBackup,
  MissingPartError,
  newBackupHard,
  NewerBackupError,
  MAX_BACKUP_HARD,
  MAX_BACKUP_ITER,
  NotABackupError,
  openBackup,
  padme,
  PART,
  partFileName,
  restoreBackup,
  staleBackups,
  uniqueStem,
  unneededFiles,
  WrongBackupPasswordError,
  type Backup,
  type BackupKey,
  type MakeOptions,
  type PartMade,
  type PartReader,
  type PartSink,
} from '../lock/backup';
import {
  backupsListed,
  cloudFolder,
  CloudError,
  cloudParts,
  cloudServer,
  cloudThroughTor,
  fetchFromCloud,
  listCloud,
  loadCloudBackup,
  partName,
  runsOf,
  runsText,
  sendToCloud,
  setCloudHttp,
  setCloudRetry,
  setCloudTorWait,
  startCloudBackup,
  stopCloudBackup,
  type CloudBackup,
} from '../lib/backup-cloud';
import { setCore, type Core } from '../lib/core';
import { setThroughTor, setTorReady } from '../lib/relay';
import { ITER, loadLockConfig, setLockPassword, unlock } from '../lock/config';
import { History, newTag } from '../lock/history';
import { addNote, loadNotes, newNoteId } from '../lock/myself-data';
import { openHidden, prepareHidden, setHiddenPassword } from '../lock/hidden';
import { keepsPlace } from '../lock/hidden-keep';
import { loadRinged, ringPocket } from '../lock/hidden-ring';
import { loadWatched, watchPocket } from '../lock/hidden-watch';
import { loadDoor, saveDoor } from '../lock/doors';
import { setCurrentSpace } from '../lock/keys';
import { EMPTY_SPACE, loadHiddenData, loadSpaceData, prepareSpaces, saveHiddenData, saveSpaceData } from '../lock/space-data';
import { loadClip, saveClip } from '../lock/voice-clips';
import { loadPhoto, savePhoto } from '../lock/avatar-photos';
import { addOwnSticker, loadOwnStickers, openOwnSticker } from '../lock/sticker-data';
import { loadStars, starMessage } from '../lock/stars-data';
import { prepareQueueEntries } from '../lock/queues-data';
import { lastRestore, lostAt, lostMark, markLost, phoneId, restoredAt, restoredFromOther } from '../lock/restored';
import { letGoOfPages, PAGE_PREFIX, sealedFile } from '../lock/sealed-file';
import { lockedSpeedDials, phoneOpensLocked, setPhoneOpensLocked } from '../lib/phone-open';
import { PhoneSims } from '../lib/phone-sims';
import { loadMatrix, saveMatrix } from '../lock/matrix-data';
import { loadNostrDm, saveNostrDm } from '../lock/nostr-dm-data';
import { loadXmpp, saveXmpp } from '../lock/xmpp-data';
import type { MatrixState } from '../lib/matrix';
import { newNostrDm, type NostrDmState } from '../lib/nostr-dm';
import type { XmppState } from '../lib/xmpp';
import { cloudRequest as browserRequest } from '../lib/backup-http.web';
import { changeAutoBackup, CHECK_MS, checkAutoBackup, checkMadeBackup, checkSentBackup, isAutoBackupPassword, KEEP, loadAutoBackup, runAutoBackup, startAutoBackup, stopAutoBackup } from '../lib/backup-folder';
import { phoneCallsEntry } from '../lib/backup-calls';
import { checkedWhole, checkListed, loadChecks } from '../lib/backup-check';
import { folderPlace, loadLedger, saveLedger, serverPlace, type Ledger } from '../lib/backup-ledger';
import { backupMaking, beginBackupMaking, clearBackupMadeNote, forgetBackupMaking, onBackupMaking } from '../lib/backup-making';
import { phoneSettingsForBackup, putPhoneSettings } from '../lib/backup-native';
import { deleteBackupFiles, listBackupFiles, partsIn, writeBackup } from '../lib/backup-place';
import { rulesFrom, rulesJson } from '../lib/phone-rules';
import { blobs, files, stampsTold } from './files-memory';
import { nativeFolders } from './device-memory';
import { folders, looks, writes } from './folder-memory';
import { panic } from './panic-memory';
import { clearPhone, phone as phoneModule } from './phone-memory';
import { ready as relayReady, startRelay } from './real-relay';
import { store } from './secure-memory';
import { useWasmCore } from './wasm-core';

const wasmCore = useWasmCore();
// Argon2id at a small cost, so the many unlocks here run quick; its full cost has its own check.
setHardCost({ m: 64, t: 1 });

setPbkdf2(webCryptoPbkdf2()!);
// AES-GCM native, as the app has it on a phone (lib/crypto.ts setGcm): the many MB sealed here go quick.
assert.ok(setGcm(nodeStyleGcm(nodeCrypto)));

// Where a backup's parts go, and are read from, as a folder beside it would keep them: it stays
// when the phone is wiped, as another phone would find it.
const shelf = new Map<string, Uint8Array>();
let shelved = 0;
const toShelf: PartSink = async (bytes) => {
  const name = `part-${++shelved}`;
  shelf.set(name, bytes);
  return name;
};
const fromShelf: PartReader = async (name) => shelf.get(name) ?? null;
// A backup of everything on the phone, its parts on the shelf.
const backUp = (key: BackupKey, options: Partial<MakeOptions> = {}) => makeBackup(key, { parts: toShelf, ...options });
// One for a server, as sendToCloud makes it.
const toServer = (key: BackupKey) => (parts: PartSink) => makeBackup(key, { parts, bare: true });

const t = (name: string, fn: () => Promise<void>) =>
  test(name, async () => {
    store.clear();
    files.clear();
    blobs.clear();
    shelf.clear();
    folders.clear();
    clearPhone();
    await fn();
  });

const wipe = () => {
  store.clear();
  files.clear();
  blobs.clear();
};

// A phone with a locked space, its relay, a message, a voice message and a sticker made from a photo;
// and, as every start makes them, the queues entries (lock/queues-data.ts).
async function phone() {
  const key = randomBytes(32);
  await setLockPassword(0, 'real-1111', key);
  await prepareSpaces(1);
  await prepareQueueEntries();
  await saveSpaceData(0, key, { ...EMPTY_SPACE, url: 'wss://relay.example' });
  const history = await History.open('space', 0, key);
  await history.add({ peer: 'contact:aa', text: 'γεια σου', mine: true, at: 1, tag: newTag() });
  const clip = await saveClip(new Uint8Array([1, 2, 3, 4]), 1500);
  const photo = await savePhoto(new Uint8Array([5, 6, 7]));
  const sticker = await addOwnSticker({ holder: 'space', space: 0, key }, new Uint8Array([8, 9]));
  return { key, clip, photo, sticker };
}

t('a backup made while a value in pages is saved holds every page its files name', async () => {
  const { key } = await phone();
  const place = { holder: 'space' as const, space: 0, key };
  // Chat with myself, large enough for several pages.
  for (let i = 0; i < 12; i++) await addNote(place, { id: newNoteId(), at: 1000 + i, text: `${i}`.padEnd(6000, 'σ') });
  const made = await backupKey('backup-pass');
  // As the backup reads its first page, after the files, a save lets go of every other page the
  // files it read name, as one that changed them all would.
  let letGo = false;
  const get = blobs.get.bind(blobs);
  blobs.get = (name: string) => {
    if (name.startsWith(PAGE_PREFIX) && !letGo) {
      letGo = true;
      void letGoOfPages([...blobs.keys()].filter((other) => other.startsWith(PAGE_PREFIX) && other !== name).map((other) => other.slice(PAGE_PREFIX.length)));
    }
    return get(name);
  };
  let file: Uint8Array;
  try {
    file = await backUp(made);
  } finally {
    blobs.get = get;
  }
  assert.ok(letGo);
  // Let go of, they are gone from the phone once the backup is made; only the one read first is left.
  assert.equal([...blobs.keys()].filter((name) => name.startsWith(PAGE_PREFIX)).length, 1);

  wipe();
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  const opened = await unlock(await loadLockConfig(), 'real-1111');
  assert.ok(opened);
  assert.equal((await loadNotes({ holder: 'space', space: 0, key: opened.key })).length, 12);
});

t('a restore that cannot write all of it (a full phone) leaves the phone as it was, never half of each', async () => {
  await phone();
  const file = await backUp(await backupKey('backup-pass'));
  // The phone moves on after the backup: another space password, other files, and a space that
  // keeps speed dial working with Erevos locked (lib/phone-open.ts).
  store.set('erevos.lock', 'the phone now');
  files.set('erevos-archive', 'the phone now');
  store.set('erevos.phone-speed', '{"feed":"ab","keys":[{"key":"2","number":"6911111111"}]}');
  // And its photos and files are gone since, so the parts bring ones it does not have.
  const brought = [...blobs.keys()];
  for (const name of brought) blobs.delete(name);
  const marks = ['erevos.restored', 'erevos.restored-at', 'erevos.restored-elsewhere', 'erevos.restored-other', 'erevos.phone-id'];
  const keys = new Map([...store].filter(([name]) => !marks.includes(name)));
  const texts = new Map(files);
  const bytes = new Map(blobs);
  const opened = await openBackup(file, 'backup-pass');
  // The last file it writes, after the others, finds the phone full (the parts' own are written before).
  const last = opened.entries.filter((entry) => entry.kind === 1 || entry.kind === 2).at(-1)!;
  const [setText, setBytes] = [files.set.bind(files), blobs.set.bind(blobs)];
  files.set = (name, value) => {
    if (name === last.name) throw new Error('no room');
    return setText(name, value);
  };
  blobs.set = (name, value) => {
    if (name === last.name) throw new Error('no room');
    return setBytes(name, value);
  };
  try {
    await assert.rejects(restoreBackup(opened, fromShelf), /no room/);
  } finally {
    files.set = setText;
    blobs.set = setBytes;
  }
  assert.deepEqual(new Map([...store].filter(([name]) => !marks.includes(name))), keys);
  assert.deepEqual(new Map(files), texts);
  // Nor do the parts' photos and files stay, unseen, taking room.
  assert.ok(brought.length > 0);
  assert.deepEqual(new Map(blobs), bytes);
  // And the backup still restores whole once there is room.
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.ok(await unlock(await loadLockConfig(), 'real-1111'));
  assert.equal(store.has('erevos.phone-speed'), false);
});

// How far a backup made by hand is, and what came of it, are kept outside the screen
// (lib/backup-making.ts): what came of it names the file and its folder and counts the phone's SMS
// and calls, which a space opened after the one that made it is not to be shown.
t('what a backup being made says shows only in the space it began in: gone when that space closes, and dropped after', async () => {
  let told = 0;
  const stop = onBackupMaking(() => told++);
  const first = beginBackupMaking();
  first.making({ step: 'Encrypting…', percent: 40 });
  assert.deepEqual(backupMaking(), { making: { step: 'Encrypting…', percent: 40 }, note: null });
  assert.equal(first.kept(), true);
  // The space closes while it is made: the screen of the next one shows no backup going on.
  forgetBackupMaking();
  assert.deepEqual(backupMaking(), { making: null, note: null });
  assert.equal(first.kept(), false);
  const then = told;
  // It ends later, unseen: its name, size, folder and counts reach no other space.
  first.making({ step: 'Encrypting…', percent: 90 });
  first.note({ text: 'Saved erevos-backup-2026-11-25-0001.erevos (120 MB) in Backups. It holds 3000 SMS and 12 MMS of the phone\'s.', bad: false });
  first.making(null);
  assert.deepEqual(backupMaking(), { making: null, note: null });
  assert.equal(told, then);

  // What came of one that ended while its space was open goes with the space as well.
  const second = beginBackupMaking();
  second.note({ text: 'Saved…', bad: false });
  assert.equal(backupMaking().note?.text, 'Saved…');
  forgetBackupMaking();
  assert.equal(backupMaking().note, null);

  // In the space open now it is said as before, and the screen saying something else clears its note.
  const third = beginBackupMaking();
  third.making({ step: 'Gathering…', percent: null });
  third.note({ text: 'Not made.', bad: true });
  third.making(null);
  assert.deepEqual(backupMaking(), { making: null, note: { text: 'Not made.', bad: true } });
  clearBackupMadeNote();
  assert.deepEqual(backupMaking(), { making: null, note: null });
  stop();

  // The phone's notice, which names the backup, is for the space that made it as well (app/backup.tsx),
  // and so is the one of a backup sent to the server by hand.
  const screen = readFileSync(join(import.meta.dirname, '..', 'app', 'backup.tsx'), 'utf8');
  assert.ok(screen.includes('if (made.kept()) tellBackupMade(name, spaceText(size + partsSize), folder, parts);'));
  assert.equal(screen.split('tellBackupMade(').length, 2);
  assert.ok(screen.includes('if (made.kept()) tellBackupSent(cloudLabel(sent), total);'));
  assert.equal(screen.split('tellBackupSent(').length, 2);

  // And a space that closes does forget it, with the rest it forgets (app/_layout.tsx).
  const layout = readFileSync(join(import.meta.dirname, '..', 'app', '_layout.tsx'), 'utf8');
  const from = layout.indexOf('function closeSpace(): void {');
  assert.ok(from > 0);
  assert.ok(layout.slice(from, layout.indexOf('\n}\n', from)).includes('  forgetBackupMaking();\n'));
});

// The copy lies outside every space, and only the space that keeps it can take it away
// (lib/phone-open.ts): after a restore the spaces are the backup's, and that space may be gone.
t('no backup holds the copy of speed dial numbers the Phone calls with Erevos locked, and every restore takes it away', async () => {
  const { key } = await phone();
  await setPhoneOpensLocked(true);
  const sims = await PhoneSims.open(0, key);
  await sims.setSpeed('2', '+306911111111', 'Anna');
  await sims.setFeedsLocked(true);
  assert.deepEqual((await lockedSpeedDials())?.keys, [{ key: '2', number: '+306911111111' }]);
  const file = await backUp(await backupKey('backup-pass'));
  const opened = await openBackup(file, 'backup-pass');
  assert.ok(!opened.entries.some((entry) => entry.name === 'erevos.phone-speed'));
  assert.ok(opened.entries.some((entry) => entry.name === 'erevos.phone-open'));

  // On the same phone, where the copy is this very space's: gone, and the space sees it is off.
  await restoreBackup(opened, fromShelf);
  assert.equal(store.has('erevos.phone-speed'), false);
  assert.equal(await phoneOpensLocked(), true);
  assert.equal(await (await PhoneSims.open(0, key)).feedsLocked(), false);
  assert.equal((await PhoneSims.open(0, key)).speed('2')?.number, '+306911111111');

  // On a phone where another space kept one: gone too, so no number of a space that is no longer there is called.
  store.set('erevos.phone-speed', '{"feed":"cd","keys":[{"key":"3","number":"6922222222"}]}');
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.equal(store.has('erevos.phone-speed'), false);
  // One from before the parts, which deletes fewer of the phone's own settings, takes it away as well.
  store.set('erevos.phone-speed', '{"feed":"cd","keys":[{"key":"3","number":"6922222222"}]}');
  const { parts: _parts, ...whole } = await openBackup(file, 'backup-pass');
  await restoreBackup({ ...whole, parts: null }, null);
  assert.equal(store.has('erevos.phone-speed'), false);
});

// What the backup lacks that will not go (cleanup) leaves no phone half restored either.
t('a failure during restore cleanup leaves the previous phone and its restore marker untouched', async () => {
  await phone();
  const backup = await backUp(await backupKey('backup-pass'));
  // After the backup, the phone changes, and has an extra file the backup does not contain.
  store.set('erevos.lock', 'current phone lock');
  files.set('erevos-archive', 'current phone archive');
  const beforeLock = store.get('erevos.lock');
  const beforeFiles = new Map(files);
  const beforeBlobs = new Map(blobs);
  const beforeRestoreMarker = await lastRestore();
  const opened = await openBackup(backup, 'backup-pass');
  assert.ok(!opened.entries.some((entry) => entry.name === 'erevos-archive'));

  const del = files.delete.bind(files);
  files.delete = (name: string) => {
    if (name === 'erevos-archive') throw new Error('injected cleanup failure');
    return del(name);
  };
  try {
    await assert.rejects(restoreBackup(opened, fromShelf), /injected cleanup failure/);
  } finally {
    files.delete = del;
  }

  assert.equal(store.get('erevos.lock'), beforeLock, 'previous lock must be restored');
  assert.deepEqual(new Map(files), beforeFiles, 'previous files must be restored');
  assert.deepEqual(new Map(blobs), beforeBlobs, 'previous blobs must be restored');
  assert.equal(await lastRestore(), beforeRestoreMarker, 'restore marker must be undone');
});

t('puts everything back: the lock opens the same space, with its relay, messages, voice and stickers', async () => {
  const { key, clip, photo, sticker } = await phone();
  // Everything but the wrong tries, which stay with the phone; the panic password's place too.
  assert.ok(store.has('erevos.lock-panic'));
  const before = new Map([...store].filter(([name]) => name !== 'erevos.lock-tries'));
  const file = await backUp(await backupKey('backup-pass'));

  wipe();
  store.set('erevos.space.7', 'left from before');
  files.set('erevos-archive', 'left from before');
  blobs.set('erevos-voice-ffffffffffffffffffffffffffffffff', new Uint8Array([9]));
  blobs.set('erevos-avatar-ffffffffffffffffffffffffffffffff', new Uint8Array([9]));

  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  // Besides, the phone is marked as restored (lock/restored.ts), so each chat moves past the
  // message keys its conversations may have used since the backup.
  const mark = await lastRestore();
  assert.match(mark, /^[0-9a-f]{32}$/);
  assert.deepEqual(new Map([...store].filter(([name]) => !['erevos.restored', 'erevos.restored-at', 'erevos.restored-elsewhere', 'erevos.restored-other', 'erevos.phone-id'].includes(name))), before);
  assert.equal(files.has('erevos-archive'), false);
  assert.equal(blobs.has('erevos-voice-ffffffffffffffffffffffffffffffff'), false);
  assert.equal(blobs.has('erevos-avatar-ffffffffffffffffffffffffffffffff'), false);

  const opened = await unlock(await loadLockConfig(), 'real-1111');
  assert.equal(opened && toHex(opened.key), toHex(key));
  assert.equal((await loadSpaceData(0, key)).url, 'wss://relay.example');
  const history = await History.open('space', 0, key);
  assert.deepEqual(history.messages().map((m) => m.text), ['γεια σου']);
  assert.deepEqual(await loadClip(clip), new Uint8Array([1, 2, 3, 4]));
  assert.deepEqual(await loadPhoto(photo), new Uint8Array([5, 6, 7]));
  assert.deepEqual(await loadOwnStickers({ holder: 'space', space: 0, key }), [sticker]);
  assert.deepEqual(await openOwnSticker(sticker), new Uint8Array([8, 9]));
});

t('holds the accounts on Matrix, XMPP and Nostr, the space\'s and a hidden place\'s, with the pages they take', async () => {
  const { key } = await phone();
  const placeKey = randomBytes(32);
  const nostr = await newNostrDm();
  // Large enough to go to pages, as an account with its chats does.
  nostr.chats.someone = { key: 'someone', messages: Array.from({ length: 300 }, (_, i) => ({ id: `m${i}`, mine: false, at: i, text: 'λόγια '.repeat(20), state: 'sent' })), unread: 0, lastAt: 299 } as unknown as NostrDmState['chats'][string];
  await saveNostrDm(0, key, nostr);
  const placeNostr = await newNostrDm();
  await saveNostrDm(0, placeKey, placeNostr, 'hidden1');
  const xmpp = { jid: 'ben@example.org', password: 'pw', resource: 'Erevos.aa', omemo: { device: 7, identity: {}, signedPreKey: {}, preKeys: [] }, people: {}, chats: {}, roster: {}, requests: [], seen: [], restored: '' } as unknown as XmppState;
  await saveXmpp(0, key, xmpp);
  const matrix = { homeserver: 'https://matrix.example.org', userId: '@dan:example.org', deviceId: 'D', accessToken: 'tok', account: {}, rooms: {}, devices: {}, outdated: [], olm: {}, inbound: {}, outbound: {}, seen: {}, restored: '' } as unknown as MatrixState;
  await saveMatrix(0, placeKey, matrix, 'hidden2');
  // And their messages starred, the space's and the hidden place's (lock/stars-data.ts).
  const starred = { service: 'xmpp' as const, account: 'ben@example.org', chat: 'ann@example.org', id: 'x1', at: 5, mine: false, line: 'καλημέρα' };
  await starMessage({ holder: 'space', space: 0, key }, starred, true);
  await starMessage({ holder: 'hidden2', space: 0, key: placeKey }, { ...starred, service: 'matrix', account: '@dan:example.org', chat: '!r:example.org' }, true);
  assert.ok([...blobs.keys()].some((name) => name.startsWith('erevos-page-')), 'the Nostr chats went to pages');
  const file = await backUp(await backupKey('backup-pass'));

  wipe();
  // What the phone restored on has of its own goes: its accounts and their pages alike.
  await saveXmpp(0, key, { ...xmpp, jid: 'other@example.org' });
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.equal((await loadNostrDm(0, key))?.public, nostr.public);
  assert.equal((await loadNostrDm(0, key))?.chats.someone.messages.length, 300);
  assert.equal((await loadNostrDm(0, placeKey, 'hidden1'))?.public, placeNostr.public);
  assert.equal((await loadXmpp(0, key))?.jid, 'ben@example.org');
  assert.equal((await loadMatrix(0, placeKey, 'hidden2'))?.userId, '@dan:example.org');
  assert.equal(await loadMatrix(0, key), null);
  assert.deepEqual(await loadStars({ holder: 'space', space: 0, key }), [starred]);
  assert.deepEqual((await loadStars({ holder: 'hidden2', space: 0, key: placeKey })).map((s) => s.chat), ['!r:example.org']);
});

t('a backup from before the queues entries leaves none missing: each space and pocket has one again, all one size', async () => {
  await phone();
  // As one made before they were: none in it.
  for (const name of [...store.keys()]) if (name.startsWith('erevos.queues')) store.delete(name);
  const file = await backUp(await backupKey('backup-pass'));
  wipe();
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  const names = [...store.keys()].filter((name) => name.startsWith('erevos.queues'));
  // Four spaces, each with its own and its four hidden places'.
  assert.equal(names.length, 4 * 5);
  assert.equal(new Set(names.map((name) => store.get(name)!.length)).size, 1);
});

// What stays with the phone, in no backup: the wrong tries, the fingerprint's key, the folders
// Android let Erevos write in, what the permissions check saw, what was last said of a release,
// the restore's own marks, the phone's own id, the key of the packets carried for strangers, and the
// relay's entry from before spaces.
const DEVICE_BOUND = [
  'erevos.lock-tries',
  'erevos.chat-tries',
  'erevos.search-tries',
  'erevos.biometric',
  'erevos.save-folder',
  'erevos.permissions-seen',
  'erevos.permissions-maker',
  'erevos.release-notice',
  'erevos.restored',
  'erevos.restored-at',
  'erevos.restored-elsewhere',
  'erevos.restored-other',
  'erevos.phone-id',
  'erevos.lost-phone',
  'erevos.carried-key',
  'erevos.relay',
];

t('shows nothing of what it holds, and leaves out what stays with the phone', async () => {
  await phone();
  for (const name of DEVICE_BOUND) store.set(name, `{"of":"${name}"}`);
  files.set('erevos-carried-others', 'theirs');
  files.set('erevos-inbox', 'the list');
  const file = await backUp(await backupKey('backup-pass'));
  const text = Buffer.from(file).toString('latin1');
  assert.ok(text.startsWith('EREVOS BACKUP 2\n'));
  assert.doesNotMatch(text, /erevos\.|relay\.example|γεια/);
  for (const part of shelf.values()) assert.doesNotMatch(Buffer.from(part).toString('latin1'), /erevos/);

  const { entries } = await openBackup(file, 'backup-pass');
  const names = entries.map((entry) => entry.name);
  for (const name of [...DEVICE_BOUND, 'erevos-carried-others', 'erevos-inbox']) assert.ok(!names.includes(name), name);
  assert.ok(names.includes('erevos.lock') && names.includes('erevos-history'));

  // Restored, the phone's own stay as they were, whatever the backup came from.
  wipe();
  for (const name of DEVICE_BOUND) store.set(name, 'this phone');
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  for (const name of DEVICE_BOUND.filter((name) => !name.startsWith('erevos.restored'))) assert.equal(store.get(name), 'this phone', name);
});

t('a wrong password or another file opens nothing', async () => {
  await phone();
  const file = await backUp(await backupKey('backup-pass'));
  await assert.rejects(openBackup(file, 'wrong'), WrongBackupPasswordError);
  await assert.rejects(openBackup(utf8Encode('hello, this is not a backup at all'), 'backup-pass'), NotABackupError);
  const changed = file.slice();
  changed[changed.length - 1] ^= 1;
  await assert.rejects(openBackup(changed, 'backup-pass'), WrongBackupPasswordError);
});

t('leaves out what is not Erevos’s own, refuses what only a newer Erevos knows, and opens nothing damaged', async () => {
  // In the shape of a backup from before Argon2id, which still opens.
  const { key, salt, iter } = await backupKey('backup-pass', undefined, undefined, null);
  // A file sealed right, holding these entries.
  const entry = (kind: number, name: string, data: string) => {
    const n = utf8Encode(name);
    const d = utf8Encode(data);
    const out = new Uint8Array(3 + n.length + 4 + d.length);
    const view = new DataView(out.buffer);
    out[0] = kind;
    view.setUint16(1, n.length);
    out.set(n, 3);
    view.setUint32(3 + n.length, d.length);
    out.set(d, 7 + n.length);
    return out;
  };
  const forged = (entries: Uint8Array[], sealedWith = key) => {
    const head = new Uint8Array(4);
    new DataView(head.buffer).setUint32(0, iter);
    return new Uint8Array(Buffer.concat([utf8Encode('EREVOS BACKUP 1\n'), salt, head, encryptBytes(sealedWith, new Uint8Array(Buffer.concat(entries)))]));
  };
  const lock = entry(0, 'erevos.lock', '{}');
  const known = await openBackup(forged([lock, entry(0, 'erevos.space.3', 'x')]), 'backup-pass');
  assert.deepEqual([known.entries.map((e) => e.name), known.unknown], [['erevos.lock', 'erevos.space.3'], 0]);
  // The keystore's entries as written from 6.0.0 on, of a kind of their own, open as the others.
  const secret = await openBackup(forged([entry(7, 'erevos.lock', '{}'), entry(7, 'erevos.space.3', 'x')]), 'backup-pass');
  assert.deepEqual([secret.entries.map((e) => [e.kind, e.name]), secret.unknown], [[[0, 'erevos.lock'], [0, 'erevos.space.3']], 0]);
  // A name this Erevos does not restore is left out, and the rest restores; nothing of it is
  // written anywhere.
  for (const [kind, name] of [[0, 'erevos.lock-tries'], [2, '../erevos-history'], [1, 'erevos-voice-aa']] as const) {
    const backup = await openBackup(forged([lock, entry(kind, name, 'x')]), 'backup-pass');
    assert.deepEqual([backup.entries.map((e) => e.name), backup.unknown], [['erevos.lock'], 1], name);
    await restoreBackup(backup);
    assert.equal(store.get('erevos.lock'), '{}');
    assert.ok(!store.has(name) && !files.has(name) && !blobs.has(name), name);
  }
  // Cut short, sealed with another key, holding nothing Erevos knows, or empty: it opens nothing.
  await assert.rejects(openBackup(forged([lock, entry(1, 'erevos-history', 'x').subarray(0, 10)]), 'backup-pass'), NotABackupError);
  await assert.rejects(openBackup(forged([lock], randomBytes(32)), 'backup-pass'), WrongBackupPasswordError);
  await assert.rejects(openBackup(forged([entry(0, 'erevos.lock-tries', 'x')]), 'backup-pass'), NotABackupError);
  // A kind only a newer Erevos knows: the whole backup is refused, and nothing changes.
  store.set('erevos.lock', 'as it was');
  await assert.rejects(openBackup(forged([lock, entry(200, 'erevos-from-later', 'x')]), 'backup-pass'), NewerBackupError);
  await assert.rejects(openBackup(forged([entry(200, 'erevos-from-later', 'x'), lock]), 'backup-pass'), NewerBackupError);
  assert.equal(store.get('erevos.lock'), 'as it was');
  await assert.rejects(openBackup(new Uint8Array(0), 'backup-pass'), NotABackupError);
});

t('a backup costs Argon2id to open, and a key kept from before it gets it without the password', async () => {
  await phone();
  const kept = await backupKey('backup-pass', undefined, undefined, null);
  setHardCost(null);
  const hard = newBackupHard();
  setHardCost({ m: 64, t: 1 });
  assert.deepEqual([hard.m, hard.t, hardCost().m], [HARD.m, HARD.t, 64]);
  // What automatic backups do with the key they kept (lib/backup-folder.ts).
  const file = await backUp({ ...kept, key: await hardBackupKey(kept.key, hard), hard });
  assert.ok((await openBackup(file, 'backup-pass')).entries.some((entry) => entry.name === 'erevos.lock'));
  await assert.rejects(openBackup(file, 'wrong'), WrongBackupPasswordError);
  // Without Argon2id, none is made.
  await assert.rejects(backUp(kept));
  // A cost no Erevos makes is not a backup.
  const costly = file.slice();
  new DataView(costly.buffer).setUint32(16 + 16 + 4 + 16, 1024 * 1024);
  await assert.rejects(openBackup(costly, 'backup-pass'), NotABackupError);
  // Nor one dearer than twice what Erevos makes, though a key elsewhere may cost that: a file
  // from anyone must not keep the phone busy before its password is known.
  for (const [at, value] of [
    [16 + 16 + 4 + 16, MAX_BACKUP_HARD.m * 2],
    [16 + 16 + 4 + 16 + 4, MAX_BACKUP_HARD.t + 1],
    [16 + 16, MAX_BACKUP_ITER + 1],
  ]) {
    const dear = file.slice();
    new DataView(dear.buffer).setUint32(at, value);
    await assert.rejects(openBackup(dear, 'backup-pass'), NotABackupError);
  }
  assert.ok(MAX_BACKUP_HARD.m >= HARD.m * 2 && MAX_BACKUP_HARD.t >= HARD.t * 2 && MAX_BACKUP_ITER >= ITER * 5);
});

t('names backups by the date and time they were made', () => {
  const name = backupName(new Date(2026, 9, 18, 9, 5).getTime());
  assert.equal(name, 'erevos-backup-2026-10-18-0905.erevos');
  return Promise.resolve();
});

t('holds every place of hidden chats, and gives them back', async () => {
  const spaceKey = randomBytes(32);
  await setLockPassword(0, 'real-1111', spaceKey);
  await prepareHidden();
  // Set while its space is open, it receives while closed, and so again once restored.
  setCurrentSpace(0, spaceKey);
  const key = await setHiddenPassword(0, 3, 'hidden-pin', null).finally(() => setCurrentSpace(null));
  await saveHiddenData(0, 3, key, { ...EMPTY_SPACE, token: 'place 4' });
  const file = await backUp(await backupKey('backup-pass'));
  const names = (await openBackup(file, 'backup-pass')).entries.map((entry) => entry.name);
  for (const name of ['erevos.hidden-lock', 'erevos.hidden-lock.3', 'erevos.hidden.0', 'erevos.hidden3.0', 'erevos.keep.0']) assert.ok(names.includes(name), name);
  wipe();
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  const place = await openHidden(0, 'hidden-pin');
  assert.equal(place?.pocket, 3);
  assert.equal((await loadHiddenData(0, 3, place!.key)).token, 'place 4');
  assert.ok(await keepsPlace(0, spaceKey, 3, place!.key));
});

t('holds what lets closed chats be heard: hidden chats\' notice and ring queues, and a space\'s door', async () => {
  // The other pockets get queues made for nothing at the relay.
  if (!relayReady) return;
  const url = await startRelay();
  const { key } = await phone();
  await prepareHidden();
  const queue = (digit: string) => ({ url, token: '', recipientHex: digit.repeat(48) });
  await watchPocket(0, key, 2, queue('a'));
  await ringPocket(0, key, 2, { ...queue('b'), senderHex: 'c'.repeat(48) });
  await saveDoor(0, { tor: 'messages', queues: [queue('d')] });
  const file = await backUp(await backupKey('backup-pass'));
  const heard = async () => [(await loadWatched(0, key))[2]?.recipientHex[0], (await loadRinged(0, key))[2]?.recipientHex[0], (await loadDoor(0))?.queues[0]?.recipientHex[0]];

  // On another phone, as a new one starts: all three as they were.
  wipe();
  await prepareHidden();
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.deepEqual(await heard(), ['a', 'b', 'd']);
  // Every other pocket and space still has its entry, of the same length as before.
  for (const name of ['erevos.watch.1', 'erevos.ring.1', 'erevos.door.1']) assert.ok(store.has(name), name);

  // One from before they were in backups leaves the phone's as they are.
  await watchPocket(0, key, 2, queue('e'));
  const backup = await openBackup(file, 'backup-pass');
  const older = backup.entries.filter((entry) => !/^erevos\.(watch|ring|door)\.|^erevos\.doors-key$/.test(entry.name));
  assert.ok(older.length < backup.entries.length);
  await restoreBackup({ ...backup, entries: older }, fromShelf);
  assert.deepEqual(await heard(), ['e', 'b', 'd']);
});

t('holds the phone\'s SMS when given them, sealed, and restoring writes them nowhere', async () => {
  await phone();
  const sms = utf8Encode('EREVOS SMS 1\n…+306911111111 see you at eight');
  const file = await backUp(await backupKey('backup-pass'), { phoneSms: sms });
  assert.doesNotMatch(Buffer.from(file).toString('latin1'), /EREVOS SMS|6911111111|see you/);
  const opened = await openBackup(file, 'backup-pass');
  assert.deepEqual(backupPhoneSms(opened), sms);
  const before = { files: new Map(files), blobs: new Map(blobs) };
  wipe();
  await restoreBackup(opened, fromShelf);
  assert.deepEqual({ files: new Map(files), blobs: new Map(blobs) }, before);
  // A backup made without them is as it was.
  const without = await openBackup(await backUp(await backupKey('backup-pass')), 'backup-pass');
  assert.equal(backupPhoneSms(without), null);
  assert.deepEqual(
    without.entries.map((entry) => entry.name),
    opened.entries.map((entry) => entry.name).filter((name) => name !== 'phone-sms'),
  );
});

t("holds the phone's calls and blocked numbers when given them, sealed, as an entry an Erevos from before them refuses", async () => {
  await phone();
  const calls = phoneCallsEntry({ calls: [{ number: '+306922222222', presentation: 1, date: 1_800_000_000_000, duration: 75, type: 2, features: 0, new: false, sim: 0 }], blocked: ['+302103333333'] });
  const password = 'backup-pass';
  const file = await backUp(await backupKey(password), { phoneCalls: calls });
  assert.doesNotMatch(Buffer.from(file).toString('latin1'), /6922222222|2103333333|"calls"/);
  const opened = await openBackup(file, password);
  assert.deepEqual(backupPhoneCalls(opened), calls);
  // Restoring writes them nowhere: the backup screen adds them to the phone's (lib/backup-calls.ts).
  const before = { files: new Map(files), blobs: new Map(blobs) };
  await restoreBackup(opened, fromShelf);
  assert.deepEqual({ files: new Map(files), blobs: new Map(blobs) }, before);
  assert.ok(![...store.values()].some((value) => value.includes('6922222222')));
  // A kind of its own, which no Erevos before it knows (they know 0 to 7): such an Erevos says a
  // newer one made the backup, and changes nothing.
  const head = Buffer.from(file.subarray(16, 60));
  const { key } = await backupKey(password, head.subarray(0, 16), head.readUInt32BE(16), { salt: head.subarray(20, 36), m: head.readUInt32BE(36), t: head.readUInt32BE(40) });
  const packed = Buffer.from(decryptBytes(key, file.subarray(60)));
  const kinds: [number, string][] = [];
  for (let at = 0; at < packed.length; ) {
    const length = packed.readUInt16BE(at + 1);
    kinds.push([packed[at], packed.subarray(at + 3, at + 3 + length).toString('utf8')]);
    at += 3 + length;
    at += 4 + packed.readUInt32BE(at);
  }
  assert.deepEqual(kinds.filter(([kind]) => kind > 7), [[8, 'phone-calls']]);
  // A backup made without them is as it was, and opens in an Erevos from before them.
  const without = await openBackup(await backUp(await backupKey(password)), password);
  assert.equal(backupPhoneCalls(without), null);
  assert.deepEqual(
    without.entries.map((entry) => entry.name),
    opened.entries.map((entry) => entry.name).filter((name) => name !== 'phone-calls'),
  );
});

t("holds each space's SMS data in full; an SMS for later whose time came before the restore goes by itself from nowhere, one still ahead goes then", async () => {
  const { key } = await phone();
  const link = await SmsLink.open(0, key);
  assert.equal(await link.pin('+306911111111', true), true);
  await link.setDraft('+306922222222', 'half written');
  await link.setUndo(10);
  await link.setSim('+306944444444', 3);
  const ahead = Date.now() + 3_600_000;
  assert.equal(await link.addLater({ to: '+306933333333', text: 'at eight', at: Date.now() - 60_000, sim: -1 }), true);
  assert.equal(await link.addLater({ to: '+306933333333', text: 'in an hour', at: ahead, sim: 2 }), true);
  const file = await backUp(await backupKey('backup-pass'));

  // Restored on the same phone, the SIMs chosen come back with the rest.
  await link.setSim('+306944444444', 1);
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  const same = await SmsLink.open(0, key);
  assert.equal(same.simFor('+306944444444'), 3);
  assert.deepEqual(
    same.later.map((l) => l.sim),
    [-1, 2],
  );

  // Restored on another phone, all of it comes back, the SMS for later with it, but for the SIMs
  // chosen, which name this phone's no more: they go on its default until one is chosen here.
  wipe();
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  const restored = await SmsLink.open(0, key);
  assert.deepEqual(restored.state.pinned.map((p) => p.address), ['+306911111111']);
  assert.equal(restored.draftFor('+306922222222'), 'half written');
  assert.equal(restored.undo, 10);
  assert.equal(restored.simFor('+306944444444'), -1);
  assert.deepEqual(
    restored.later.map((l) => [l.text, l.sim]),
    [
      ['at eight', -1],
      ['in an hour', -1],
    ],
  );
  await restored.setSim('+306955555555', 4);
  assert.equal((await SmsLink.open(0, key)).simFor('+306955555555'), 4);
  // The one whose time came may have gone from the phone the backup came from: it waits for the
  // owner, and nothing sends it, now or later. The one ahead goes at its time.
  const at = await restoredAt();
  assert.ok(at > 0 && at <= Date.now());
  assert.deepEqual(
    restored.later.map((l) => waitsForOwner(l, at)),
    [true, false],
  );
  const sent: string[] = [];
  const send = async (_to: string, text: string) => sent.push(text);
  assert.deepEqual(await sendDue(restored, send, Date.now(), null, at), { went: [], next: ahead });
  const went = await sendDue(restored, send, ahead + 1, null, at);
  assert.deepEqual(
    went.went.map((l) => l.text),
    ['in an hour'],
  );
  assert.deepEqual(sent, ['in an hour']);
  assert.deepEqual(
    restored.later.map((l) => l.text),
    ['at eight'],
  );
  assert.deepEqual(await sendDue(restored, send, ahead + 10 * 86_400_000, null, at), { went: [], next: 0 });
  assert.deepEqual(sent, ['in an hour']);
  // Without a restore, as before, it goes once its time came.
  assert.deepEqual((await sendDue(restored, send, ahead + 2)).went.map((l) => l.text), ['at eight']);

  // A backup without the order, as an Erevos before made them, restores as ever, and the order
  // starts empty.
  files.delete('erevos-sms-order');
  const older = await backUp(await backupKey('backup-pass'));
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  await restoreBackup(await openBackup(older, 'backup-pass'), fromShelf);
  assert.equal(files.has('erevos-sms-order'), false);
  assert.deepEqual((await SmsLink.open(0, key)).state.pinned, []);
  assert.equal((await loadSpaceData(0, key)).url, 'wss://relay.example');
});

t('a bare backup, as sent to a server, looks like random bytes of a Padmé size, and opens as the others do', async () => {
  await phone();
  const key = await backupKey('backup-pass');
  const plain = await backUp(key);
  const bare = await backUp(key, { bare: true });
  assert.equal(bare.length, padme(bare.length));
  assert.ok(bare.length >= plain.length - 16);
  // Nothing in it says Erevos, nor the rounds and cost the plain one shows after its salt.
  assert.ok(!new TextDecoder().decode(bare).includes('EREVOS'));
  assert.notDeepEqual(bare.subarray(16, 44), plain.subarray(32, 60));
  const opened = await openBackup(bare, 'backup-pass');
  // The padding is nothing to restore, and no sign of a newer Erevos.
  assert.equal(opened.unknown, 0);
  assert.ok(!opened.entries.some((entry) => entry.name === 'pad'));
  assert.deepEqual(
    opened.entries.map((e) => e.name),
    (await openBackup(plain, 'backup-pass')).entries.map((e) => e.name),
  );
  await assert.rejects(openBackup(bare, 'not-the-pass'), WrongBackupPasswordError);
  await assert.rejects(openBackup(randomBytes(bare.length), 'backup-pass'), NotABackupError);
});

test('Padmé sizes add at most 12%, and grow with what they hold, and none is a whole number of bare parts', () => {
  for (const n of [1, 2, 100, 1000, 4097, 123_456, BARE_PART - 1, BARE_PART, BARE_PART + 1, 9_999_999, 3 * BARE_PART, 150_000_000, 1_000 * BARE_PART]) {
    const padded = padme(n);
    assert.ok(padded >= n && padded <= n * 1.12 + 1, `${n} → ${padded}`);
    assert.equal(padme(padded), padded);
    assert.notEqual(padded % BARE_PART, 0, `${n} → ${padded}`);
  }
});

// A WebDAV folder at https://cloud.example/dav/Backups/, for user `me` with the password `password()`.
function davServer(there: Map<string, Uint8Array>, password: () => string, asked: string[] = []) {
  return (method: string, url: string, headers: Record<string, string>, body?: Uint8Array): { status: number; bytes: Uint8Array } => {
    const said = (status: number, bytes: Uint8Array = new Uint8Array(0)) => ({ status, bytes });
    asked.push(`${method} ${url}`);
    if (headers.Authorization !== `Basic ${Buffer.from(`me:${password()}`).toString('base64')}`) return said(401);
    if (!url.startsWith('https://cloud.example/dav/Backups/')) return said(404);
    const name = url.slice('https://cloud.example/dav/Backups/'.length);
    if (method === 'PROPFIND' && headers.Depth === '1') {
      // As Nextcloud answers: the folder itself, a file of the owner's, and the backups, in the order they came.
      const entry = (href: string, size: number, at: number) =>
        `<d:response><d:href>${href}</d:href><d:propstat><d:prop><d:getlastmodified>${new Date(Date.UTC(2026, 9, 1, 12, at)).toUTCString()}</d:getlastmodified><d:getcontentlength>${size}</d:getcontentlength></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>`;
      const xml = [
        '<?xml version="1.0"?><d:multistatus xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">',
        entry('/dav/Backups/', 0, 0),
        entry('/dav/Backups/notes.txt', 12, 1),
        ...[...there].map(([name, bytes], i) => entry(`/dav/Backups/${name}`, bytes.length, 2 + i)),
        '</d:multistatus>',
      ].join('');
      return said(207, new TextEncoder().encode(xml));
    }
    if (method === 'PROPFIND') return said(207);
    if (method === 'PUT') return there.set(name, body!), said(201);
    if (method === 'DELETE') return said(there.delete(name) ? 204 : 404);
    if (method === 'GET') return there.has(name) ? said(200, there.get(name)) : said(404);
    return said(405);
  };
}

t('sends automatic backups to a WebDAV folder under random names, keeps the newest there, and sends none while a space sends Everything through Tor and has no Tor for it', async () => {
  const asked: string[] = [];
  const there = new Map<string, Uint8Array>();
  let password = 'app-pass';
  const server = davServer(there, () => password, asked);
  setCloudHttp(async (method, url, headers, body) => server(method, url, headers, body));
  try {
    assert.equal(cloudFolder(' https://cloud.example/dav/Backups '), 'https://cloud.example/dav/Backups/');
    assert.throws(() => cloudFolder('http://cloud.example/dav'), CloudError);
    assert.throws(() => cloudFolder('https://me:pw@cloud.example/dav'), CloudError);
    await assert.rejects(startCloudBackup('https://cloud.example/dav/Backups', 'me', 'wrong'), /did not take/);
    await assert.rejects(startCloudBackup('https://cloud.example/dav/Elsewhere', 'me', 'app-pass'), /not on the server/);
    let cloud = await startCloudBackup('https://cloud.example/dav/Backups', 'me', 'app-pass');
    assert.equal(cloud.names.length, 0);

    await phone();
    const key = await backupKey('backup-pass');
    for (let i = 1; i <= 4; i++) cloud = await sendToCloud(cloud, toServer(key), 3, i);
    assert.equal(cloud.error, '');
    assert.equal(cloud.last, 4);
    // Each with its one part, the voice message's, under a name of its own, of the same length.
    assert.equal(there.size, 6);
    assert.ok(cloud.names.every((name) => there.has(name)));
    assert.deepEqual(
      cloud.names.map((name) => cloud.parts[name].count),
      [1, 1, 1],
    );
    for (const name of there.keys()) assert.match(name, /^[0-9a-f]{24}$/);
    assert.deepEqual(await loadCloudBackup(), cloud);
    const newest = there.get(cloud.names[2])!;
    assert.equal((await openBackup(newest, 'backup-pass')).unknown, 0);

    // Restored from the server itself, with the folder and password typed again: only Erevos's
    // names, newest first, and the one chosen comes back whole.
    const server = cloudServer('https://cloud.example/dav/Backups', ' me ', 'app-pass');
    const listed = await listCloud(server);
    assert.deepEqual(
      listed.map((file) => file.name),
      [...cloud.names].reverse(),
    );
    assert.equal(listed[0].size, newest.length);
    assert.ok(listed[0].when > listed[1].when);
    const fetched = await fetchFromCloud(server, listed[0].name, 200 * 1024 * 1024);
    assert.deepEqual(fetched, newest);
    await assert.rejects(fetchFromCloud(server, listed[0].name, 10), /does not come from a server/);
    await assert.rejects(fetchFromCloud(server, '../elsewhere', 1e9), /not an Erevos backup/);
    await assert.rejects(listCloud({ ...server, password: 'wrong' }), /did not take/);

    // The server's own words for what went wrong, kept to show, and tried again next time.
    password = 'taken-back';
    const failed = await sendToCloud(cloud, toServer(key), 3, 5);
    assert.match(failed.error, /did not take/);
    assert.equal(failed.last, 4);

    // A space that sends Everything through Tor sends nothing straight to a server, in a build without Tor.
    password = 'app-pass';
    asked.length = 0;
    setThroughTor('all');
    const held = await sendToCloud(cloud, toServer(key), 3, 6);
    assert.match(held.error, /through Tor/);
    assert.deepEqual(asked, []);
  } finally {
    setThroughTor('off');
    setCloudHttp(null);
    await stopCloudBackup();
  }
  assert.equal(await loadCloudBackup(), null);
});

t('a part the server misses for a moment, busy (503), slow (408), locked (423) or out of reach, goes again, and only one it keeps missing ends the backup', async () => {
  const there = new Map<string, Uint8Array>();
  const server = davServer(there, () => 'app-pass');
  // The PUTs the server misses next, each as it says: a status, or no answer at all.
  let misses: (number | 'unreached')[] = [];
  const asked: string[] = [];
  setCloudHttp(async (method, url, headers, body) => {
    asked.push(method);
    if (method === 'PUT' && misses.length) {
      const miss = misses.shift()!;
      if (miss === 'unreached') throw new Error('timeout');
      return { status: miss, bytes: new Uint8Array(0) };
    }
    return server(method, url, headers, body);
  });
  setCloudRetry([1, 1, 1, 1]);
  try {
    let cloud = await startCloudBackup('https://cloud.example/dav/Backups', 'me', 'app-pass');
    await phone();
    const key = await backupKey('backup-pass');
    misses = [503, 'unreached', 408, 423];
    cloud = await sendToCloud(cloud, toServer(key), 3, 1);
    assert.equal(cloud.error, '');
    assert.equal(cloud.last, 1);
    assert.equal(asked.filter((method) => method === 'PUT').length, 2 + 4);
    assert.equal(there.size, 2);
    assert.deepEqual(cloud.unfinished, []);

    // One the server keeps missing ends it, after the tries, and what went of it is deleted.
    misses = [503, 503, 503, 503, 503];
    const failed = await sendToCloud(cloud, toServer(key), 3, 2);
    assert.match(failed.error, /503/);
    assert.equal(failed.last, 1);
    assert.equal(there.size, 2);

    // A clear no is not asked again.
    asked.length = 0;
    misses = [401];
    assert.match((await sendToCloud(cloud, toServer(key), 3, 3)).error, /did not take/);
    assert.equal(asked.filter((method) => method === 'PUT').length, 1);
  } finally {
    setCloudRetry([2_000, 10_000, 30_000, 60_000, 120_000, 300_000]);
    setCloudHttp(null);
    await stopCloudBackup();
  }
});

test('reads the backups out of WebDAV listings, whatever the prefix of their namespace', () => {
  const xml = `<?xml version="1.0"?>
    <D:multistatus xmlns:D="DAV:">
      <D:response><D:href>https://host/dav/B/</D:href></D:response>
      <D:response>
        <D:href>/dav/B/0123456789abcdef</D:href>
        <D:propstat><D:prop><D:getcontentlength>4096</D:getcontentlength><D:getlastmodified>Wed, 28 Oct 2026 10:00:00 GMT</D:getlastmodified></D:prop></D:propstat>
      </D:response>
      <D:response><D:href>/dav/B/fedcba9876543210</D:href><D:propstat><D:prop><D:getlastmodified>Thu, 29 Oct 2026 10:00:00 GMT</D:getlastmodified></D:prop></D:propstat></D:response>
      <D:response><D:href>/dav/B/0123456789ABCDEF</D:href></D:response>
      <D:response><D:href>/dav/B/%zz</D:href></D:response>
      <D:response><D:href>/dav/B/${'a'.repeat(24)}</D:href><D:propstat><D:prop><D:getcontentlength>${padme(5_000_000)}</D:getcontentlength><D:getlastmodified>Fri, 30 Oct 2026 10:00:00 GMT</D:getlastmodified></D:prop></D:propstat></D:response>
      <D:response><D:href>/dav/B/${'b'.repeat(24)}</D:href><D:propstat><D:prop><D:getcontentlength>${BARE_PART}</D:getcontentlength></D:prop></D:propstat></D:response>
      <D:response><D:href>/dav/B/${'c'.repeat(24)}</D:href><D:propstat><D:prop><D:getcontentlength>${3 * BARE_PART}</D:getcontentlength></D:prop></D:propstat></D:response>
    </D:multistatus>`;
  // A backup's parts, of names as long as its own, are left out by their size.
  assert.deepEqual(backupsListed(xml), [
    { name: 'a'.repeat(24), size: padme(5_000_000), when: Date.UTC(2026, 9, 30, 10) },
    { name: 'fedcba9876543210', size: 0, when: Date.UTC(2026, 9, 29, 10) },
    { name: '0123456789abcdef', size: 4096, when: Date.UTC(2026, 9, 28, 10) },
  ]);
  assert.deepEqual(backupsListed('<response><href>/x/0123456789abcdef</href></response>'), [{ name: '0123456789abcdef', size: 0, when: 0 }]);
});

t("sends backups to a server through Tor as the space's Tor way says, waiting for Tor a while", async () => {
  const there = new Map<string, Uint8Array>();
  const server = davServer(there, () => 'app-pass');
  const heads: { method: string; url: string; headers: Record<string, string> }[] = [];
  setCore({
    torRequest: async () => new Uint8Array(0),
    torHttp: async (head: string, body: Uint8Array) => {
      const asked = JSON.parse(head) as { method: string; url: string; headers: Record<string, string> };
      heads.push(asked);
      const { status, bytes } = server(asked.method, asked.url, asked.headers, body);
      return new Uint8Array([status >> 8, status & 0xff, ...bytes]);
    },
  } as unknown as Core);
  const straight: string[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string) => {
    straight.push(String(url));
    return new Response(null, { status: 201 });
  }) as typeof fetch;
  setCloudTorWait(50);
  try {
    // Everything: through Tor, even while it is not ready yet (after the wait).
    setThroughTor('all');
    assert.ok(cloudThroughTor());
    let cloud = await startCloudBackup('https://cloud.example/dav/Backups', 'me', 'app-pass');
    await phone();
    const key = await backupKey('backup-pass');
    cloud = await sendToCloud(cloud, toServer(key), 3, 1);
    assert.equal(cloud.error, '');
    // The voice message's part, then the backup.
    assert.equal(there.size, 2);
    assert.deepEqual(
      heads.map((head) => head.method),
      ['PROPFIND', 'PUT', 'PUT'],
    );
    assert.deepEqual(straight, []);

    // Messages: straight while Tor is not ready, through Tor once it is, and a backup waits for it.
    setThroughTor('messages');
    assert.equal(cloudThroughTor(), false);
    cloud = await sendToCloud(cloud, toServer(key), 3, 2);
    assert.equal(straight.length, 2);
    setCloudTorWait(5_000);
    setTimeout(() => setTorReady(true), 20);
    cloud = await sendToCloud(cloud, toServer(key), 3, 3);
    assert.equal(cloud.error, '');
    assert.equal(straight.length, 2);
    assert.equal(heads.at(-1)?.method, 'PUT');
    assert.ok(cloudThroughTor());

    // Nothing: straight.
    setThroughTor('off');
    assert.equal(cloudThroughTor(), false);
    await sendToCloud(cloud, toServer(key), 9, 4);
    assert.equal(straight.length, 4);
  } finally {
    globalThis.fetch = realFetch;
    setTorReady(false);
    setThroughTor('off');
    setCloudTorWait(120_000);
    setCore(wasmCore);
    await stopCloudBackup();
  }
});

test('in a browser, a server that does not let the web app in says so', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new TypeError('Failed to fetch');
  }) as typeof fetch;
  try {
    await assert.rejects(browserRequest('PROPFIND', 'https://cloud.example/dav/Backups/', { Depth: '0' }), /CORS/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("the desktop app's shell sends only WebDAV's requests for backups, over https, with no cookies and no redirects", () => {
  const shell = readFileSync(join(import.meta.dirname, '../../desktop/main.js'), 'utf8');
  const webdav = shell.slice(shell.indexOf('async function webdav('), shell.indexOf('// Whether Erevos keeps running'));
  assert.match(shell, /const WEBDAV_METHODS = new Set\(\['PROPFIND', 'PUT', 'GET', 'DELETE', 'MKCOL'\]\);/);
  assert.match(shell, /const WEBDAV_HEADERS = \['authorization', 'depth', 'content-type'\];/);
  assert.match(webdav, /target\.protocol !== 'https:'/);
  assert.match(webdav, /credentials: 'omit', redirect: 'error'/);
  assert.doesNotMatch(webdav, /console\./);
  // The server's answer is read as it comes, 100 MB at most, as the app's downloads (lib/net-http.ts).
  assert.match(shell, /const WEBDAV_MOST = 100 \* 1024 \* 1024;/);
  assert.match(webdav, /readCapped\(answer, WEBDAV_MOST/);
  assert.match(webdav, /status: 413/);
  assert.doesNotMatch(webdav, /arrayBuffer\(\)\);\n\s*if \(said/);
  assert.match(shell, /url\.pathname === '\/__webdav'\) return webdav\(request, url\)/);
});

// What a phone with photos and files keeps of them: chunks of 1 MB, each a file of its own (lock/attachment-files.ts).
function photos(count: number): Map<string, Uint8Array> {
  const chunks = new Map<string, Uint8Array>();
  for (let i = 0; i < count; i++) chunks.set(`erevos-file-${toHex(randomBytes(16))}-${i}`, randomBytes(1024 * 1024));
  for (const [name, bytes] of chunks) blobs.set(name, bytes);
  return chunks;
}

// The phone as it is: its keystore, its files and its bytes.
const snapshot = () => ({ store: new Map(store), files: new Map(files), blobs: new Map(blobs) });

// What a part adds to what it holds at most: the backup's id and its number, an entry's kind,
// name and length for each, and the seal.
const PART_MOST = PART + 20 + 3 * (3 + 64 + 4) + 28 + 16;

t('the chunks of an open Collection kept out of backups stay out, and the others go in', async () => {
  await phone();
  const chunks = photos(3);
  const [out, ...kept] = [...chunks.keys()];
  const opened = await openBackup(await backUp(await backupKey('backup-pass'), { skip: new Set([out]) }), 'backup-pass');
  wipe();
  await restoreBackup(opened, fromShelf);
  assert.equal(blobs.get(out), undefined);
  for (const name of kept) assert.deepEqual(blobs.get(name), chunks.get(name));
});

t('photos, files and voice messages go in parts beside the backup, a few MB each, read one at a time, and come back with it', async () => {
  const { clip } = await phone();
  const without = await backUp(await backupKey('backup-pass'));
  shelf.clear();
  const chunks = photos(9);
  const sizes: number[] = [];
  const file = await makeBackup(await backupKey('backup-pass'), {
    parts: async (bytes) => {
      sizes.push(bytes.length);
      return toShelf(bytes);
    },
  });
  // The backup itself holds none of them: it is as large as without them, but for the names of its
  // parts, and its parts hold no more than PART each.
  assert.ok(Math.abs(file.length - without.length) < 1024, `${file.length} ${without.length}`);
  assert.equal(sizes.length, 3);
  for (const size of sizes) assert.ok(size <= PART_MOST, `${size}`);
  for (const part of shelf.values()) for (const bytes of chunks.values()) assert.equal(Buffer.from(part).indexOf(Buffer.from(bytes.subarray(0, 64))), -1);
  const opened = await openBackup(file, 'backup-pass');
  assert.deepEqual(opened.parts?.names, [...shelf.keys()]);
  assert.match(toHex(opened.parts!.id), /^[0-9a-f]{32}$/);
  assert.ok(!opened.entries.some((entry) => entry.name.startsWith('erevos-file-') || entry.name.startsWith('erevos-voice-')));

  // On another phone, with photos of its own: those of the backup come back, its own go.
  wipe();
  blobs.set(`erevos-file-${'f'.repeat(32)}-0`, new Uint8Array([7]));
  const read: string[] = [];
  const told: number[] = [];
  await restoreBackup(
    opened,
    async (name) => {
      read.push(name);
      return fromShelf(name);
    },
    (done, all) => told.push(done / all),
  );
  assert.deepEqual(read, opened.parts!.names);
  assert.deepEqual(told, [1 / 3, 2 / 3, 1]);
  for (const [name, bytes] of chunks) assert.deepEqual(blobs.get(name), bytes, name);
  assert.equal(blobs.has(`erevos-file-${'f'.repeat(32)}-0`), false);
  assert.deepEqual(await loadClip(clip), new Uint8Array([1, 2, 3, 4]));
});

t('a part missing, damaged, cut short, in another part\'s place or of another backup opens nothing, and the phone stays as it was', async () => {
  await phone();
  photos(9);
  const key = await backupKey('backup-pass');
  const file = await backUp(key);
  const first = [...shelf.keys()];
  // Another backup, with the same key, as automatic backups are: its parts open with it, not with the first.
  await backUp(key);
  const other = [...shelf.keys()].filter((name) => !first.includes(name));
  const opened = await openBackup(file, 'backup-pass');
  const names = opened.parts!.names;
  assert.equal(names.length, 3);

  // Another phone, with what it has.
  wipe();
  await phone();
  const before = snapshot();
  const tries: [string, PartReader, typeof MissingPartError | typeof DamagedPartError, string][] = [
    ['missing', async (name) => (name === names[1] ? null : fromShelf(name)), MissingPartError, names[1]],
    ['changed', async (name) => (name === names[2] ? flipped(shelf.get(name)!) : fromShelf(name)), DamagedPartError, names[2]],
    ['cut short', async (name) => (name === names[1] ? shelf.get(name)!.subarray(0, 1000) : fromShelf(name)), DamagedPartError, names[1]],
    ['in another\'s place', async (name) => (name === names[0] ? shelf.get(names[1])! : fromShelf(name)), DamagedPartError, names[0]],
    ['in another order', async (name) => shelf.get(names[(names.indexOf(name) + 1) % 3])!, DamagedPartError, names[0]],
    ['of another backup', async (name) => (name === names[2] ? shelf.get(other[2])! : fromShelf(name)), DamagedPartError, names[2]],
    ['not a part', async (name) => (name === names[0] ? file : fromShelf(name)), DamagedPartError, names[0]],
  ];
  for (const [what, read, kind, part] of tries) {
    await assert.rejects(restoreBackup(opened, read), (error) => error instanceof kind && error.part === part, what);
    assert.deepEqual(snapshot(), before, what);
  }
  // With no way to read them, as a file picked alone.
  await assert.rejects(restoreBackup(opened), MissingPartError);
  assert.deepEqual(snapshot(), before);
  // A backup is not a part, nor a part a backup.
  await assert.rejects(openBackup(shelf.get(names[0])!, 'backup-pass'), NotABackupError);
});

t('with a part missing or damaged, the owner may restore all the rest without such parts, and the phone keeps its own photos, files and voice messages', async () => {
  const { key } = await phone();
  // In the order the parts hold them, by their names.
  const chunks = [...photos(9)].sort(([a], [b]) => (a < b ? -1 : 1));
  const file = await backUp(await backupKey('backup-pass'));
  const opened = await openBackup(file, 'backup-pass');
  const names = opened.parts!.names;
  assert.equal(names.length, 3);
  // The chunks each part holds, in order: three of 1 MB each.
  const inPart = (n: number) => chunks.slice(3 * n, 3 * n + 3);

  // Another phone, with a photo and a voice message of its own.
  wipe();
  await phone();
  const ownPhoto = `erevos-file-${'f'.repeat(32)}-0`;
  const ownVoice = `erevos-voice-${'e'.repeat(32)}`;
  blobs.set(ownPhoto, new Uint8Array([7]));
  blobs.set(ownVoice, new Uint8Array([8]));
  const read: PartReader = async (name) => (name === names[1] ? null : name === names[2] ? flipped(shelf.get(name)!) : fromShelf(name));

  // Not wanted: nothing changes, and the restore's mark goes again.
  const before = snapshot();
  const asked: string[] = [];
  await assert.rejects(
    restoreBackup(opened, read, undefined, {
      without: async (error) => {
        asked.push(error.part);
        return false;
      },
    }),
    MissingPartError,
  );
  assert.deepEqual(asked, [names[1]]);
  assert.deepEqual(snapshot(), before);
  assert.equal(await restoredAt(), 0);

  // Wanted: asked once, at the first, and the rest put in place. The mark is there before anything
  // the backup holds is written, so no SMS for later it brings goes by itself meanwhile.
  const marks: number[] = [];
  const { left } = await restoreBackup(opened, read, undefined, {
    without: async (error) => {
      assert.ok(error instanceof MissingPartError);
      marks.push(await restoredAt());
      assert.notEqual(files.get('erevos-history'), utf8Decode(opened.entries.find((entry) => entry.name === 'erevos-history')!.data));
      return true;
    },
  });
  assert.deepEqual(left, [names[1], names[2]]);
  assert.equal(marks.length, 1);
  assert.ok(marks[0] > 0);
  for (const [name, bytes] of inPart(0)) assert.ok(Buffer.from(blobs.get(name) ?? []).equals(bytes), name);
  for (const [name] of [...inPart(1), ...inPart(2)]) assert.equal(blobs.has(name), false, name);
  assert.deepEqual(blobs.get(ownPhoto), new Uint8Array([7]));
  assert.deepEqual(blobs.get(ownVoice), new Uint8Array([8]));
  // The rest is the backup's: its space opens with its password, as it was.
  const unlocked = await unlock(await loadLockConfig(), 'real-1111');
  assert.equal(unlocked && toHex(unlocked.key), toHex(key));
  assert.equal((await loadSpaceData(0, key)).url, 'wss://relay.example');
});

function flipped(bytes: Uint8Array): Uint8Array {
  const changed = bytes.slice();
  changed[changed.length >> 1] ^= 1;
  return changed;
}

// A backup made as an Erevos from before parts made them: with Argon2id, its voice messages in it,
// and none of what came with parts. Sealed as makeBackup seals.
async function backupFromBefore(password: string, entries: { kind: number; name: string; data: Uint8Array }[]): Promise<Uint8Array> {
  const { key, salt, iter, hard } = await backupKey(password);
  const packed = Buffer.concat(
    entries.map(({ kind, name, data }) => {
      const n = utf8Encode(name);
      const head = Buffer.alloc(3 + n.length + 4);
      head[0] = kind;
      head.writeUInt16BE(n.length, 1);
      head.set(n, 3);
      head.writeUInt32BE(data.length, 3 + n.length);
      return Buffer.concat([head, data]);
    }),
  );
  const head = Buffer.alloc(16 + 4 + 16 + 8);
  head.set(salt, 0);
  head.writeUInt32BE(iter, 16);
  head.set(hard!.salt, 20);
  head.writeUInt32BE(hard!.m, 36);
  head.writeUInt32BE(hard!.t, 40);
  return new Uint8Array(Buffer.concat([utf8Encode('EREVOS BACKUP 2\n'), head, encryptBytes(key, new Uint8Array(packed))]));
}

t('a backup from before parts opens and restores as before: the phone keeps its photos and files, and all that backups hold only since', async () => {
  await phone();
  const lock = store.get('erevos.lock')!;
  const voice = `erevos-voice-${'a'.repeat(32)}`;
  const file = await backupFromBefore('backup-pass', [
    { kind: 0, name: 'erevos.lock', data: utf8Encode(lock) },
    { kind: 1, name: 'erevos-history', data: utf8Encode('the history then') },
    { kind: 2, name: voice, data: new Uint8Array([4, 5]) },
  ]);
  const opened = await openBackup(file, 'backup-pass');
  assert.equal(opened.parts, null);
  assert.equal(opened.unknown, 0);

  wipe();
  const chunks = photos(2);
  store.set('erevos.lock-panic', 'the panic here');
  store.set('erevos.lang', 'de');
  store.set('erevos.backup-auto', '{"folder":"here"}');
  files.set('erevos-sms', 'sms here');
  files.set('erevos-fanout', 'copies here');
  blobs.set(`erevos-voice-${'b'.repeat(32)}`, new Uint8Array([9]));
  await restoreBackup(opened);
  assert.equal(files.get('erevos-history'), 'the history then');
  assert.deepEqual(blobs.get(voice), new Uint8Array([4, 5]));
  // Its voice messages were all in it, as ever: one it does not hold goes.
  assert.equal(blobs.has(`erevos-voice-${'b'.repeat(32)}`), false);
  for (const [name, bytes] of chunks) assert.deepEqual(blobs.get(name), bytes);
  assert.equal(store.get('erevos.lock-panic'), 'the panic here');
  assert.equal(store.get('erevos.lang'), 'de');
  assert.equal(store.get('erevos.backup-auto'), '{"folder":"here"}');
  assert.equal(files.get('erevos-sms'), 'sms here');
  assert.equal(files.get('erevos-fanout'), 'copies here');
});

t('an Erevos from before 6.0.0 opens a new backup but finds none of the lock in it, so refuses it as no backup', async () => {
  await phone();
  photos(2);
  const password = 'backup-pass';
  const file = await backUp(await backupKey(password), { native: utf8Encode('{"v":1}') });
  // As any Erevos from Argon2id on reads it: its head, then what is sealed.
  assert.equal(Buffer.from(file.subarray(0, 16)).toString('latin1'), 'EREVOS BACKUP 2\n');
  const head = Buffer.from(file.subarray(16, 60));
  const { key } = await backupKey(password, head.subarray(0, 16), head.readUInt32BE(16), { salt: head.subarray(20, 36), m: head.readUInt32BE(36), t: head.readUInt32BE(40) });
  const packed = Buffer.from(decryptBytes(key, file.subarray(60)));
  const kinds = new Map<number, string[]>();
  for (let at = 0; at < packed.length; ) {
    const kind = packed[at];
    const length = packed.readUInt16BE(at + 1);
    const name = packed.subarray(at + 3, at + 3 + length).toString('utf8');
    at += 3 + length;
    at += 4 + packed.readUInt32BE(at);
    kinds.set(kind, [...(kinds.get(kind) ?? []), name]);
  }
  // Text and bytes, as ever, and kinds it never knew, which it leaves out: the keystore's entries
  // among them, so it finds no lock (erevos.lock, erevos.space-keys), and says it is no backup,
  // rather than restore it without its photos, files and voice messages.
  assert.deepEqual([...kinds.keys()].sort(), [1, 2, 5, 6, 7]);
  assert.ok(kinds.get(7)!.includes('erevos.lock'));
  assert.deepEqual(kinds.get(5), ['parts']);
  assert.deepEqual(kinds.get(6), ['phone']);
  assert.ok(!kinds.get(2)!.some((name) => name.startsWith('erevos-file-') || name.startsWith('erevos-voice-')));
});

t("holds the panic password, the phone's settings, and automatic backups' and the server's, without their folder", async () => {
  await phone();
  const settings: Record<string, string> = {
    'erevos.lang': 'el',
    'erevos.modules': '["erevos","sms"]',
    'erevos.haptics': 'no',
    'erevos.icon-number': 'no',
    'erevos.ring-background': '1',
    'erevos.message-notices': '0',
    'erevos.boot-start': 'off',
    'erevos.boot-choice': 'off',
    'erevos.battery': 'sleep',
    'erevos.screen-private': 'off',
    'erevos.photo-quality': 'small',
    'erevos.carry': '1',
    'erevos.lan': '1',
    'erevos.direct': '0',
    'erevos.aware': '1',
    'erevos.lora': '{"address":"AA:BB","name":"Mesh"}',
    'erevos.phone-open': 'yes',
    'erevos.camera-open': 'no',
    'erevos.backup-sms': '1',
    'erevos.backup-calls': '1',
  };
  for (const [name, value] of Object.entries(settings)) store.set(name, value);
  const panic = store.get('erevos.lock-panic')!;
  const auto = { every: 7, folder: 'content://com.android.externalstorage.documents/tree/primary%3ABackups', key: 'a2V5', salt: 'c2FsdA==', iter: 200000, hard: null, last: 5, error: 'Nicht gemacht.' };
  store.set('erevos.backup-auto', JSON.stringify(auto));
  const cloud = { url: 'https://cloud.example/dav/Backups/', user: 'me', password: 'pw', names: ['0123456789abcdef'], parts: { '0123456789abcdef': { seed: 'ab'.repeat(16), count: 2 } }, unfinished: [], last: 7, error: 'Nicht gesendet.' };
  store.set('erevos.backup-cloud', JSON.stringify(cloud));
  const file = await backUp(await backupKey('backup-pass'));

  // The backup holds none of this phone's folder, nor errors in its words.
  const entries = new Map((await openBackup(file, 'backup-pass')).entries.filter((entry) => entry.name.startsWith('erevos.')).map((entry) => [entry.name, utf8Decode(entry.data)]));
  assert.deepEqual(JSON.parse(entries.get('erevos.backup-auto')!), { ...auto, folder: '', error: '' });
  assert.deepEqual(JSON.parse(entries.get('erevos.backup-cloud')!), { ...cloud, error: '' });

  // On another phone: all of it, and automatic backups wait for a folder there.
  wipe();
  store.set('erevos.lock-panic', 'another');
  store.set('erevos.zoom', 'stays');
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.equal(store.get('erevos.lock-panic'), panic);
  for (const [name, value] of Object.entries(settings)) assert.equal(store.get(name), value, name);
  assert.deepEqual(JSON.parse(store.get('erevos.backup-auto')!), { ...auto, folder: '', error: '' });
  assert.deepEqual(JSON.parse(store.get('erevos.backup-cloud')!), { ...cloud, error: '' });

  // On a phone with automatic backups of its own: they go on into its folder, and the server's
  // list of what this phone sent there stays, with the name and password the backup held.
  const mine = { ...auto, folder: 'content://here', last: 9, key: 'bWluZQ==' };
  const sent = { ...cloud, password: 'old', names: ['fedcba9876543210'], parts: {}, unfinished: [{ seed: 'cd'.repeat(16), count: 16 }], last: 11 };
  store.set('erevos.backup-auto', JSON.stringify(mine));
  store.set('erevos.backup-cloud', JSON.stringify(sent));
  // And settings the backup does not hold go: all but whether the camera opens with Erevos locked,
  // which a backup from before it could not say, and which stays as this phone has it. Whom the
  // locked camera takes for is in no backup, and goes with every restore.
  store.delete('erevos.haptics');
  store.delete('erevos.camera-open');
  store.set('erevos.camera-drop', 'ab'.repeat(32));
  const without = await backUp(await backupKey('backup-pass'));
  assert.ok(!(await openBackup(without, 'backup-pass')).entries.some((entry) => entry.name === 'erevos.camera-drop' || entry.name === 'erevos.camera-open'));
  store.set('erevos.haptics', 'yes');
  store.set('erevos.camera-open', 'no');
  store.set('erevos.backup-auto', JSON.stringify({ ...mine, folder: 'content://elsewhere', last: 12 }));
  await restoreBackup(await openBackup(without, 'backup-pass'), fromShelf);
  assert.equal(store.has('erevos.haptics'), false);
  assert.equal(store.get('erevos.camera-open'), 'no');
  assert.equal(store.has('erevos.camera-drop'), false);
  assert.deepEqual(JSON.parse(store.get('erevos.backup-auto')!), { ...mine, folder: 'content://elsewhere', last: 12, error: '' });
  assert.deepEqual(JSON.parse(store.get('erevos.backup-cloud')!), { ...sent, error: '' });
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.deepEqual(JSON.parse(store.get('erevos.backup-cloud')!), { ...cloud, password: 'pw', names: sent.names, parts: sent.parts, unfinished: sent.unfinished, last: 11, error: '' });

  // Sending to another server, the backup's is put in place whole.
  store.set('erevos.backup-cloud', JSON.stringify({ ...sent, url: 'https://other.example/dav/' }));
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.deepEqual(JSON.parse(store.get('erevos.backup-cloud')!), { ...cloud, error: '' });
  assert.equal(store.get('erevos.zoom'), 'stays');

  // One that holds no automatic backups, nor a server, ends them here too.
  store.delete('erevos.backup-auto');
  store.delete('erevos.backup-cloud');
  const none = await backUp(await backupKey('backup-pass'));
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  await restoreBackup(await openBackup(none, 'backup-pass'), fromShelf);
  assert.equal(store.has('erevos.backup-auto'), false);
  assert.equal(store.has('erevos.backup-cloud'), false);
});

t("holds the copies for contacts' other devices, the space's own carried packets, its SMS data and the SIM for each number called", async () => {
  await phone();
  const held = { 'erevos-fanout': 'sealed copies', 'erevos-carried': 'sealed own packets', 'erevos-sms': 'sealed sms', 'erevos-phone': 'sealed sims' };
  for (const [name, text] of Object.entries(held)) files.set(name, text);
  const file = await backUp(await backupKey('backup-pass'));
  const names = (await openBackup(file, 'backup-pass')).entries.map((entry) => entry.name);
  // The copies and packets before the chats' keys and messages, so each is of a message the backup holds.
  assert.ok(names.indexOf('erevos-fanout') < names.indexOf('erevos-history'));
  assert.ok(names.indexOf('erevos-carried') < names.indexOf('erevos-history'));
  wipe();
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  for (const [name, text] of Object.entries(held)) assert.equal(files.get(name), text, name);

  // One that holds none of them deletes the phone's.
  for (const name of Object.keys(held)) files.delete(name);
  const none = await backUp(await backupKey('backup-pass'));
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  await restoreBackup(await openBackup(none, 'backup-pass'), fromShelf);
  for (const name of Object.keys(held)) assert.equal(files.has(name), false, name);
});

t('the SIMs chosen for calls come back only on the phone they were chosen on; those kept from before it was said, until a backup from another phone is restored', async () => {
  const { key } = await phone();
  const sims = await PhoneSims.open(0, key);
  await sims.remember('+306911111111', 'account-1');
  const file = await backUp(await backupKey('backup-pass'));
  const id = await phoneId();
  assert.match(id, /^[0-9a-f]{32}$/);
  // On the same phone: as they were.
  await sims.remember('+306911111111', 'account-2');
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.equal((await PhoneSims.open(0, key)).accountFor('+306911111111'), 'account-1');
  assert.equal(await phoneId(), id);
  // As an Erevos from before kept them, saying no phone: this phone's.
  const before = sealedFile<{ sims: { number: string; account: string }[] }>({ name: 'erevos-phone', empty: { sims: [] }, checked: (value) => value as { sims: { number: string; account: string }[] }, block: 4096 });
  await before.save('space', 0, key, { sims: [{ number: '+306922222222', account: 'account-3' }] });
  assert.equal((await PhoneSims.open(0, key)).accountFor('+306922222222'), 'account-3');

  // On another phone: none of them, as its ids name other SIMs; nor, from then on, those kept
  // saying no phone, which may have come with the backup.
  wipe();
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.equal((await PhoneSims.open(0, key)).accountFor('+306911111111'), '');
  await before.save('space', 0, key, { sims: [{ number: '+306922222222', account: 'account-3' }] });
  assert.equal((await PhoneSims.open(0, key)).accountFor('+306922222222'), '');
  // Those chosen here count.
  await (await PhoneSims.open(0, key)).remember('+306933333333', 'account-4');
  assert.equal((await PhoneSims.open(0, key)).accountFor('+306933333333'), 'account-4');
  assert.notEqual(await phoneId(), id);
});

t('a backup from another phone is said so after its restore; the old phone said lost counts until a backup is restored again, so nothing moves by itself for that one', async () => {
  await phone();
  const file = await backUp(await backupKey('backup-pass'));
  // On the same phone: nothing to say.
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.equal(await restoredFromOther(), false);
  assert.equal(await lostMark(), '');
  // On another phone: said, and the old phone may be said lost.
  wipe();
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.equal(await restoredFromOther(), true);
  assert.deepEqual([await lostMark(), await lostAt()], ['', 0]);
  await markLost(1000);
  const mark = await lostMark();
  assert.match(mark, /^[0-9a-f]{32}$/);
  assert.equal(await lostAt(), 1000);
  // Said again: a new mark, so each place moves once more.
  await markLost(2000);
  assert.notEqual(await lostMark(), mark);
  assert.equal(await lostAt(), 2000);
  // The mark is in no backup.
  const later = await backUp(await backupKey('backup-pass'));
  assert.ok(!(await openBackup(later, 'backup-pass')).entries.some((entry) => entry.name === 'erevos.lost-phone'));
  // A backup restored since: the mark counts no more, until the owner says so again.
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.deepEqual([await lostMark(), await lostAt()], ['', 0]);
  store.set('erevos.lost-phone', 'not a mark');
  assert.equal(await lostMark(), '');
});

t("restored with the same LoRa radio, what this phone kept of the radio's own settings stays, to put back", async () => {
  await phone();
  store.set('erevos.lora', JSON.stringify({ address: 'AA:BB', name: 'Mesh' }));
  const file = await backUp(await backupKey('backup-pass'));
  const kept = { device: 'ZGV2aWNl', position: 'cG9zaXRpb24=' };
  store.set('erevos.lora', JSON.stringify({ address: 'AA:BB', name: 'Mesh', kept }));
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.deepEqual(JSON.parse(store.get('erevos.lora')!), { address: 'AA:BB', name: 'Mesh', kept });
  // Another radio here: the backup's, as it holds it.
  store.set('erevos.lora', JSON.stringify({ address: 'CC:DD', name: 'Other', kept }));
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.deepEqual(JSON.parse(store.get('erevos.lora')!), { address: 'AA:BB', name: 'Mesh' });
});

t("holds the phone module's settings: the quick replies and the rules that block calls, a contact group's by its title on another phone", async () => {
  clearPhone();
  phoneModule.replies = ['Call you back', 'In a meeting'];
  phoneModule.groups = [{ id: '12', title: 'Work', account: 'me@example.org', count: 3 }];
  phoneModule.rules = rulesJson({ telemarketing: true, own: ['+3069'], groups: [{ id: '12', until: 0 }] });
  const native = await phoneSettingsForBackup();
  assert.ok(native);
  await phone();
  const file = await backUp(await backupKey('backup-pass'), { native, bare: true });
  assert.deepEqual(backupNative(await openBackup(file, 'backup-pass')), native);

  // Another phone, whose own group of that name has another id, and a group 12 of another name.
  clearPhone();
  phoneModule.replies = ['Mine'];
  phoneModule.groups = [
    { id: '12', title: 'Family', account: 'me@example.org', count: 2 },
    { id: '40', title: 'Work', account: 'me@example.org', count: 3 },
  ];
  await putPhoneSettings(backupNative(await openBackup(file, 'backup-pass')));
  assert.deepEqual(phoneModule.replies, ['Call you back', 'In a meeting']);
  assert.deepEqual(rulesFrom(phoneModule.rules), { telemarketing: true, own: ['+3069'], groups: [{ id: '40', until: 0 }] });
  // While Erevos may not read the contacts, no group is known, and none is blocked.
  phoneModule.allowed = false;
  await putPhoneSettings(native);
  assert.deepEqual(rulesFrom(phoneModule.rules).groups, []);
  // The usual replies, when the backup held none of the owner's own.
  clearPhone();
  const usual = await phoneSettingsForBackup();
  phoneModule.replies = ['Mine'];
  await putPhoneSettings(usual);
  assert.deepEqual(phoneModule.replies, []);
  assert.equal(phoneModule.rules, '');
  // What is not the module's settings changes nothing.
  phoneModule.replies = ['Mine'];
  await putPhoneSettings(utf8Encode('not json'));
  await putPhoneSettings(null);
  assert.deepEqual(phoneModule.replies, ['Mine']);
});

t('a bare backup\'s parts are all of one size, the size of a full one, or of a whole number of them, and open as the others do', async () => {
  await phone();
  photos(5);
  const file = await backUp(await backupKey('backup-pass'), { bare: true });
  const sizes = new Set([...shelf.values()].map((part) => part.length));
  assert.equal(shelf.size, 2);
  assert.equal(BARE_PART, PART + 20 + 10 + 28);
  assert.deepEqual([...sizes], [BARE_PART]);
  assert.notEqual(file.length % BARE_PART, 0);
  for (const part of shelf.values()) assert.ok(!Buffer.from(part).toString('latin1').includes('erevos'));
  wipe();
  await restoreBackup(await openBackup(file, 'backup-pass'), fromShelf);
  assert.equal([...blobs.keys()].filter((name) => name.startsWith('erevos-file-')).length, 5);

  // A voice message larger than a part has one of its own, of two full ones.
  for (const name of [...blobs.keys()]) if (name.startsWith('erevos-file-')) blobs.delete(name);
  const long = `erevos-voice-${'c'.repeat(32)}`;
  const sound = randomBytes(PART + 1000);
  blobs.set(long, sound);
  shelf.clear();
  const longer = await backUp(await backupKey('backup-pass'), { bare: true });
  assert.deepEqual(
    [...shelf.values()].map((part) => part.length / BARE_PART).sort(),
    [1, 2],
  );
  wipe();
  await restoreBackup(await openBackup(longer, 'backup-pass'), fromShelf);
  assert.deepEqual(blobs.get(long), sound);
});

t('names a backup\'s files by its start, picks a free one, and deletes the older whole backups with their parts, as the desktop app does', () => {
  const stem = backupStem(new Date(2026, 10, 4, 3, 12).getTime());
  assert.equal(stem, 'erevos-backup-2026-11-04-0312');
  assert.equal(backupFileName(stem), 'erevos-backup-2026-11-04-0312.erevos');
  assert.equal(partFileName(stem, 2), 'erevos-backup-2026-11-04-0312.part2.erevos');
  assert.deepEqual(backupFileOf('erevos-backup-2026-11-04-0312.part2.erevos'), { stem, part: true });
  assert.deepEqual(backupFileOf('erevos-backup-2026-11-04-0312-2.erevos'), { stem: `${stem}-2`, part: false });
  for (const other of ['notes.txt', 'erevos-backup-2026.erevos.txt', '../erevos-backup-1.erevos', 'erevos-backup-1.part.erevos']) assert.equal(backupFileOf(other), null, other);
  assert.equal(freeStem(stem, ['notes.txt']), stem);
  assert.equal(freeStem(stem, [`${stem}.part1.erevos`]), `${stem}-2`);
  assert.equal(freeStem(stem, [`${stem}.erevos`, `${stem}-2.erevos`]), `${stem}-3`);
  // Where the folder cannot be listed, with the seconds and milliseconds: no two alike.
  const unique = uniqueStem(new Date(2026, 10, 4, 3, 12, 5, 42).getTime());
  assert.equal(unique, 'erevos-backup-2026-11-04-0312-05042');
  assert.deepEqual(backupFileOf(partFileName(unique, 1)), { stem: unique, part: true });
  assert.ok(uniqueStem(new Date(2026, 10, 4, 3, 12, 5, 43).getTime()) > unique);

  const at = (day: number) => `erevos-backup-2026-11-0${day}-0312`;
  const folder = [
    'notes.txt',
    `${at(1)}.erevos`,
    `${at(1)}.part1.erevos`,
    `${at(2)}.part1.erevos`, // one that never ended
    `${at(3)}.erevos`,
    `${at(3)}.part1.erevos`,
    `${at(3)}.part2.erevos`,
    `${at(4)}.erevos`,
    `${at(5)}.erevos`,
    `${at(5)}.part1.erevos`,
    `${at(6)}.part1.erevos`, // being made
  ];
  const stale = [`${at(1)}.erevos`, `${at(1)}.part1.erevos`, `${at(2)}.part1.erevos`];
  assert.deepEqual(staleBackups(folder, 3), stale);
  assert.deepEqual(staleBackups(folder, 0), []);
  assert.deepEqual(staleBackups(folder, 9), [`${at(2)}.part1.erevos`]);
  const desktop = createRequire(import.meta.url)('../../desktop/backups.js') as { staleBackups(names: string[], keep: number): string[]; isBackupFile(name: string): boolean };
  for (const keep of [0, 1, 3, 9]) assert.deepEqual(desktop.staleBackups(folder, keep), staleBackups(folder, keep), `keep ${keep}`);
  for (const name of [...folder, '../x.erevos', 'erevos-backup-1.part.erevos', backupFileName(unique)]) assert.equal(desktop.isBackupFile(name), backupFileOf(name) !== null, name);
  return Promise.resolve();
});

t("the desktop app's shell lists, reads, writes and deletes a backup's files only in a folder chosen, and keeps the newest whole ones", async () => {
  const { backupRequest } = createRequire(import.meta.url)('../../desktop/backups.js') as { backupRequest(request: Request, url: URL, chosen: () => string[]): Promise<Response> };
  const where = mkdtempSync(join(tmpdir(), 'erevos-backups-'));
  try {
    const ask = (method: string, query: Record<string, string>, body?: Uint8Array, chosen = [where]) => {
      const request = new Request(`http://erevos/__backup?${new URLSearchParams({ folder: where, ...query }).toString()}`, { method, body: body as BodyInit | undefined });
      return backupRequest(request, new URL(request.url), () => chosen);
    };
    writeFileSync(join(where, 'notes.txt'), 'mine');
    for (const day of [1, 2, 3, 4]) {
      const stem = `erevos-backup-2026-11-0${day}-0312`;
      assert.equal((await ask('PUT', { name: `${stem}.part1.erevos`, keep: '0' }, new Uint8Array([day, 1]))).status, 204);
      assert.equal((await ask('PUT', { name: `${stem}.erevos`, keep: '3' }, new Uint8Array([day]))).status, 204);
    }
    const listed = (await (await ask('GET', {})).json()) as string[];
    assert.equal(listed.length, 6);
    assert.ok(!listed.some((name) => name.includes('11-01')));
    assert.deepEqual(readdirSync(where).filter((name) => !name.startsWith('erevos-backup-')), ['notes.txt']);
    const read = await ask('GET', { name: 'erevos-backup-2026-11-04-0312.part1.erevos' });
    assert.deepEqual(new Uint8Array(await read.arrayBuffer()), new Uint8Array([4, 1]));
    assert.equal((await ask('GET', { name: 'erevos-backup-2026-11-09-0312.erevos' })).status, 404);
    assert.equal((await ask('DELETE', { name: 'erevos-backup-2026-11-04-0312.part1.erevos' })).status, 204);
    assert.equal((await ask('GET', { name: 'erevos-backup-2026-11-04-0312.part1.erevos' })).status, 404);
    // Nothing else, nowhere else.
    assert.equal((await ask('GET', { name: 'notes.txt' })).status, 400);
    assert.equal((await ask('PUT', { name: '../erevos-backup-1.erevos' }, new Uint8Array([1]))).status, 400);
    assert.equal((await ask('GET', {}, undefined, [])).status, 403);
    assert.equal((await ask('POST', { name: 'erevos-backup-2026-11-04-0312.erevos' })).status, 405);
  } finally {
    rmSync(where, { recursive: true, force: true });
  }
  const shell = readFileSync(join(import.meta.dirname, '../../desktop/main.js'), 'utf8');
  assert.match(shell, /url\.pathname === '\/__backup'\) return backup\(request, url\)/);
  assert.match(shell, /backupRequest\(request, url, chosenFolders\)/);
  const build = JSON.parse(readFileSync(join(import.meta.dirname, '../../desktop/package.json'), 'utf8')) as { build: { files: string[] } };
  assert.ok(build.build.files.includes('backups.js'));
  // Sailfish OS's shell names them alike, and keeps the newest whole ones.
  const sailfish = readFileSync(join(import.meta.dirname, '../../sailfish/src/shellserver.cpp'), 'utf8');
  assert.ok(sailfish.includes('BackupName(QStringLiteral("^(erevos-backup-[0-9-]+)(\\\\.part[0-9]+)?\\\\.erevos$"))'));
  assert.match(sailfish, /found\.captured\(2\)\.isEmpty\(\)\) whole << found\.captured\(1\)/);
  assert.match(sailfish, /!kept\.contains\(found\.captured\(1\)\) && found\.captured\(1\) < newest\) dir\.remove\(entry\)/);
});

t('into a folder on the phone: the parts as they are made, then the backup; the newest whole ones kept; one that failed leaves none of its files', async () => {
  const { clip } = await phone();
  const chunks = photos(5);
  const uri = 'content://com.android.externalstorage.documents/tree/primary%3ABackups';
  folders.set(uri, new Map([['notes.txt', new Uint8Array([1])]]));
  const key = await backupKey('backup-pass');
  const day = (n: number) => new Date(2026, 10, n, 3, 12).getTime();
  looks.count = 0;
  for (const n of [1, 2, 3, 4]) {
    const written = await writeBackup(uri, (parts) => makeBackup(key, { parts }), day(n), 3);
    assert.deepEqual(written, { name: `erevos-backup-2026-11-0${n}-0312.erevos`, size: written.size, parts: 2, partsSize: written.partsSize });
    // The files beside it, as large together as they lie in the folder.
    const beside = [1, 2].map((part) => folders.get(uri)!.get(partFileName(`erevos-backup-2026-11-0${n}-0312`, part))!.length);
    assert.equal(written.partsSize, beside[0] + beside[1]);
    assert.ok(written.partsSize > 5 * 1024 * 1024);
  }
  const folder = folders.get(uri)!;
  assert.deepEqual(
    [...folder.keys()].sort(),
    ['notes.txt', ...[2, 3, 4].flatMap((n) => [`erevos-backup-2026-11-0${n}-0312.erevos`, `erevos-backup-2026-11-0${n}-0312.part1.erevos`, `erevos-backup-2026-11-0${n}-0312.part2.erevos`])].sort(),
  );
  // A second in the same minute starts otherwise.
  assert.equal((await writeBackup(uri, (parts) => makeBackup(key, { parts }), day(4))).name, 'erevos-backup-2026-11-04-0312-2.erevos');
  const before = [...folder.keys()].sort();
  // The memory card is full at the backup's own file, or at a part: none of its files stay.
  for (const failAt of [3, 2]) {
    writes.failAt = failAt;
    await assert.rejects(writeBackup(uri, (parts) => makeBackup(key, { parts }), day(5), 3), /No room left/);
    writes.failAt = 0;
    assert.deepEqual([...folder.keys()].sort(), before, `at write ${failAt}`);
  }
  // A folder gone says so.
  await assert.rejects(writeBackup('content://gone', (parts) => makeBackup(key, { parts }), day(6), 3), /not there/);
  // All through the folder functions, off the thread the screen answers on (Folders.kt): never a
  // look for each file's name and size on it.
  assert.equal(looks.count, 0);

  // Restored from that folder on another phone.
  const file = folder.get('erevos-backup-2026-11-04-0312.erevos')!;
  wipe();
  const opened = await openBackup(file, 'backup-pass');
  const there = await partsIn(uri);
  assert.deepEqual(there.missing(opened.parts!.names), []);
  assert.deepEqual(there.missing(['erevos-backup-2026-11-01-0312.part1.erevos']), ['erevos-backup-2026-11-01-0312.part1.erevos']);
  await restoreBackup(opened, there.read);
  for (const [name, bytes] of chunks) assert.deepEqual(blobs.get(name), bytes);
  assert.deepEqual(await loadClip(clip), new Uint8Array([1, 2, 3, 4]));
  folders.clear();
});

t('a build before the folder functions writes, lists and deletes in the folder through expo-file-system alike', async () => {
  await phone();
  photos(5);
  const uri = 'content://com.android.externalstorage.documents/tree/primary%3AOlder';
  folders.set(uri, new Map([['notes.txt', new Uint8Array([1])]]));
  const key = await backupKey('backup-pass');
  const day = (n: number) => new Date(2026, 10, n, 3, 12).getTime();
  nativeFolders.on = false;
  try {
    for (const n of [1, 2, 3, 4]) {
      const written = await writeBackup(uri, (parts) => makeBackup(key, { parts }), day(n), 3);
      assert.deepEqual(written, { name: `erevos-backup-2026-11-0${n}-0312.erevos`, size: written.size, parts: 2, partsSize: written.partsSize });
    }
    const folder = folders.get(uri)!;
    const kept = [2, 3, 4].flatMap((n) => [`erevos-backup-2026-11-0${n}-0312.erevos`, `erevos-backup-2026-11-0${n}-0312.part1.erevos`, `erevos-backup-2026-11-0${n}-0312.part2.erevos`]);
    assert.deepEqual([...folder.keys()].sort(), ['notes.txt', ...kept].sort());
    const before = [...folder.keys()].sort();
    for (const failAt of [3, 2]) {
      writes.failAt = failAt;
      await assert.rejects(writeBackup(uri, (parts) => makeBackup(key, { parts }), day(5), 3), /No room left/);
      writes.failAt = 0;
      assert.deepEqual([...folder.keys()].sort(), before, `at write ${failAt}`);
    }
    // Each backup file with its size, and those asked for gone.
    const listed = await listBackupFiles(uri);
    assert.deepEqual([...listed!.keys()].sort(), [...kept].sort());
    for (const [name, size] of listed!) assert.equal(size, folder.get(name)!.length);
    await deleteBackupFiles(uri, kept.slice(0, 3));
    assert.deepEqual([...folder.keys()].sort(), ['notes.txt', ...kept.slice(3)].sort());
    assert.ok(looks.count > 0);
  } finally {
    nativeFolders.on = true;
    writes.failAt = 0;
    folders.clear();
  }
});

t('sends the parts to a server under names of their own, restores from there, deletes them with their backup, and those of one cut short the next time', async () => {
  const there = new Map<string, Uint8Array>();
  let down = false;
  let fullAfter = Infinity;
  const dav = davServer(there, () => 'app-pass');
  setCloudHttp(async (method, url, headers, body) => {
    if (down) throw new Error('no network');
    if (method === 'PUT' && fullAfter-- <= 0) return { status: 507, bytes: new Uint8Array(0) };
    return dav(method, url, headers, body);
  });
  const partSizes = (backups: string[]) => [...there].filter(([name]) => !backups.includes(name)).map(([, bytes]) => bytes.length);
  try {
    let cloud = await startCloudBackup('https://cloud.example/dav/Backups', 'me', 'app-pass');
    const { clip } = await phone();
    const chunks = photos(9);
    const key = await backupKey('backup-pass');
    for (let i = 1; i <= 4; i++) cloud = await sendToCloud(cloud, toServer(key), 3, i);
    assert.equal(cloud.error, '');
    // Three backups, each with its three parts, all of one size; the oldest gone with its parts.
    assert.equal(there.size, 3 + 3 * 3);
    assert.deepEqual(new Set(partSizes(cloud.names)), new Set([BARE_PART]));
    for (const name of there.keys()) assert.match(name, /^[0-9a-f]{24}$/);
    const expected = cloud.names.flatMap((name) => [name, ...Array.from({ length: cloud.parts[name].count }, (_, n) => partName(cloud.parts[name].seed, n))]);
    assert.deepEqual([...there.keys()].sort(), expected.sort());
    assert.deepEqual(cloud.unfinished, []);

    // Restored from the server: the backup, then its parts, from there.
    const sentHere = cloud;
    const server = cloudServer('https://cloud.example/dav/Backups', 'me', 'app-pass');
    const listed = await listCloud(server);
    assert.equal(listed.length, 3);
    const opened = await openBackup(await fetchFromCloud(server, listed[0].name), 'backup-pass');
    const parts = await cloudParts(server);
    assert.deepEqual(parts.missing(opened.parts!.names), []);
    assert.deepEqual(parts.missing(['0'.repeat(24)]), ['0'.repeat(24)]);
    assert.equal(await parts.read('../notes.txt'), null);
    wipe();
    await restoreBackup(opened, parts.read);
    for (const [name, bytes] of chunks) assert.deepEqual(blobs.get(name), bytes);
    assert.deepEqual(await loadClip(clip), new Uint8Array([1, 2, 3, 4]));

    // The server full after two parts: what went of it is deleted at once. (As the phone that sent them.)
    cloud = sentHere;
    const kept = new Set(there.keys());
    fullAfter = 2;
    cloud = await sendToCloud(cloud, toServer(key), 3, 5);
    fullAfter = Infinity;
    assert.match(cloud.error, /no room/);
    assert.deepEqual(new Set(there.keys()), kept);
    assert.deepEqual(cloud.unfinished, []);

    // The network gone after two parts: they stay there until the next backup goes, which deletes
    // them first.
    let sent = 0;
    cloud = await sendToCloud(
      cloud,
      (sink) =>
        makeBackup(key, {
          bare: true,
          parts: async (bytes) => {
            if (++sent > 2) down = true;
            return sink(bytes);
          },
        }),
      3,
      6,
    );
    down = false;
    assert.match(cloud.error, /Could not reach/);
    assert.equal(there.size, kept.size + 2);
    assert.equal(cloud.unfinished.length, 1);
    assert.deepEqual(await loadCloudBackup(), cloud);
    // As after the phone stopped while sending: a seed kept, its parts there. With the server full,
    // they go first all the same, though the backup does not.
    const seed = 'ef'.repeat(16);
    there.set(partName(seed, 0), new Uint8Array([1]));
    const stopped = { ...cloud, unfinished: [...cloud.unfinished, { seed, count: 16 }] };
    fullAfter = 0;
    cloud = await sendToCloud(stopped, toServer(key), 3, 7);
    fullAfter = Infinity;
    assert.match(cloud.error, /no room/);
    assert.deepEqual(cloud.unfinished, []);
    assert.equal(there.size, kept.size);
    assert.ok(!there.has(partName(seed, 0)));
    assert.deepEqual(await loadCloudBackup(), cloud);
    cloud = await sendToCloud(cloud, toServer(key), 3, 8);
    assert.equal(cloud.error, '');
    assert.deepEqual(cloud.unfinished, []);
    assert.equal(there.size, 3 + 3 * 3);
  } finally {
    setCloudHttp(null);
    await stopCloudBackup();
  }
});

t('automatic backups go into their folder and to the server; restored on another phone, they wait for a folder there and go only to the server meanwhile', async () => {
  const there = new Map<string, Uint8Array>();
  setCloudHttp(async (method, url, headers, body) => davServer(there, () => 'app-pass')(method, url, headers, body));
  const uri = 'content://com.android.externalstorage.documents/tree/primary%3AErevos';
  folders.set(uri, new Map());
  try {
    await phone();
    photos(5);
    const DAY = 86_400_000;
    // Days with no change of the clocks between them.
    const start = new Date(2026, 5, 1, 3, 12).getTime();
    await startAutoBackup(1, uri, await backupKey('auto-pass'));
    assert.equal(panic.folder, uri);
    await startCloudBackup('https://cloud.example/dav/Backups', 'me', 'app-pass');
    for (let n = 0; n < 4; n++) {
      const { auto, cloud } = await runAutoBackup(false, start + n * DAY);
      assert.equal(auto?.error, '');
      assert.equal(cloud?.error, '');
    }
    // Not due yet: nothing.
    await runAutoBackup(false, start + 3 * DAY + 1000);
    const folder = folders.get(uri)!;
    assert.equal([...folder.keys()].filter((name) => name.endsWith('-0312.erevos')).length, KEEP);
    // Nothing on the phone changed: each names again the two parts of the first, the only ones there.
    assert.equal(folder.size, KEEP + 2);
    assert.deepEqual(
      [...folder.keys()].filter((name) => name.includes('.part')).sort(),
      [1, 2].map((n) => partFileName('erevos-backup-2026-06-01-0312', n)),
    );
    assert.equal(there.size, KEEP + 2);

    // On another phone, the newest from the folder.
    const newest = [...folder.keys()].filter((name) => !name.includes('.part')).sort().at(-1)!;
    wipe();
    await restoreBackup(await openBackup(folder.get(newest)!, 'auto-pass'), (await partsIn(uri)).read);
    const restored = await loadAutoBackup();
    assert.equal(restored?.folder, '');
    assert.equal(restored?.every, 1);
    assert.equal(await isAutoBackupPassword('auto-pass'), true);
    // Due: only the server gets it, as the folder stays with the other phone.
    const files = folder.size;
    const run = await runAutoBackup(false, start + 5 * DAY);
    assert.equal(folder.size, files);
    assert.equal(run.cloud?.error, '');
    assert.equal(run.cloud?.last, start + 5 * DAY);
    assert.equal(run.auto?.last, restored?.last);
    // Not again until the days chosen went by, then a folder chosen: it goes there again.
    assert.equal((await runAutoBackup(false, start + 5 * DAY + 1000)).cloud?.last, start + 5 * DAY);
    await changeAutoBackup({ folder: uri });
    assert.equal(panic.folder, uri);
    const again = await runAutoBackup(true, start + 6 * DAY);
    assert.equal(again.auto?.last, start + 6 * DAY);
    assert.ok([...folder.keys()].includes('erevos-backup-2026-06-07-0312.erevos'));
  } finally {
    setCloudHttp(null);
    await stopCloudBackup();
    folders.clear();
  }
});

// The phone's photos', files' and voice messages' files, as a backup's parts hold them.
const media = () => new Map([...blobs].filter(([name]) => name.startsWith('erevos-file-') || name.startsWith('erevos-voice-')));

// A photo's file, of `size` bytes: of 1.5 MB, two go in a part.
function addPhoto(size = 1536 * 1024): string {
  const name = `erevos-file-${toHex(randomBytes(16))}-0`;
  blobs.set(name, randomBytes(size));
  return name;
}

// What a backup says binds a part it names.
const recordOf = ({ size, sha, id, n, files: held, out }: PartMade) => ({ size, sha, id, n, files: held, out });

// Restores a backup on another phone, which has `own` of its own, and gives what that phone then
// has of photos, files and voice messages. This phone is as it was after.
async function elsewhere(opened: Backup, read: PartReader, own: [string, Uint8Array][] = []): Promise<Map<string, Uint8Array>> {
  const here = snapshot();
  wipe();
  for (const [name, bytes] of own) blobs.set(name, bytes);
  try {
    await restoreBackup(opened, read);
    return media();
  } finally {
    wipe();
    for (const [name, value] of here.store) store.set(name, value);
    for (const [name, value] of here.files) files.set(name, value);
    for (const [name, value] of here.blobs) blobs.set(name, value);
  }
}

type Sealed = { kind: number; name: string; data: Uint8Array };

// A backup made here, opened as any Erevos from Argon2id on reads it, before it knows the kinds of
// its entries: its head, its key, and each entry with the kind it was written with.
async function sealedOf(file: Uint8Array, password: string): Promise<{ head: Uint8Array; key: Uint8Array; entries: Sealed[] }> {
  const head = Buffer.from(file.subarray(0, 60));
  const { key } = await backupKey(password, head.subarray(16, 32), head.readUInt32BE(32), { salt: head.subarray(36, 52), m: head.readUInt32BE(52), t: head.readUInt32BE(56) });
  const packed = Buffer.from(decryptBytes(key, file.subarray(60)));
  const entries: Sealed[] = [];
  for (let at = 0; at < packed.length; ) {
    const kind = packed[at];
    const length = packed.readUInt16BE(at + 1);
    const name = packed.subarray(at + 3, at + 3 + length).toString('utf8');
    at += 3 + length;
    const size = packed.readUInt32BE(at);
    entries.push({ kind, name, data: new Uint8Array(packed.subarray(at + 4, at + 4 + size)) });
    at += 4 + size;
  }
  return { head: new Uint8Array(head), key, entries };
}

// The backup sealed again with its own key and head, its entries as `change` makes them.
async function resealed(file: Uint8Array, password: string, change: (entries: Sealed[]) => Sealed[]): Promise<Uint8Array> {
  const { head, key, entries } = await sealedOf(file, password);
  const packed = Buffer.concat(
    change(entries).map(({ kind, name, data }) => {
      const n = utf8Encode(name);
      const at = Buffer.alloc(3 + n.length + 4);
      at[0] = kind;
      at.writeUInt16BE(n.length, 1);
      at.set(n, 3);
      at.writeUInt32BE(data.length, 3 + n.length);
      return Buffer.concat([at, data]);
    }),
  );
  return new Uint8Array(Buffer.concat([head, encryptBytes(key, new Uint8Array(packed))]));
}

// A backup's table of its parts, as JSON (lock/backup.ts makeBackup).
type Table = { id: string; names: string[]; phone: string; made?: Record<string, unknown>[] };

// The backup with its table of parts as `change` makes it, and of kind `kind` if given.
const withTable = (file: Uint8Array, password: string, change: (table: Table) => unknown, kind?: number) =>
  resealed(file, password, (entries) =>
    entries.map((entry) => (entry.name === 'parts' ? { kind: kind ?? entry.kind, name: 'parts', data: utf8Encode(JSON.stringify(change(JSON.parse(utf8Decode(entry.data)) as Table))) } : entry)),
  );

// Numbers that look random and are the same on every run, so a check that fails here fails again.
function seeded(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

t('an automatic backup names again the parts of the one before whose files are all as they were, makes new ones only for the rest, and each restores as the phone was then', async () => {
  await phone();
  for (let i = 0; i < 6; i++) addPhoto();
  const key = await backupKey('auto-pass');
  // One made by hand says nothing of its parts, as before.
  assert.equal((await openBackup(await backUp(key), 'auto-pass')).parts!.made, null);
  shelf.clear();

  let first: PartMade[] = [];
  const one = await backUp(key, { earlier: [], made: (parts) => (first = parts) });
  const then = media();
  // The first names none of before: three of its own, two photos in each, the voice message in the
  // last, each bound to it.
  const opened = await openBackup(one, 'auto-pass');
  assert.deepEqual(first.map((part) => part.name), opened.parts!.names);
  assert.deepEqual([...shelf.keys()], opened.parts!.names);
  assert.equal(first.length, 3);
  for (const [n, part] of first.entries()) {
    const bytes = shelf.get(part.name)!;
    assert.deepEqual([part.id, part.n, part.size, part.sha, part.out], [toHex(opened.parts!.id), n, bytes.length, toHex(sha256Bytes(bytes)), []]);
    assert.equal(part.stamps.length, part.files.length);
    assert.ok(part.stamps.every(Boolean));
  }
  assert.deepEqual(opened.parts!.made, first.map(recordOf));
  assert.deepEqual(first.flatMap((part) => part.files).sort(), [...then.keys()].sort());

  // Since: a photo of the second part deleted, one of the third written again, and a new one.
  const deleted = first[1].files[0];
  blobs.delete(deleted);
  const rewritten = first[2].files[0];
  blobs.set(rewritten, blobs.get(rewritten)!.slice());
  const added = addPhoto();
  let second: PartMade[] = [];
  const two = await backUp(key, { earlier: earlierParts([first], () => true), made: (parts) => (second = parts) });
  const now = media();
  const id = toHex((await openBackup(two, 'auto-pass')).parts!.id);
  // The first part named again as it is, and new ones of its own for all the rest.
  assert.deepEqual(second[0], first[0]);
  assert.ok(second.length > 1);
  for (const [n, part] of second.slice(1).entries()) {
    assert.deepEqual([part.id, part.n], [id, n + 1]);
    assert.ok(!first.some((before) => before.name === part.name));
  }
  assert.equal(shelf.size, first.length + second.length - 1);
  // Each file on the phone once, and not the one deleted.
  assert.deepEqual(second.flatMap((part) => part.files).sort(), [...now.keys()].sort());
  assert.ok(now.has(added) && !now.has(deleted));

  // Each restored on another phone, with photos of its own, comes back as the phone was then.
  const theirs: [string, Uint8Array] = [`erevos-file-${'f'.repeat(32)}-0`, new Uint8Array([7])];
  assert.deepEqual(await elsewhere(await openBackup(two, 'auto-pass'), fromShelf, [theirs, [deleted, then.get(deleted)!]]), now);
  assert.deepEqual(await elsewhere(opened, fromShelf, [theirs, [added, now.get(added)!]]), then);

  // Of the earlier backups, the newest first: each part once, and only those still there.
  assert.deepEqual(
    earlierParts([second, first], () => true).map((part) => part.name),
    [...second, ...first.slice(1)].map((part) => part.name),
  );
  const there = earlierParts([second, first], (part) => part.name !== first[0].name);
  assert.deepEqual(
    there.map((part) => part.name),
    [...second.slice(1), ...first.slice(1)].map((part) => part.name),
  );
  let third: PartMade[] = [];
  const three = await backUp(key, { earlier: there, made: (parts) => (third = parts) });
  assert.ok(!third.some((part) => part.name === first[0].name));
  assert.deepEqual(third.flatMap((part) => part.files.filter((_, i) => !part.out.includes(i))).sort(), [...now.keys()].sort());
  assert.deepEqual(await elsewhere(await openBackup(three, 'auto-pass'), fromShelf), now);
});

t("a part holding a file kept out since is not named again, so the backup names no part that holds it, and the phone's own goes; one named again gives only what no part before it gives", async () => {
  await phone();
  const chunks = photos(3);
  const out = [...chunks.keys()].sort()[1];
  const key = await backupKey('auto-pass');
  let first: PartMade[] = [];
  await backUp(key, { earlier: [], made: (parts) => (first = parts) });
  assert.equal(first.length, 1);

  // A Collection's chunk kept out (MakeOptions.skip): the part that holds it is not named again,
  // and the rest goes in a new one.
  let second: PartMade[] = [];
  const two = await backUp(key, { earlier: first, skip: new Set([out]), made: (made) => (second = made) });
  assert.equal(second.length, 1);
  assert.notEqual(second[0].name, first[0].name);
  assert.deepEqual(second[0].files, first[0].files.filter((name) => name !== out));
  const got = await elsewhere(await openBackup(two, 'auto-pass'), fromShelf, [[out, chunks.get(out)!]]);
  assert.deepEqual([...got.keys()].sort(), [...media().keys()].filter((name) => name !== out).sort());

  // Then with nothing kept out, as in a space that does not keep it out: the second's part, and the
  // first's again for that chunk alone. No part is made.
  let third: PartMade[] = [];
  const parts = shelf.size;
  const three = await backUp(key, { earlier: earlierParts([second, first], () => true), made: (made) => (third = made) });
  assert.equal(shelf.size, parts);
  const i = first[0].files.indexOf(out);
  assert.deepEqual(third, [second[0], { ...first[0], out: first[0].files.flatMap((_, n) => (n === i ? [] : [n])) }]);
  const opened = await openBackup(three, 'auto-pass');
  assert.deepEqual(opened.parts!.made![1].out, third[1].out);
  assert.deepEqual(await elsewhere(opened, fromShelf), media());

  // All of its files kept out, or all given by a part before it: a part is not named at all.
  let none: PartMade[] = [];
  await backUp(key, { earlier: first, skip: new Set(first[0].files), made: (made) => (none = made) });
  assert.deepEqual(none, []);
  let once: PartMade[] = [];
  await backUp(key, { earlier: [first[0], { ...first[0], name: 'part-again' }], made: (made) => (once = made) });
  assert.deepEqual(once, [first[0]]);
});

t('of a part named again, the files a part before it gives are not written from it', async () => {
  await phone();
  const key = await backupKey('auto-pass');
  const [f, h] = [addPhoto(256 * 1024), addPhoto(256 * 1024)];
  let older: PartMade[] = [];
  await backUp(key, { earlier: [], made: (parts) => (older = parts) });
  const was = blobs.get(f)!;
  blobs.set(f, randomBytes(256 * 1024));
  const g = addPhoto(256 * 1024);
  let newer: PartMade[] = [];
  await backUp(key, { earlier: [], made: (parts) => (newer = parts) });
  assert.deepEqual([older.length, newer.length], [1, 1]);
  assert.ok(older[0].files.includes(h) && !older[0].files.includes(g) && newer[0].files.includes(g));
  // As were the ledger wrong: the older part said to hold its files as they are now, first.
  const now = new Map(newer[0].files.map((file, n) => [file, newer[0].stamps[n]]));
  const said = { ...older[0], stamps: older[0].files.map((file) => now.get(file)!) };
  let named: PartMade[] = [];
  const file = await backUp(key, { earlier: [said, newer[0]], made: (parts) => (named = parts) });
  assert.deepEqual(
    named.map((part) => part.name),
    [older[0].name, newer[0].name],
  );
  assert.deepEqual(
    named[1].files.filter((_, n) => !named[1].out.includes(n)),
    [g],
  );
  // The older's file comes back, and the newer's of the same name is not written over it.
  const got = await elsewhere(await openBackup(file, 'auto-pass'), fromShelf);
  assert.deepEqual(got.get(f), was);
  assert.deepEqual(got.get(g), blobs.get(g));
  assert.deepEqual(got.get(h), blobs.get(h));
});

t('where no stamps are told, as in a browser and on Sailfish OS, no part is named again: each automatic backup is whole', async () => {
  await phone();
  photos(4);
  const key = await backupKey('auto-pass');
  let first: PartMade[] = [];
  await backUp(key, { earlier: [], made: (parts) => (first = parts) });
  stampsTold.on = false;
  try {
    let second: PartMade[] = [];
    const two = await backUp(key, { earlier: first, made: (parts) => (second = parts) });
    assert.equal(second.length, first.length);
    assert.ok(second.every((part) => !first.some((before) => before.name === part.name) && part.stamps.every((stamp) => stamp === '')));
    assert.equal((await sealedOf(two, 'auto-pass')).entries.find((entry) => entry.name === 'parts')!.kind, 5);
    // Nor the next time, from parts whose files' stamps none told.
    let third: PartMade[] = [];
    await backUp(key, { earlier: second, made: (parts) => (third = parts) });
    assert.ok(third.every((part) => !second.some((before) => before.name === part.name)));
  } finally {
    stampsTold.on = true;
  }
  // Told again, the files are as they were when the first was made.
  let fourth: PartMade[] = [];
  await backUp(key, { earlier: first, made: (parts) => (fourth = parts) });
  assert.deepEqual(fourth, first);
});

t("a part named again that is missing, changed, cut short, in another's place, of another backup or sealed with another key opens nothing, and the phone stays as it was", async () => {
  await phone();
  photos(6);
  const key = await backupKey('auto-pass');
  let a: PartMade[] = [];
  await backUp(key, { earlier: [], made: (parts) => (a = parts) });
  assert.equal(a.length, 2);
  // The next names the first part again, and makes its own second, of the same number.
  const rewritten = a[1].files[0];
  blobs.set(rewritten, blobs.get(rewritten)!.slice());
  let b: PartMade[] = [];
  const file = await backUp(key, { earlier: a, made: (parts) => (b = parts) });
  assert.deepEqual(b[0], a[0]);
  assert.deepEqual([b.length, b[1].n], [2, 1]);
  assert.notEqual(b[1].id, a[1].id);
  // Another backup with the same key, all of its own; and one with another key.
  let c: PartMade[] = [];
  await backUp(key, { earlier: [], made: (parts) => (c = parts) });
  let d: PartMade[] = [];
  await backUp(await backupKey('other-pass'), { earlier: [], made: (parts) => (d = parts) });

  // What the ledger gave to name again, were it wrong: parts sealed with another key; another
  // backup's part, said to be the first's, or said to be of another number; another's bytes under
  // a part's name; a part said to hold a file it does not. Each backup made names them, and opens
  // nothing.
  const forged: [string, PartMade[]][] = [
    ['sealed with another key', d],
    ["another backup's, said to be the first's", [{ ...c[0], id: a[0].id }]],
    ['of another number', [{ ...c[1], n: 0 }]],
    ["another's bytes under its name", [{ ...a[0], name: c[0].name }]],
    ['said to hold a file it does not', [{ ...a[0], files: [...a[0].files, a[1].files[1]], stamps: [...a[0].stamps, a[1].stamps[1]] }]],
  ];
  const wrong: [string, Backup, string][] = [];
  for (const [what, earlier] of forged) {
    let named: PartMade[] = [];
    const made = await backUp(key, { earlier, made: (parts) => (named = parts) });
    assert.equal(named[0].name, earlier[0].name, what);
    wrong.push([what, await openBackup(made, 'auto-pass'), earlier[0].name]);
  }
  const opened = await openBackup(file, 'auto-pass');
  const names = opened.parts!.names;
  assert.deepEqual(names, b.map((part) => part.name));

  // Another phone, with what it has.
  wipe();
  await phone();
  const before = snapshot();
  const bytes = (name: string) => shelf.get(name)!;
  const instead =
    (name: string, other: Uint8Array | null): PartReader =>
    async (asked) =>
      asked === name ? other : fromShelf(asked);
  const tries: [string, PartReader, typeof MissingPartError | typeof DamagedPartError, string][] = [
    ['missing', instead(names[0], null), MissingPartError, names[0]],
    ['its own missing', instead(names[1], null), MissingPartError, names[1]],
    ['changed', instead(names[0], flipped(bytes(names[0]))), DamagedPartError, names[0]],
    ['cut short', instead(names[0], bytes(names[0]).subarray(0, bytes(names[0]).length - 1)), DamagedPartError, names[0]],
    ['longer', instead(names[1], new Uint8Array(Buffer.concat([bytes(names[1]), new Uint8Array(1)]))), DamagedPartError, names[1]],
    ["in another's place", instead(names[0], bytes(names[1])), DamagedPartError, names[0]],
    ["the earlier backup's own of that number", instead(names[1], bytes(a[1].name)), DamagedPartError, names[1]],
    ['of another backup with the same key', instead(names[0], bytes(c[0].name)), DamagedPartError, names[0]],
    ['sealed with another key', instead(names[0], bytes(d[0].name)), DamagedPartError, names[0]],
  ];
  for (const [what, read, kind, part] of tries) {
    await assert.rejects(restoreBackup(opened, read), (error) => error instanceof kind && error.part === part, what);
    assert.deepEqual(snapshot(), before, what);
  }
  for (const [what, backup, part] of wrong) {
    await assert.rejects(restoreBackup(backup, fromShelf), (error) => error instanceof DamagedPartError && error.part === part, what);
    assert.deepEqual(snapshot(), before, what);
  }
  // With every part as it was made, it comes back.
  await restoreBackup(opened, fromShelf);
});

t('an Erevos from before refuses a backup that names earlier parts, with nothing changed, and restores one that names only its own; what binds the parts is only as Erevos makes it', async () => {
  await phone();
  photos(4);
  const key = await backupKey('auto-pass');
  let first: PartMade[] = [];
  const one = await backUp(key, { earlier: [], made: (parts) => (first = parts) });
  const held = media();
  const two = await backUp(key, { earlier: first });
  // The kinds an Erevos from before knew, up to the keystore's of 6.0.0 on: it refuses a backup of
  // any other at once, before it writes anything (NewerBackupError), and asks to update Erevos.
  const before = new Set([0, 1, 2, 3, 4, 5, 6, 7]);
  const kinds = async (file: Uint8Array) => (await sealedOf(file, 'auto-pass')).entries.map((entry) => entry.kind);
  assert.ok((await kinds(one)).every((kind) => before.has(kind)));
  assert.ok((await kinds(two)).includes(9));
  assert.ok(!(await kinds(two)).includes(5));
  // The first's table says what an Erevos from before reads of its parts, as ever, and more that it does not heed.
  const table = JSON.parse(utf8Decode((await sealedOf(one, 'auto-pass')).entries.find((entry) => entry.name === 'parts')!.data)) as Table;
  assert.deepEqual(Object.keys(table).sort(), ['id', 'made', 'names', 'phone']);
  assert.deepEqual(table.names, first.map((part) => part.name));
  assert.deepEqual(await elsewhere(await openBackup(one, 'auto-pass'), fromShelf), held);
  assert.deepEqual(await elsewhere(await openBackup(two, 'auto-pass'), fromShelf), held);

  // What binds its parts not as Erevos makes it: no backup at all.
  const records = (change: (record: Record<string, unknown>) => Record<string, unknown>) => (table: Table) => ({ ...table, made: table.made!.map(change) });
  const forged: [string, (table: Table) => unknown][] = [
    ['without what binds its parts', (table) => ({ ...table, made: undefined })],
    ['with one part too few', (table) => ({ ...table, made: table.made!.slice(1) })],
    ['with a SHA-256 that is none', records((record) => ({ ...record, sha: 'ab' }))],
    ['with an id that is none', records((record) => ({ ...record, id: 'nope' }))],
    ['with a number past the most', records((record) => ({ ...record, n: 2_000_000 }))],
    ['with no files', records((record) => ({ ...record, files: [] }))],
    ['with a file no part holds', records((record) => ({ ...record, files: ['erevos.lock'] }))],
    ['with all its files not held', records((record) => ({ ...record, out: (record.files as string[]).map((_, i) => i) }))],
    ['with a file not held that is not there', records((record) => ({ ...record, out: [(record.files as string[]).length] }))],
  ];
  for (const [what, change] of forged) await assert.rejects(openBackup(await withTable(two, 'auto-pass', change), 'auto-pass'), NotABackupError, what);

  // Of the kind an Erevos from before restores, naming parts of another backup: what it says of
  // them is not heeded, as that Erevos does not heed it, so each would have to be its own, and is
  // not. The phone stays as it was.
  const downgraded = await openBackup(await withTable(two, 'auto-pass', (table) => table, 5), 'auto-pass');
  assert.equal(downgraded.parts!.made, null);
  wipe();
  await phone();
  const was = snapshot();
  await assert.rejects(restoreBackup(downgraded, fromShelf), DamagedPartError);
  assert.deepEqual(snapshot(), was);
});

test('of a folder of automatic backups only the parts none of the newest names go, and none while one of them is not known', () => {
  const at = (day: number) => `erevos-backup-2026-11-0${day}-0312`;
  const main = (day: number) => backupFileName(at(day));
  const part = (day: number, n: number) => partFileName(at(day), n);
  const names = ['notes.txt', main(1), part(1, 1), part(1, 2), part(2, 1), main(3), part(3, 1), main(4), main(5), part(5, 1), part(6, 1)];
  // The third names a part of the first again, the fourth only that one, the fifth one of the
  // third's; the second never ended, and the sixth is being made.
  const named = new Map([
    [main(1), [part(1, 1), part(1, 2)]],
    [main(3), [part(1, 1), part(3, 1)]],
    [main(4), [part(1, 1)]],
    [main(5), [part(3, 1), part(5, 1)]],
  ]);
  const of = (name: string) => named.get(name) ?? null;
  const sorted = (list: string[]) => [...list].sort();
  assert.deepEqual(sorted(unneededFiles(names, 3, of)), sorted([main(1), part(1, 2), part(2, 1)]));
  assert.deepEqual(sorted(unneededFiles(names, 1, of)), sorted([main(1), main(3), main(4), part(1, 1), part(1, 2), part(2, 1)]));
  assert.deepEqual(sorted(unneededFiles(names, 9, of)), [part(2, 1)]);
  assert.deepEqual(unneededFiles(names, 0, of), []);
  assert.deepEqual(unneededFiles([part(1, 1), 'notes.txt'], 3, of), []);
  // One of the newest not known, as one made by hand or with another password: it may name any
  // part there, so only the older backups' own files go.
  assert.deepEqual(unneededFiles(names, 3, (name) => (name === main(4) ? null : of(name))), [main(1)]);
  assert.deepEqual(unneededFiles(names, 1, (name) => (name === main(5) ? null : of(name))), [main(1), main(3), main(4)]);
  // Of backups that each name only their own parts, the same as staleBackups.
  const whole = [main(1), part(1, 1), part(2, 1), main(3), part(3, 1), part(3, 2), main(4), main(5), part(5, 1), part(6, 1), 'notes.txt'];
  const own = (name: string) => whole.filter((other) => backupFileOf(other)?.part && backupFileOf(other)!.stem === backupFileOf(name)!.stem);
  for (const keep of [0, 1, 2, 3, 9]) assert.deepEqual(sorted(unneededFiles(whole, keep, own)), sorted(staleBackups(whole, keep)), `keep ${keep}`);
});

t('made every 6 hours for days as photos come and go, with backups by hand, a new password and the ledger lost between: the folder and the server keep the newest backups and every part they name, and each restores as the phone was then', async () => {
  const there = new Map<string, Uint8Array>();
  setCloudHttp(async (method, url, headers, body) => davServer(there, () => 'app-pass')(method, url, headers, body));
  const uri = 'content://com.android.externalstorage.documents/tree/primary%3AErevos';
  folders.set(uri, new Map());
  const folder = folders.get(uri)!;
  const server = cloudServer('https://cloud.example/dav/Backups', 'me', 'app-pass');
  try {
    await phone();
    const random = seeded(2026);
    // Of half a MB to one and a half: two to seven in a part.
    const photo = () => addPhoto(Math.floor((0.5 + random()) * 1024 * 1024));
    for (let i = 0; i < 8; i++) photo();
    // Each part's SHA-256, worked out once: the bytes there are never written again.
    const shas = new WeakMap<Uint8Array, string>();
    const shaOf = (bytes: Uint8Array) => {
      if (!shas.has(bytes)) shas.set(bytes, toHex(sha256Bytes(bytes)));
      return shas.get(bytes);
    };
    const HOURS = 6 * 3600 * 1000;
    const start = new Date(2026, 5, 1, 3, 12).getTime();
    let password = 'auto-pass';
    await startAutoBackup(0.25, uri, await backupKey(password));
    await startCloudBackup('https://cloud.example/dav/Backups', 'me', 'app-pass');
    const hand = await backupKey('hand-pass');

    // Each backup, in the folder by its file's name and on the server by its own: its password,
    // what the phone held when it was made, and once opened, what it is.
    const backups = new Map<string, { password: string; held: Map<string, Uint8Array>; opened?: Backup }>();
    const opened = async (name: string, bytes: Uint8Array) => {
      const backup = backups.get(name)!;
      backup.opened ??= await openBackup(bytes, backup.password);
      return backup.opened;
    };
    // Those automatic backups know now, by their ledger.
    const known = new Set<string>();
    let strict = 0;
    let loose = 0;
    let serverStrict = 0;

    // The newest backups there, each with every part it names, of the bytes it was made with; and
    // nothing else when automatic backups know them all.
    const checkFolder = async (made: number) => {
      const mains = [...folder.keys()].filter((name) => backupFileOf(name)?.part === false).sort();
      assert.equal(mains.length, Math.min(KEEP, made));
      const needed = new Set(mains);
      for (const name of mains) {
        const { parts } = await opened(name, folder.get(name)!);
        for (const [n, part] of parts!.names.entries()) {
          assert.ok(folder.has(part), `${name} names ${part}`);
          const record = parts!.made?.[n];
          if (record) assert.equal(shaOf(folder.get(part)!), record.sha, part);
          needed.add(part);
        }
      }
      if (mains.every((name) => known.has(name))) {
        assert.deepEqual([...folder.keys()].sort(), [...needed].sort());
        strict++;
      } else {
        assert.ok([...folder.keys()].every((name) => needed.has(name) || backupFileOf(name)?.part), 'besides, only parts');
        loose++;
      }
      return mains;
    };
    // The same on the server: all of one size there but the backups, under random names; nothing
    // else when automatic backups know every one kept that names parts of others.
    const checkServer = async (cloud: CloudBackup, made: number) => {
      assert.equal(cloud.names.length, Math.min(KEEP, made));
      const needed = new Set(cloud.names);
      for (const name of cloud.names) {
        assert.ok(there.has(name), name);
        assert.notEqual(there.get(name)!.length % BARE_PART, 0);
        const { parts } = await opened(name, there.get(name)!);
        for (const [n, part] of parts!.names.entries()) {
          assert.ok(there.has(part), `${name} names ${part}`);
          const record = parts!.made?.[n];
          if (record) assert.equal(shaOf(there.get(part)!), record.sha, part);
          needed.add(part);
        }
      }
      for (const [name, bytes] of there) {
        assert.match(name, /^[0-9a-f]{24}$/);
        if (!cloud.names.includes(name)) assert.equal(bytes.length % BARE_PART, 0, name);
      }
      if (cloud.names.every((name) => !cloud.parts[name]?.shared || known.has(name))) {
        assert.deepEqual([...there.keys()].sort(), [...needed].sort());
        serverStrict++;
      }
    };
    // Restored on another phone, with a photo of its own: as the phone was when it was made.
    const restores = async (name: string, bytes: Uint8Array, read: PartReader) =>
      assert.deepEqual(await elsewhere(await opened(name, bytes), read, [[`erevos-file-${'f'.repeat(32)}-0`, new Uint8Array([7])]]), backups.get(name)!.held, name);

    let made = 0;
    let wrote = 0;
    let named = 0;
    let cloud: CloudBackup | null = null;
    for (let run = 0; run < 13; run++) {
      const at = start + run * HOURS;
      // What changed on the phone since; nothing before the second.
      if (run !== 1) {
        if (random() < 0.6) photo();
        const photos = [...blobs.keys()].filter((name) => name.startsWith('erevos-file-'));
        if (random() < 0.4 && photos.length > 3) blobs.delete(photos[Math.floor(random() * photos.length)]);
        const again = photos[Math.floor(random() * photos.length)];
        if (random() < 0.3 && blobs.has(again)) blobs.set(again, blobs.get(again)!.slice());
      }
      if (run === 5) await saveClip(randomBytes(3000), 2000);
      // A new password: the ledger, sealed with a key the one before gave, opens as empty.
      if (run === 6) {
        password = 'auto-pass-2';
        await startAutoBackup(0.25, uri, await backupKey(password));
        known.clear();
      }
      // The ledger lost, as when Erevos's own files were cleared.
      if (run === 9) {
        blobs.delete('erevos-backup-ledger');
        known.clear();
      }
      const inFolder = new Set(folder.keys());
      const onServer = new Set(there.keys());
      const ran = await runAutoBackup(false, at);
      assert.equal(ran.auto?.error, '', `run ${run}`);
      assert.equal(ran.cloud?.error, '', `run ${run}`);
      cloud = ran.cloud!;
      made++;
      const main = [...folder.keys()].find((name) => !inFolder.has(name) && backupFileOf(name)?.part === false)!;
      const sent = cloud.names.at(-1)!;
      for (const name of [main, sent]) {
        backups.set(name, { password, held: media() });
        known.add(name);
      }
      const newParts = [...folder.keys()].filter((name) => !inFolder.has(name) && name !== main);
      wrote += newParts.length;
      named += (await opened(main, folder.get(main)!)).parts!.names.length;
      // Nothing changed: no part is made, in the folder or on the server.
      if (run === 1) {
        assert.deepEqual(newParts, []);
        assert.deepEqual([...there.keys()].filter((name) => !onServer.has(name)), [sent]);
        assert.deepEqual(cloud.parts[sent], { seed: cloud.parts[sent].seed, count: 0, shared: true });
      }
      const mains = await checkFolder(made);
      await checkServer(cloud, made);
      // The oldest kept of each, which names the oldest parts there.
      await restores(mains[0], folder.get(mains[0])!, (await partsIn(uri)).read);
      await restores(cloud.names[0], there.get(cloud.names[0])!, (await cloudParts(server)).read);
      // Not due again until 6 hours went by.
      const left = [...folder.keys(), ...there.keys()];
      const idle = await runAutoBackup(false, at + HOURS - 60_000);
      assert.equal(idle.auto?.last, at);
      assert.deepEqual([...folder.keys(), ...there.keys()], left);

      // A backup by hand into the same folder and to the same server, with a password of its own,
      // as the backup screen makes them.
      if (run === 3) {
        const written = await writeBackup(uri, (parts) => makeBackup(hand, { parts }), at + 3600_000);
        backups.set(written.name, { password: 'hand-pass', held: media() });
        cloud = await sendToCloud(cloud, (parts) => makeBackup(hand, { parts, bare: true }), KEEP, at + 3600_000);
        assert.equal(cloud.error, '');
        backups.set(cloud.names.at(-1)!, { password: 'hand-pass', held: media() });
        made++;
      }
    }
    // Both ways the folder was looked at came up; on the server, where one sent by hand names only
    // its own parts, nothing else was there more often. At the end automatic backups know every one there.
    assert.ok(strict > 0 && loose > 0 && serverStrict > strict, `${strict} ${loose} ${serverStrict}`);
    const mains = await checkFolder(made);
    assert.ok(mains.every((name) => known.has(name)));
    for (const name of mains) await restores(name, folder.get(name)!, (await partsIn(uri)).read);
    for (const name of cloud!.names) await restores(name, there.get(name)!, (await cloudParts(server)).read);
    // And they wrote far fewer parts than they named.
    assert.ok(wrote * 2 < named, `${wrote} of ${named}`);  } finally {
    setCloudHttp(null);
    await stopCloudBackup();
    folders.clear();
  }
});

t('a part deleted or cut short in the folder or on the server is not named again: its files go in a new one', async () => {
  const there = new Map<string, Uint8Array>();
  setCloudHttp(async (method, url, headers, body) => davServer(there, () => 'app-pass')(method, url, headers, body));
  const uri = 'content://com.android.externalstorage.documents/tree/primary%3AErevos';
  folders.set(uri, new Map());
  const folder = folders.get(uri)!;
  const server = cloudServer('https://cloud.example/dav/Backups', 'me', 'app-pass');
  try {
    await phone();
    photos(5);
    const held = media();
    const DAY = 86_400_000;
    const start = new Date(2026, 5, 1, 3, 12).getTime();
    await startAutoBackup(1, uri, await backupKey('auto-pass'));
    await startCloudBackup('https://cloud.example/dav/Backups', 'me', 'app-pass');
    const first = (await runAutoBackup(false, start)).cloud!;
    const [one, two] = [1, 2].map((n) => partFileName('erevos-backup-2026-06-01-0312', n));
    const [sentOne, sentTwo] = [0, 1].map((n) => partName(first.parts[first.names[0]].seed, n));
    assert.ok(folder.has(one) && folder.has(two) && there.has(sentOne) && there.has(sentTwo));
    folder.set(one, folder.get(one)!.subarray(0, 100));
    there.set(sentOne, there.get(sentOne)!.subarray(0, 100));
    const newest = async (day: number, cloud: CloudBackup) => {
      const name = `erevos-backup-2026-06-0${day}-0312.erevos`;
      const names = (await openBackup(folder.get(name)!, 'auto-pass')).parts!.names;
      const sent = (await openBackup(there.get(cloud.names.at(-1)!)!, 'auto-pass')).parts!.names;
      assert.deepEqual(await elsewhere(await openBackup(folder.get(name)!, 'auto-pass'), (await partsIn(uri)).read), held);
      assert.deepEqual(await elsewhere(await openBackup(there.get(cloud.names.at(-1)!)!, 'auto-pass'), (await cloudParts(server)).read), held);
      return [names, sent];
    };
    let [names, sent] = await newest(2, (await runAutoBackup(false, start + DAY)).cloud!);
    assert.ok(!names.includes(one) && names.includes(two));
    assert.ok(!sent.includes(sentOne) && sent.includes(sentTwo));
    folder.delete(two);
    there.delete(sentTwo);
    [names, sent] = await newest(3, (await runAutoBackup(false, start + 2 * DAY)).cloud!);
    assert.ok(!names.includes(one) && !names.includes(two));
    assert.ok(!sent.includes(sentOne) && !sent.includes(sentTwo));
  } finally {
    setCloudHttp(null);
    await stopCloudBackup();
    folders.clear();
  }
});

t('a backup the check after it does not find whole counts as failed: it says why, waits an hour, then makes again what is missing', async () => {
  const uri = 'content://com.android.externalstorage.documents/tree/primary%3AErevos';
  folders.set(uri, new Map());
  const folder = folders.get(uri)!;
  // The folder keeps only the start of the first part written into it, once.
  const set = folder.set.bind(folder);
  let cut = true;
  folder.set = (name: string, bytes: Uint8Array) => {
    if (cut && /\.part1\./.test(name)) {
      cut = false;
      return set(name, bytes.subarray(0, 100));
    }
    return set(name, bytes);
  };
  try {
    await phone();
    photos(2);
    const HOUR = 3600_000;
    const start = new Date(2026, 5, 1, 3, 12).getTime();
    await startAutoBackup(0.25, uri, await backupKey('auto-pass'));
    const looks = (at: number) => runAutoBackup(false, at, { checking: true });
    const failed = await looks(start);
    assert.match(failed.auto!.error, /1 damaged/);
    assert.equal(failed.auto!.last, 0);
    const checked = (await loadChecks()).folder!;
    assert.deepEqual([checked.damaged, checkedWhole(checked)], [1, false]);
    // The looks between leave it for an hour, as after any that failed.
    assert.match((await looks(start + HOUR - 1000)).auto!.error, /1 damaged/);
    const again = await looks(start + HOUR);
    assert.equal(again.auto!.error, '');
    assert.equal(again.auto!.last, start + HOUR);
    assert.ok(checkedWhole((await loadChecks()).folder!));
  } finally {
    folders.delete(uri);
  }
});

t('every 6 hours: Erevos looks every 15 minutes while a space is open and as it goes to the background, and one that failed is tried again by those looks only after an hour', async () => {
  const uri = 'content://com.android.externalstorage.documents/tree/primary%3AErevos';
  folders.set(uri, new Map());
  const folder = folders.get(uri)!;
  try {
    await phone();
    photos(2);
    const HOUR = 3600_000;
    const start = new Date(2026, 5, 1, 3, 12).getTime();
    await startAutoBackup(0.25, uri, await backupKey('auto-pass'));
    const mains = () => [...folder.keys()].filter((name) => backupFileOf(name)?.part === false).length;
    const looks = (at: number) => runAutoBackup(false, at, { checking: true });
    assert.equal((await looks(start)).auto?.last, start);
    assert.equal((await looks(start + 6 * HOUR - 1000)).auto?.last, start);
    assert.equal(mains(), 1);
    assert.equal((await looks(start + 6 * HOUR)).auto?.last, start + 6 * HOUR);
    assert.equal(mains(), 2);

    // The folder gone: it says so, and the looks between leave it for an hour.
    folders.delete(uri);
    const failedAt = start + 12 * HOUR;
    assert.match((await looks(failedAt)).auto!.error, /not there/);
    folders.set(uri, folder);
    const waited = await looks(failedAt + HOUR - 1000);
    assert.equal(waited.auto?.last, start + 6 * HOUR);
    assert.match(waited.auto!.error, /not there/);
    assert.equal(mains(), 2);
    assert.equal((await looks(failedAt + HOUR)).auto?.last, failedAt + HOUR);
    assert.equal(mains(), 3);
    // When a space opens, it is tried again at once.
    folders.delete(uri);
    assert.match((await looks(failedAt + 7 * HOUR)).auto!.error, /not there/);
    folders.set(uri, folder);
    assert.equal((await runAutoBackup(false, failedAt + 7 * HOUR + 1000)).auto?.last, failedAt + 7 * HOUR + 1000);

    // As the app looks, now.
    await startAutoBackup(0.25, uri, await backupKey('auto-pass'));
    const now = (await checkAutoBackup()).auto!.last;
    assert.ok(Math.abs(now - Date.now()) < 60_000);
    assert.equal((await checkAutoBackup()).auto?.last, now);
    assert.equal(CHECK_MS, 15 * 60_000);
  } finally {
    folders.clear();
  }
  // The app looks while a space is open, every CHECK_MS, and as it goes to the background, while
  // the space is still open; never in a task in the background.
  const layout = readFileSync(join(import.meta.dirname, '../app/_layout.tsx'), 'utf8');
  assert.match(layout, /if \(!spaceOpen\) return;\n\s+const timer = setInterval\(\(\) => void awakeWhile\(checkAutoBackup\(\)\)\.catch\(\(\) => undefined\), BACKUP_CHECK_MS\);/);
  assert.match(layout, /backgroundAt\.current = awayClock\(\);[\s\S]{0,300}if \(current\.kind === 'open'\) void checkAutoBackup\(\)/);
  assert.doesNotMatch(readFileSync(join(import.meta.dirname, '../lib/background.ts'), 'utf8'), /backup/i);
});

t('the ledger of what automatic backups made is sealed, opens only with their key, stays with the phone, and a backup there with a part it does not know is not known', async () => {
  await phone();
  const key = randomBytes(32);
  const part = (name: string, n: number): PartMade => ({ name, size: 1000 + n, sha: 'ab'.repeat(32), id: 'cd'.repeat(16), n, files: [`erevos-file-${'e'.repeat(32)}-${n}`], out: [], stamps: [`3:${n}`] });
  const first = part('erevos-backup-2026-06-01-0312.part1.erevos', 0);
  const ledger: Ledger = new Map([
    [
      folderPlace('content://here'),
      new Map([
        ['erevos-backup-2026-06-01-0312.erevos', [first]],
        ['erevos-backup-2026-06-02-0312.erevos', [first, part('erevos-backup-2026-06-02-0312.part1.erevos', 1)]],
      ]),
    ],
    [serverPlace('https://cloud.example/dav/Backups/'), new Map([['0123456789abcdef01234567', []]])],
  ]);
  await saveLedger(key, ledger);
  assert.deepEqual(await loadLedger(key), ledger);
  // Sealed: no name, place or stamp in it shows.
  assert.doesNotMatch(Buffer.from(blobs.get('erevos-backup-ledger')!).toString('latin1'), /erevos|content|cloud|abab/);
  // With another key, as once their password changed, or damaged, it is empty.
  assert.deepEqual(await loadLedger(randomBytes(32)), new Map());
  blobs.set('erevos-backup-ledger', flipped(blobs.get('erevos-backup-ledger')!));
  assert.deepEqual(await loadLedger(key), new Map());
  // A backup naming a part it does not know, or one not as Erevos keeps it, is not known.
  const sealedWith = sha256Bytes(new Uint8Array([...utf8Encode('erevos backup ledger 1\n'), ...key]));
  const one = { sha: 'ab', id: 'cd', n: 0, size: 5, files: ['f'], stamps: ['s'] };
  const places = { 'folder x': { parts: { a: one, b: { ...one, stamps: [] } }, backups: { first: ['a'], second: ['a', 'b'], third: ['a', 'c'] } } };
  blobs.set('erevos-backup-ledger', encryptBytes(sealedWith, utf8Encode(JSON.stringify({ places }))));
  assert.deepEqual([...(await loadLedger(key)).get('folder x')!.keys()], ['first']);

  // In no backup, and a restore leaves it as it is.
  await saveLedger(key, ledger);
  const kept = blobs.get('erevos-backup-ledger');
  const opened = await openBackup(await backUp(await backupKey('backup-pass')), 'backup-pass');
  assert.ok(!opened.entries.some((entry) => entry.name.includes('ledger')));
  await restoreBackup(opened, fromShelf);
  assert.equal(blobs.get('erevos-backup-ledger'), kept);
});

t('the parts a server keeps for the backups that name them are kept as runs of their numbers, and only as Erevos writes them', async () => {
  assert.equal(runsText([0, 1, 2, 3, 4, 7, 9, 10, 11, 12]), '0-4,7,9-12');
  assert.equal(runsText([5, 3, 4, 4]), '3-5');
  assert.equal(runsText([]), '');
  assert.deepEqual(runsOf('0-4,7,9-12'), [0, 1, 2, 3, 4, 7, 9, 10, 11, 12]);
  assert.deepEqual(runsOf(''), []);
  assert.deepEqual(runsOf('0-4', 5), [0, 1, 2, 3, 4]);
  for (const bad of ['4-2', 'a', '1,,2', '-1', '1-', '0-1000000', ' 1', '1.5', '0-9,']) assert.equal(runsOf(bad), null, bad);
  assert.equal(runsOf('0-9', 5), null);
  const seed = 'ab'.repeat(16);
  store.set(
    'erevos.backup-cloud',
    JSON.stringify({
      url: 'https://cloud.example/dav/Backups/',
      user: 'me',
      password: 'pw',
      names: ['0123456789abcdef'],
      parts: { '0123456789abcdef': { seed, count: 0, shared: true } },
      held: [{ seed: 'cd'.repeat(16), left: '0-2,5' }, { seed: 'ef'.repeat(16), left: '3-1' }, { seed: 'nope', left: '1' }, { seed: 'cd'.repeat(16), left: '' }],
      unfinished: [],
      last: 7,
      error: '',
    }),
  );
  const cloud = await loadCloudBackup();
  assert.deepEqual(cloud?.held, [{ seed: 'cd'.repeat(16), left: '0-2,5' }]);
  assert.deepEqual(cloud?.parts['0123456789abcdef'], { seed, count: 0, shared: true });
});

t("the desktop app's shell tells each of the app's files' size and when it was written, for automatic backups to name again the parts of those as they were", async () => {
  const shell = readFileSync(join(import.meta.dirname, '../../desktop/main.js'), 'utf8');
  const fileName = /^const fileName = .*;$/m.exec(shell)![0];
  const filesOf = /^function files\(prefix, stamps\) \{\n[\s\S]*?\n\}$/m.exec(shell)![0];
  const where = mkdtempSync(join(tmpdir(), 'erevos-files-'));
  try {
    const at = (name: string) => join(where, 'files', name);
    nodeFs.mkdirSync(join(where, 'files'));
    writeFileSync(at('erevos-file-aa-0'), new Uint8Array(3));
    writeFileSync(at('erevos-voice-bb'), new Uint8Array(5));
    writeFileSync(at('notes.txt'), 'mine');
    utimesSync(at('erevos-file-aa-0'), 1_700_000_000, 1_700_000_000.25);
    const listed = new Function('fs', 'dataPath', `${fileName}\n${filesOf}\nreturn files;`)(nodeFs, (...parts: string[]) => join(where, ...parts)) as (prefix: string | null, stamps: boolean) => Response;
    assert.deepEqual(((await listed('erevos-', false).json()) as string[]).sort(), ['erevos-file-aa-0', 'erevos-voice-bb']);
    assert.deepEqual(await listed('erevos-file-', true).json(), { 'erevos-file-aa-0': '3:1700000000250' });
    // Written again, it is told otherwise.
    writeFileSync(at('erevos-file-aa-0'), new Uint8Array(3));
    assert.notDeepEqual(await listed('erevos-file-', true).json(), { 'erevos-file-aa-0': '3:1700000000250' });
  } finally {
    rmSync(where, { recursive: true, force: true });
  }
  assert.match(shell, /if \(url\.pathname === '\/__files'\) return files\(url\.searchParams\.get\('prefix'\), url\.searchParams\.get\('stamps'\) === '1'\);/);
});

t('a backup made by hand into a folder is checked as it is made: read back, opened with its password, every file beside it there, two read through', async () => {
  await phone();
  photos(9);
  const uri = 'content://com.android.externalstorage.documents/tree/primary%3AByHand';
  folders.set(uri, new Map());
  const key = await backupKey('hand-pass');
  const stem = 'erevos-backup-2026-11-25-0939';
  const written = await writeBackup(uri, (parts) => makeBackup(key, { parts }), new Date(2026, 10, 25, 9, 39).getTime());
  assert.equal(written.name, `${stem}.erevos`);
  assert.equal(written.parts, 3);
  const whole = await checkMadeBackup(uri, written.name, key);
  assert.ok(whole && checkedWhole(whole));
  assert.deepEqual({ ...whole, at: 0 }, { at: 0, parts: 3, read: 2, missing: 0, damaged: 0, opened: true, error: '' });
  // With another password it cannot be checked, and says why.
  const other = await checkMadeBackup(uri, written.name, await backupKey('other-pass'));
  assert.ok(other && !checkedWhole(other));
  assert.match(other.error, /password/);
  // A file beside it gone: found, and not whole.
  const folder = folders.get(uri)!;
  const second = folder.get(partFileName(stem, 2))!;
  folder.delete(partFileName(stem, 2));
  const missing = await checkMadeBackup(uri, written.name, key);
  assert.equal(missing?.missing, 1);
  assert.equal(missing && checkedWhole(missing), false);
  folder.set(partFileName(stem, 2), second);
  // Each changed where it lies, of the same size: the two read through find it.
  for (const n of [1, 2, 3]) {
    const bytes = folder.get(partFileName(stem, n))!.slice();
    bytes[100] ^= 1;
    folder.set(partFileName(stem, n), bytes);
  }
  const damaged = await checkMadeBackup(uri, written.name, key);
  assert.equal(damaged?.damaged, 2);
  assert.equal(damaged && checkedWhole(damaged), false);
  // The backup itself gone: said so.
  folder.delete(written.name);
  assert.match((await checkMadeBackup(uri, written.name, key))?.error ?? '', /not there/);
});

t('a backup sent to the server by hand is checked there by what the server lists, of its size and every part', async () => {
  const there = new Map<string, Uint8Array>();
  setCloudHttp(async (method, url, headers, body) => davServer(there, () => 'app-pass')(method, url, headers, body));
  try {
    await phone();
    photos(5);
    const cloud = await startCloudBackup('https://cloud.example/dav/Backups', 'me', 'app-pass');
    const key = await backupKey('hand-pass');
    let size = 0;
    let named: PartMade[] = [];
    const sent = await sendToCloud(
      cloud,
      async (parts) => {
        const bytes = await makeBackup(key, { parts, bare: true, made: (list) => (named = list) });
        size = bytes.length;
        return bytes;
      },
      KEEP,
    );
    assert.equal(sent.error, '');
    assert.equal(named.length, 2);
    const whole = await checkSentBackup(sent, named, size);
    assert.ok(whole && checkedWhole(whole));
    assert.equal(whole.parts, 2);
    // The total said is what the server holds of it.
    assert.equal(size + named.reduce((sum, part) => sum + part.size, 0), [...there.values()].reduce((sum, bytes) => sum + bytes.length, 0));
    // A part gone there: missing.
    const name = sent.names.at(-1)!;
    const part = there.get(named[1].name)!;
    there.delete(named[1].name);
    assert.equal((await checkSentBackup(sent, named, size))?.missing, 1);
    there.set(named[1].name, part);
    // The backup there of another size: not whole.
    there.set(name, there.get(name)!.slice(0, size - 1));
    assert.match((await checkSentBackup(sent, named, size))?.error ?? '', /not of the size/);
    // Not sent: nothing to check.
    assert.equal(await checkSentBackup({ ...sent, error: 'no network' }, named, size), null);
    // As listed, with the size given or not said there.
    assert.equal(checkListed(new Map([[name, 10]]), name, [], 0, 10).error, '');
    assert.equal(checkListed(new Map([[name, -1]]), name, [], 0, 10).error, '');
    assert.notEqual(checkListed(new Map([[name, 9]]), name, [], 0, 10).error, '');
    assert.equal(checkListed(new Map([[name, 9]]), name, [], 0).error, '');
  } finally {
    setCloudHttp(null);
    await stopCloudBackup();
  }
});

t('the server stays when automatic backups stop, and Make a backup sends one there alone with their password', async () => {
  const there = new Map<string, Uint8Array>();
  setCloudHttp(async (method, url, headers, body) => davServer(there, () => 'app-pass')(method, url, headers, body));
  const uri = 'content://com.android.externalstorage.documents/tree/primary%3AAuto';
  folders.set(uri, new Map());
  try {
    await phone();
    photos(3);
    const start = new Date(2026, 5, 1, 3, 12).getTime();
    await startAutoBackup(1, uri, await backupKey('auto-pass'));
    await startCloudBackup('https://cloud.example/dav/Backups', 'me', 'app-pass');
    await runAutoBackup(false, start);
    const inFolder = folders.get(uri)!.size;
    const onServer = (await loadCloudBackup())!.names.length;
    // To the server alone, now: nothing new in the folder, one more there, checked as listed.
    const run = await runAutoBackup(false, start + 60_000, { serverOnly: true });
    assert.equal(run.cloud?.error, '');
    assert.equal(folders.get(uri)!.size, inFolder);
    assert.equal(run.cloud?.names.length, onServer + 1);
    assert.equal(run.cloud?.last, start + 60_000);
    assert.equal(run.auto?.last, start);
    const checked = (await loadChecks()).server;
    assert.ok(checked && checkedWhole(checked));
    assert.equal(checked.at, start + 60_000);
    // Automatic backups off: the server stays, with what went there.
    await stopAutoBackup();
    assert.equal(await loadAutoBackup(), null);
    assert.equal((await loadCloudBackup())?.names.length, onServer + 1);
    assert.deepEqual(await loadChecks(), { folder: null, server: null });
  } finally {
    setCloudHttp(null);
    await stopCloudBackup();
  }
});

t('the backup screen says of a backup made by hand its size in all, when it began and ended, and what is not in it; and offers a server there', async () => {
  const screen = readFileSync(join(import.meta.dirname, '..', 'app', 'backup.tsx'), 'utf8');
  // Into a folder and to a server, side by side; the server's fields there when there is none yet.
  assert.match(screen, /: t\("Into a folder"\)/);
  assert.match(screen, /: t\("To a server \(WebDAV\)"\)/);
  assert.match(screen, /onPress=\{toServer\}/);
  assert.match(screen, /\{form === "make" \? addForm : null\}/);
  assert.match(screen, /if \(!cloud\) setForm\("make"\);\n\s+else if \(CAN_AUTO_BACKUP && auto\) void serverNow\(\);\n\s+else setAsking\(\{ kind: "cloud" \}\);/);
  // The server's card wherever backups can go to one, with automatic backups on or not.
  assert.match(screen, /\{CAN_CLOUD_BACKUP \? \(\n\s+<>\n\s+<SectionTitle title=\{t\("To a server too"\)\} \/>/);
  assert.doesNotMatch(screen, /CAN_CLOUD_BACKUP && \(auto \|\| !CAN_AUTO_BACKUP\)/);
  // The size in all, the files beside it with it; begun and done; what is not in it; then checked.
  assert.match(screen, /total: spaceText\(size \+ partsSize\)/);
  assert.match(screen, /timesText\(start, end\)/);
  assert.match(screen, /notInText\(out\)/);
  assert.match(screen, /const checked = await checkMadeBackup\(asking\.folder, name, key\);/);
  assert.match(screen, /const checked = await checkSentBackup\(sent, named, size\);/);
  assert.match(screen, /writeBackup\(\n\s+asking\.folder,[\s\S]*?\n\s+start,\n\s+\);/);
  // What the check found shows under what is said.
  assert.match(screen, /\{madeNote\?\.checked && !making \? \(\n\s+<CheckLine/);
});

t('a backup sent to the server by hand says before it starts that all of it goes each time, and about how much', async () => {
  // Its key is its own, even with the same password: no part of an earlier one can be named again.
  const [one, two] = [await backupKey('the same password', undefined, 1000, null), await backupKey('the same password', undefined, 1000, null)];
  assert.notDeepEqual(one.key, two.key);
  const screen = readFileSync(join(import.meta.dirname, '..', 'app', 'backup.tsx'), 'utf8');
  // So it is sent with no book of earlier parts, as automatic backups have (lib/backup-folder.ts).
  assert.match(screen, /const sent = await sendToCloud\(\n\s+cloud,\n\s+async \(parts\) => \{[\s\S]{0,500}?\n\s+\},\n\s+KEEP,\n\s+\);/);
  // Its password sheet says it, with about how much where the phone measures it, and how many the server keeps.
  assert.match(screen, /sheet\?\.kind === "cloud"\n\s+\? \[\n\s+byHandText\(whole\),\n\s+t\("The server keeps the \{n\} newest whole\.", \{ n: KEEP \}\),/);
  assert.match(screen, /if \(askingKind !== "cloud"\) return;[\s\S]{0,200}wholeBackupAtMost\(\)/);
  assert.match(screen, /"A backup sent by hand goes whole each time, with every photo and file: up to about \{size\} now\.",\n\s+\{ size: spaceText\(bytes\) \},/);
  // The server's card says it too where backups go there only by hand.
  assert.match(screen, /"Send a backup there now and then; the server keeps the \{n\} newest\.",[\s\S]{0,120}byHandText\(null\),/);
  // Automatic backups are pointed at only where there are any.
  assert.match(screen, /CAN_AUTO_BACKUP\n\s+\? t\("With automatic backups on, only what is new goes each time\."\)/);
});

