// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Starting by itself as the phone turns on (lib/boot-choice.ts, lib/background.ts,
// modules/erevos-call BootStart.kt, app/security.tsx): where Erevos receives in the background it
// starts unless the owner turned that off, a phone that never touched the setting starts too, and
// what the owner chose stays theirs, on this phone and in a copy. What can be held here without a
// phone: whose word counts as Erevos starts, and that the app, the phone's side and the screen
// still say the same.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { BOOT_BEFORE_KEY, BOOT_CHOICE_KEY, bootChoiceAtStart } from '../lib/boot-choice';

const ROOT = join(import.meta.dirname, '..');
const read = (...parts: string[]) => readFileSync(join(ROOT, ...parts), 'utf8');
const KOTLIN = ['modules', 'erevos-call', 'android', 'src', 'main', 'java', 'expo', 'modules', 'erevoscall'];

test('a phone that never touched the setting starts by itself, and an owner\'s choice stays', () => {
  // Nobody chose, on a new phone or one from before the choice, where the app kept 'off' by itself.
  assert.deepEqual(bootChoiceAtStart(null, null, null), { set: null, keep: null });
  assert.deepEqual(bootChoiceAtStart(null, null, 'off'), { set: null, keep: null });
  // Turned off, or on, on this phone before the choice was kept apart: it stays, and is kept.
  assert.deepEqual(bootChoiceAtStart(null, false, 'off'), { set: null, keep: 'off' });
  assert.deepEqual(bootChoiceAtStart(null, true, 'on'), { set: null, keep: 'on' });
  assert.deepEqual(bootChoiceAtStart(null, false, 'on'), { set: null, keep: 'off' });
  // Turned on in a copy from before, restored or moved here.
  assert.deepEqual(bootChoiceAtStart(null, null, 'on'), { set: true, keep: 'on' });
  // The choice kept with the settings: the phone follows it, and nothing is written again.
  assert.deepEqual(bootChoiceAtStart('off', null, 'on'), { set: false, keep: null });
  assert.deepEqual(bootChoiceAtStart('off', true, null), { set: false, keep: null });
  assert.deepEqual(bootChoiceAtStart('off', false, null), { set: null, keep: null });
  assert.deepEqual(bootChoiceAtStart('on', null, 'off'), { set: true, keep: null });
  assert.deepEqual(bootChoiceAtStart('on', false, 'off'), { set: true, keep: null });
  assert.deepEqual(bootChoiceAtStart('on', true, null), { set: null, keep: null });
  // Anything else kept there is no choice.
  assert.deepEqual(bootChoiceAtStart('yes', null, null), { set: null, keep: null });
  assert.deepEqual(bootChoiceAtStart('', false, null), { set: null, keep: 'off' });
});

test('the phone starts unless the owner chose not to, and only where Erevos receives in the background', () => {
  const kotlin = read(...KOTLIN, 'BootStart.kt');
  // A choice is the phone's only once it was made.
  assert.match(kotlin, /fun chosen\(context: Context\): Boolean\? = prefs\(context\)\.let \{ if \(it\.contains\(ON\)\) it\.getBoolean\(ON, false\) else null \}/);
  assert.match(kotlin, /fun shown\(context: Context\): Boolean = chosen\(context\) \?: true/);
  assert.match(kotlin, /fun on\(context: Context\): Boolean = shown\(context\) && prefs\(context\)\.getBoolean\(WANTED, true\)/);
  // The owner's choice and whether Erevos receives in the background are kept apart: neither writes the other.
  assert.match(kotlin, /fun set\(context: Context, on: Boolean\) \{\s+prefs\(context\)\.edit\(\)\.putBoolean\(ON, on\)\.apply\(\)\s+\}/);
  assert.match(kotlin, /fun want\(context: Context, wanted: Boolean\) \{\s+prefs\(context\)\.edit\(\)\.putBoolean\(WANTED, wanted\)\.apply\(\)\s+\}/);
  // As the phone turns on, and after an update, by that alone.
  const receiver = kotlin.slice(kotlin.indexOf('class BootReceiver'));
  assert.match(receiver, /ACTION_BOOT_COMPLETED && intent\.action != Intent\.ACTION_MY_PACKAGE_REPLACED\) return\s+if \(!BootStart\.on\(context\)\) return\s+runCatching \{ ReceiveService\.startAtBoot\(context\) \}/);

  const module = read(...KOTLIN, 'ErevosCallModule.kt');
  assert.match(module, /Function\("bootStart"\) \{\s+context\?\.let \{ BootStart\.shown\(it\) \} \?: false/);
  assert.match(module, /Function\("bootChosen"\) \{\s+context\?\.let \{ BootStart\.chosen\(it\) \}/);
  assert.match(module, /Function\("setBootStart"\) \{ on: Boolean ->\s+context\?\.let \{ BootStart\.set\(it, on\) \}/);
  assert.match(module, /Function\("wantBootStart"\) \{ wanted: Boolean ->\s+context\?\.let \{ BootStart\.want\(it, wanted\) \}/);

  const manifest = read('modules', 'erevos-call', 'android', 'src', 'main', 'AndroidManifest.xml');
  assert.match(manifest, /android\.permission\.RECEIVE_BOOT_COMPLETED/);
  assert.match(manifest, /<receiver android:name="expo\.modules\.erevoscall\.BootReceiver"[^>]*>\s+<intent-filter>\s+<action android:name="android\.intent\.action\.BOOT_COMPLETED" \/>\s+<action android:name="android\.intent\.action\.MY_PACKAGE_REPLACED" \/>/);
});

test('the app keeps only what the owner chose, tells the phone whether it receives, and starts nothing where it does not', () => {
  const background = read('lib', 'background.ts');
  // The owner's choice: the phone's, and kept with the settings, for a build before the choice too.
  const save = background.slice(background.indexOf('export function saveBootStart('), background.indexOf('export async function syncBootStart('));
  assert.match(save, /callAudio\?\.setBootStart\?\.\(on\);/);
  assert.match(save, /secureSet\(BOOT_CHOICE_KEY, on \? 'on' : 'off'\)/);
  assert.match(save, /secureSet\(BOOT_BEFORE_KEY, on \? 'on' : 'off'\)/);
  // As Erevos starts, nothing is kept that nobody chose.
  const sync = background.slice(background.indexOf('export async function syncBootStart('), background.indexOf('const spaceOpen = '));
  assert.match(sync, /wantBootStart\(receives\);/);
  assert.match(sync, /phone = callAudio\?\.bootChosen\?\.\(\) \?\? null;/);
  assert.match(sync, /const \{ set, keep \} = bootChoiceAtStart\(kept, phone, before\);/);
  assert.match(sync, /if \(keep\) await secureSet\(BOOT_CHOICE_KEY, keep\)/);
  assert.doesNotMatch(sync, /BOOT_BEFORE_KEY, /);
  // Turning the receiving off or on tells the phone at once.
  assert.match(background, /await secureSet\(KEY, on \? 'on' : 'off'\);\s+\/\/[^\n]*\n\s+wantBootStart\(on\);/);
  // Started by the phone with the receiving off: it stops before any notice of its own.
  const task = background.slice(background.indexOf('export function startBootNotices('));
  const stops = task.indexOf('if (!receives) {');
  assert.ok(stops > 0 && stops < task.indexOf('callAudio?.setLocked?.(true)') && stops < task.indexOf('startClosedNotices('));
  assert.match(task.slice(stops, stops + 500), /wantBootStart\(false\);\s+try \{\s+callAudio\?\.stopReceiving\?\.\(\);[\s\S]{0,120}return done\(\);/);

  // Both go with a copy of Erevos.
  assert.equal(BOOT_CHOICE_KEY, 'erevos.boot-choice');
  assert.equal(BOOT_BEFORE_KEY, 'erevos.boot-start');
  const backup = read('lock', 'backup.ts');
  const settings = backup.slice(backup.indexOf('const SETTINGS = ['), backup.indexOf('const AUTO = '));
  assert.ok(settings.includes(`'${BOOT_CHOICE_KEY}',`) && settings.includes(`'${BOOT_BEFORE_KEY}',`));

  // The choice shows wherever Erevos receives in the background, whatever the messages' notice.
  const screen = read('app', 'security.tsx');
  assert.match(screen, /\{on && canStartAtBoot \? \(\s+<>\s+<Row wrap>\s+<Chip label=\{t\('Start when the phone turns on'\)\} selected=\{boot\}/);
  assert.doesNotMatch(screen, /on && notices && canStartAtBoot/);
});
