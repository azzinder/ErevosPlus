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
  const layout = readFileSync('app/_layout.tsx', 'utf8');
  assert.match(layout, /void tellMoveTaken\(\)/);
  // Nothing is received while a move is taken before the lock.
  assert.match(readFileSync('components/moved-out.tsx', 'utf8'), /holdReceiver\(\)\.then/);
});
