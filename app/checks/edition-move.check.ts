// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Updates and moves for the three editions (docs/editions.md): each edition's channels, repository
// and Android package, and the move.json one edition leaves for another (lib/edition-move.ts).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { MOVE_WAITS, moveFor, moveRoom, readMovedOut, readMoveNote, type MoveNote } from '../lib/move-note';
import { channelsOf, packageOf, PACKAGES, updateEditionName, updateEditionOf, wireOf } from '../lib/update-channel';
import { channelPage, channelRepo, channelUrl, LITE_RELEASES_REPO, RELEASES_REPO } from '../lib/updates';

test('each edition has its own channels, repository and package', () => {
  assert.deepEqual(channelsOf({ edition: 'lite', beta: false }), ['lite']);
  assert.deepEqual(channelsOf({ edition: 'lite', beta: true }), ['lite', 'lite-beta']);
  assert.equal(channelRepo('lite'), LITE_RELEASES_REPO);
  assert.equal(channelRepo('lite-beta'), LITE_RELEASES_REPO);
  assert.equal(channelRepo('plus-beta'), RELEASES_REPO);
  assert.equal(channelUrl('lite'), `https://github.com/${LITE_RELEASES_REPO}/releases/latest/download/version.json`);
  assert.equal(channelUrl('lite-beta'), `https://github.com/${LITE_RELEASES_REPO}/releases/download/channel-beta/version.json`);
  assert.equal(channelUrl('plus'), `https://github.com/${RELEASES_REPO}/releases/download/channel-erevos-plus/version.json`);
  // Erevos+ 3.1 and on go where the Erevos+ 7.x apps (app.erevos) never look: under plus, only the bridge.
  assert.equal(wireOf('plus'), 'erevos-plus');
  assert.equal(wireOf('plus-beta'), 'erevos-plus-beta');
  assert.equal(wireOf('erevos-beta'), 'erevos-beta');
  assert.equal(channelUrl('erevos-beta'), `https://github.com/${RELEASES_REPO}/releases/download/channel-erevos-beta/version.json`);
  assert.equal(channelPage('lite-beta'), `https://github.com/${LITE_RELEASES_REPO}/releases/tag/channel-beta`);
  assert.equal(updateEditionOf('lite'), 'erevos');
  assert.equal(updateEditionOf('plus'), 'plus');
  assert.equal(updateEditionName('lite'), 'Erevos Lite');
  assert.equal(updateEditionName('erevos'), 'Erevos');
  // Erevos+ was app.erevos until 3.1.0; what version.json names wins, when it is one of the three.
  assert.equal(packageOf('plus', '7.3.0-rc.2'), 'app.erevos');
  assert.equal(packageOf('plus', '3.1.0-beta.1'), 'app.erevos.plus');
  assert.equal(packageOf('lite', '3.2.0-beta.1'), 'app.erevos.lite');
  assert.equal(packageOf('erevos', '3.0.0', 'app.erevos.plus'), 'app.erevos.plus');
  assert.equal(packageOf('erevos', '3.0.0', 'com.other'), 'app.erevos');
  assert.equal(new Set(Object.values(PACKAGES)).size, 3);
});

test("the Android side knows the same packages, and the app's config gives each edition its own", () => {
  const kt = readFileSync('modules/erevos-device/android/src/main/java/expo/modules/erevosdevice/Move.kt', 'utf8');
  for (const pkg of Object.values(PACKAGES)) assert.ok(kt.includes(`"${pkg}"`), pkg);
  const manifest = readFileSync('modules/erevos-device/android/src/main/AndroidManifest.xml', 'utf8');
  assert.match(manifest, /android:authorities="\$\{applicationId\}\.move"/);
  // Answered only to an app signed as this one: checked in code, with no permission of our own.
  assert.match(kt, /checkSignatures\(caller, Process\.myUid\(\)\)/);
  assert.doesNotMatch(manifest, /<permission /);
});

test('a move note is read only whole, for another edition, and within a day', () => {
  const now = 1_800_000_000_000;
  const good = { v: 1, from: 'erevos', to: 'plus', made: now - 1000, backup: 'move.erevos', parts: ['move-part-1.erevos'], password: 'ab'.repeat(32) };
  const read = (over: Record<string, unknown> = {}) => readMoveNote(JSON.stringify({ ...good, ...over }), now);
  assert.deepEqual(read(), good);
  assert.equal(readMoveNote('not json', now), null);
  assert.equal(readMoveNote('null', now), null);
  assert.equal(read({ v: 2 }), null);
  assert.equal(read({ from: 'erevos', to: 'erevos' }), null);
  assert.equal(read({ from: 'lite', to: 'lite' }), null);
  assert.equal(read({ to: 'other' }), null);
  assert.equal(read({ made: now - MOVE_WAITS }), null);
  assert.equal(read({ made: now + 120_000 }), null);
  // Names only of the move's own files: no paths.
  assert.equal(read({ backup: '../files/x.erevos' }), null);
  assert.equal(read({ parts: ['move-part-1.erevos', '../lock.db'] }), null);
  assert.equal(read({ password: 'short' }), null);
  assert.equal(read({ password: 'AB'.repeat(32) }), null);
  // Its size, when told, is a whole number of bytes.
  assert.equal(read({ size: 1234 })?.size, 1234);
  assert.equal(read({ size: -1 }), null);
  assert.equal(read({ size: '9' }), null);
  // What the engines carry beside it, likewise.
  assert.equal(read({ net: 4096 })?.net, 4096);
  assert.equal(read()?.net, undefined);
  assert.equal(read({ net: 1.5 }), null);
  assert.equal(read({ net: -1 }), null);
});

test("Erevos+'s networks go with a move, signed in, and only to where the same is carried", () => {
  const net = readFileSync('modules/erevos-device/android/src/main/java/expo/modules/erevosdevice/MoveNet.kt', 'utf8');
  // Streamed only once moved out, from a process in which no engine ran; and whole, or not at all.
  assert.match(net, /moved-out\.json/);
  assert.match(net, /processStarted\(\) <= moved\.lastModified\(\)/);
  assert.match(net, /fd\.checkError\(\)/);
  assert.match(net, /if \(!ended\) throw IOException/);
  assert.match(net, /Not carried here/);
  const provider = readFileSync('modules/erevos-device/android/src/main/java/expo/modules/erevosdevice/Move.kt', 'utf8');
  assert.ok(provider.indexOf('if (!allowed()') < provider.indexOf('MoveNet.open('));
  // Each engine says what it carries; the Keystore-sealed keys go opened and are sealed again there.
  const messenger = readFileSync('modules/erevos-messenger/android/src/full/AndroidManifest.xml', 'utf8');
  for (const carry of ['files:messenger', 'files:signal', 'sealed:erevos.messenger.chatlock.wrap:files:signal/db.key', 'files:session', 'sealed:erevos.messenger.chatlock.wrap:files:session/data.key']) assert.ok(messenger.includes(carry), carry);
  assert.match(readFileSync('modules/erevos-telegram/android/src/full/AndroidManifest.xml', 'utf8'), /nobackup:telegram\/\*\/db/);
  // No engine opens while moved out or while a move's carry waits, and each says it opened.
  for (const file of ['modules/erevos-messenger/android/src/full/java/expo/modules/erevosmessenger/ErevosMessengerModule.kt', 'modules/erevos-telegram/android/src/full/java/expo/modules/erevostelegram/Tdlib.kt']) {
    const code = readFileSync(file, 'utf8');
    assert.match(code, /move-net-in\/ready/, file);
    assert.match(code, /System\.setProperty\("erevos\.move\.engine-open", "1"\)/, file);
  }
  const move = readFileSync('lib/edition-move.ts', 'utf8');
  // Taken before the restore changes anything; dropped should the restore fail; Matrix goes on as the same device.
  assert.ok(move.indexOf('moveTakeNet(') < move.indexOf('beforeRestore()'));
  assert.match(move, /if \(taking\) device\?\.moveDropNet\?\.\(\)/);
  assert.ok(move.indexOf('markMove()') > move.indexOf('afterRestore('));
  assert.match(readFileSync('lib/matrix-store.ts', 'utf8'), /!\(await restoreWasMove\(restore\)\)/);
});

test('the app moved from knows it moved, and a move needs room', () => {
  assert.deepEqual(readMovedOut(JSON.stringify({ to: 'plus', made: 5 })), { to: 'plus', made: 5 });
  assert.equal(readMovedOut(JSON.stringify({ to: 'other', made: 5 })), null);
  assert.equal(readMovedOut('nope'), null);
  assert.ok(moveRoom(1000) > 1000);
  assert.ok(moveRoom(1_000_000_000) >= 1_200_000_000);
});

test('an app that moved out opens no space, receives nothing, and says so', () => {
  const layout = readFileSync('app/_layout.tsx', 'utf8');
  const start = layout.slice(layout.indexOf('const start = useCallback'), layout.indexOf('const setupDone'));
  // Asked before any space opens, and before the lock.
  assert.ok(start.indexOf('movedOut()') > 0 && start.indexOf('movedOut()') < start.indexOf('loadLockConfig()'));
  assert.ok(start.indexOf('waitingMove()') < start.indexOf('openSpace('));
  const background = readFileSync('lib/background.ts', 'utf8');
  assert.match(background, /if \(movedOut\(\)\)/);
});

test('a phone nearby is asked to bring the messages only when this phone has no internet (issue #22)', async () => {
  const { needsBridge } = await import('../lib/bridge');
  const { RelayError, RelayUnreachableError } = await import('../lib/relay');
  const unreachable = new RelayUnreachableError('out of reach');
  assert.equal(needsBridge(unreachable, false), true);
  assert.equal(needsBridge(unreachable, undefined), true);
  // Online as Android says: the relay is only out of reach for now, and no phone nearby learns the queue.
  assert.equal(needsBridge(unreachable, true), false);
  // The relay answered: its queue full, or a failure of its own.
  assert.equal(needsBridge(new RelayError('full', 2), false), false);
  assert.equal(needsBridge(null, false), false);
});

test("Erevos+'s bridge (app.erevos) moves to app.erevos.plus, end to end, and nothing else moves to itself", () => {
  const now = 1_800_000_000_000;
  const note = (from: string, to: string, roles?: unknown) =>
    readMoveNote(JSON.stringify({ v: 1, from, to, made: now - 1000, backup: 'move.erevos', parts: [], password: 'ab'.repeat(32), ...(roles !== undefined ? { roles } : {}) }), now);
  // The bridge is edition plus with the package app.erevos: its move.json says plus to plus.
  const bridge = note('plus', 'plus') as MoveNote;
  assert.ok(bridge, 'the bridge reads its own move (else clearStaleMove deletes it)');
  assert.equal(moveFor(bridge, 'app.erevos', 'plus', 'app.erevos.plus'), true);
  // Not from app.erevos.plus to itself, nor to the bridge from app.erevos.plus, nor to Erevos.
  assert.equal(moveFor(bridge, 'app.erevos.plus', 'plus', 'app.erevos.plus'), false);
  assert.equal(moveFor(bridge, 'app.erevos.plus', 'plus', 'app.erevos'), false);
  assert.equal(moveFor(bridge, 'app.erevos', 'erevos', 'app.erevos.lite'), false);
  // The usual moves: from the app the note names, to this edition, never from this app.
  const toPlus = note('erevos', 'plus') as MoveNote;
  assert.equal(moveFor(toPlus, 'app.erevos', 'plus', 'app.erevos.plus'), true);
  assert.equal(moveFor(toPlus, 'app.erevos.lite', 'plus', 'app.erevos.plus'), false);
  assert.equal(moveFor(toPlus, 'app.erevos', 'lite', 'app.erevos.lite'), false);
  const toErevos = note('plus', 'erevos') as MoveNote;
  assert.equal(moveFor(toErevos, 'app.erevos.plus', 'erevos', 'app.erevos'), true);
  assert.equal(moveFor(toErevos, 'app.erevos', 'erevos', 'app.erevos'), false);
  // Whether the app moved from was the SMS and phone app goes with the move.
  assert.deepEqual(note('erevos', 'plus', { sms: true, phone: false })?.roles, { sms: true, phone: false });
  assert.equal(note('erevos', 'plus', { sms: 'yes', phone: false }), null);
  assert.equal(note('erevos', 'plus', null), null);
});

test('a move taken is told to the edition moved from at the next start, should it fail then', () => {
  const move = readFileSync('lib/edition-move.ts', 'utf8');
  assert.match(move, /if \(!\(await device!\.moveDone!\(move\.pkg\)\.catch\(\(\) => false\)\)\) keepFile\(DONE_DUE, move\.pkg\)/);
  // Told as soon as the backup restored, even with the engines' part still to go in place, so the
  // edition moved from never sees its move go stale and opens again (review Δ2).
  assert.ok(move.indexOf('moveDone!(move.pkg)') > move.indexOf('movePlaceNet!()'));
  assert.doesNotMatch(move, /!placed \|\|/);
  // What could not go in place is put there as Erevos starts, before any space opens, and Erevos says why should it not go (Δ3).
  const layout2 = readFileSync('app/_layout.tsx', 'utf8');
  assert.ok(layout2.indexOf('await placeCarried()') > 0 && layout2.indexOf('await placeCarried()') < layout2.indexOf('waitingMove()'));
  assert.match(move, /t\('Try again'\), onPress: \(\) => void placeCarried\(\)/);
  // The engines' part not taken: its own words, about the accounts Backups would leave behind (Δ3).
  assert.match(move, /throw new CarryError/);
  for (const screen of ['components/moved-out.tsx', 'app/first-steps.tsx']) assert.match(readFileSync(screen, 'utf8'), /moveErrorText\(/, screen);
  // An app moved out ends its process as its screen is left, so no engine runs on there (Δ1).
  assert.match(readFileSync('components/moved-out.tsx', 'utf8'), /if \(state === 'background'\) device\?\.endProcess\?\.\(\)/);
  // The other edition's package is downloaded and checked before anything is handed over, and this app
  // moves out before Android's installer shows, so no engine runs on while it does (Δ1).
  const updates = readFileSync('app/updates.tsx', 'utf8');
  const mv = updates.slice(updates.indexOf('async function move('), updates.indexOf('async function fromNearby'));
  assert.ok(mv.indexOf('install(release, true)') < mv.indexOf('prepareMove(') && mv.indexOf('prepareMove(') < mv.indexOf('announceMovedOut()'));
  assert.ok(mv.indexOf('announceMovedOut()') < mv.indexOf('await install(release);'));
  assert.match(readFileSync('lib/install-update.ts', 'utf8'), /if \(onlyDownload\) return;\n  await startActivityAsync/);
  const deviceKt = readFileSync('modules/erevos-device/android/src/main/java/expo/modules/erevosdevice/ErevosDeviceModule.kt', 'utf8');
  assert.match(deviceKt, /Function\("endProcess"\) \{[^}]*moved-out\.json"\)\.exists\(\)\) return@Function false/);
  const layout = readFileSync('app/_layout.tsx', 'utf8');
  assert.match(layout, /void tellMoveTaken\(\)/);
  // Nothing is received while a move is taken before the lock.
  assert.match(readFileSync('components/moved-out.tsx', 'utf8'), /holdReceiver\(\)\.then/);
});
