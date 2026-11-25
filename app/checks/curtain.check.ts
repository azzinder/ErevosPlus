// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The curtain over a space with a password lock (lib/curtain.ts, modules/erevos-device Curtain.kt,
// app/_layout.tsx): the phone covers the space's screens as they go out of sight and keeps them
// covered when Erevos comes back after the lock's time, until the password screen is drawn, so
// nothing of the space shows before it; the lock button covers at once. What can be held here
// without a phone: how the app decides whether it was away long enough, what it tells the phone,
// that a build without the curtain changes nothing, and that the app and the phone's side still
// say the same things to each other.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { armCurtain, awayClock, awayLong, CURTAIN_END, curtainBack, curtainColour, curtainDown, liftCurtain, lowerCurtain } from '../lib/curtain';
import { device } from './device-memory';

const ROOT = join(import.meta.dirname, '..');
const read = (...parts: string[]) => readFileSync(join(ROOT, ...parts), 'utf8');
const KOTLIN = ['modules', 'erevos-device', 'android', 'src', 'main', 'java', 'expo', 'modules', 'erevosdevice'];

type Phone = {
  curtainArm?: (after: number, ground: number) => void;
  curtainLower?: () => void;
  curtainLift?: (onScreen: boolean) => void;
  curtainBack?: () => { away: number; kept: boolean } | null;
  curtainDown?: () => boolean;
  clock?: () => { up: number; boot: string };
};
const phone = device as unknown as Phone;

function withPhone<T>(fake: Phone, run: () => T): T {
  const was = { ...phone };
  Object.assign(phone, fake);
  try {
    return run();
  } finally {
    for (const name of Object.keys(fake) as (keyof Phone)[]) {
      if (name in was) Object.assign(phone, { [name]: was[name] });
      else delete phone[name];
    }
  }
}

test('the time away is the phone\'s count when it kept one, whatever the date and time say', () => {
  const after = 30_000;
  // Back within the lock's time by the phone's count: open, even with the date and time moved an hour on.
  assert.equal(awayLong({ away: 12_000, kept: false }, 3_600_000, after), false);
  // Away longer by the phone's count: locked, even with the date and time moved back.
  assert.equal(awayLong({ away: 31_000, kept: true }, -3_600_000, after), true);
  assert.equal(awayLong({ away: 31_000, kept: true }, null, after), true);
  // Exactly the lock's time is not yet longer, as the phone has it (Curtain.kt: away > afterMs).
  assert.equal(awayLong({ away: 30_000, kept: false }, null, after), false);
  // The phone kept no count (Erevos was never out of sight, or the phone has no curtain): the app's own.
  assert.equal(awayLong(null, 30_001, after), true);
  assert.equal(awayLong(null, 30_000, after), false);
  assert.equal(awayLong(null, null, after), false);
});

test('the cover has the look\'s ground colour, never see-through', () => {
  assert.equal(curtainColour('#0D0B09'), 0xff0d0b09 | 0);
  assert.equal(curtainColour('#f7f3ec'), 0xfff7f3ec | 0);
  assert.equal(curtainColour('#FFF'), 0xffffffff | 0);
  // A colour with its own alpha is still drawn whole: a cover that lets through hides nothing.
  assert.equal(curtainColour('#11223300'), 0xff112233 | 0);
  // Anything else is black.
  assert.equal(curtainColour('rgb(1, 2, 3)'), 0xff000000 | 0);
  assert.equal(curtainColour(''), 0xff000000 | 0);
  for (const colour of ['#0D0B09', '#FFF', '#11223300', 'nothing']) assert.equal(curtainColour(colour) >>> 24, 0xff);
});

test('the app tells the phone when to cover, and takes its count once', () => {
  const said: string[] = [];
  let back: { away: number; kept: boolean } | null = { away: 45_000, kept: true };
  const fake: Phone = {
    curtainArm: (after, ground) => void said.push(`arm ${after} ${ground >>> 0}`),
    curtainLower: () => void said.push('lower'),
    curtainLift: (onScreen) => void said.push(`lift ${onScreen}`),
    curtainBack: () => {
      const was = back;
      back = null;
      return was;
    },
    curtainDown: () => true,
  };
  withPhone(fake, () => {
    armCurtain(30_000, '#161826');
    lowerCurtain();
    liftCurtain(true);
    liftCurtain(false);
    armCurtain(null, '#161826');
    assert.deepEqual(said, [`arm 30000 ${0xff161826}`, 'lower', 'lift true', 'lift false', `arm -1 ${0xff161826}`]);
    assert.deepEqual(curtainBack(), { away: 45_000, kept: true });
    assert.equal(curtainBack(), null);
    assert.equal(curtainDown(), true);
  });
});

test('a phone without the curtain, or one that fails, changes nothing', () => {
  // The checks' phone has none of it, as a build before it, the web app and a computer.
  assert.equal(phone.curtainArm, undefined);
  armCurtain(30_000, '#000000');
  lowerCurtain();
  liftCurtain(true);
  assert.equal(curtainBack(), null);
  assert.equal(curtainDown(), false);
  const failing = () => {
    throw new Error('No screen.');
  };
  withPhone({ curtainArm: failing, curtainLower: failing, curtainLift: failing, curtainBack: failing, curtainDown: failing }, () => {
    armCurtain(30_000, '#000000');
    lowerCurtain();
    liftCurtain(false);
    assert.equal(curtainBack(), null);
    assert.equal(curtainDown(), false);
  });
  // A count that is not one is no count: the app's own decides.
  withPhone({ curtainBack: () => ({}) as { away: number; kept: boolean } }, () => assert.equal(curtainBack(), null));
});

test('the app\'s own count is kept on the phone\'s clock that nobody can set, where it has one', () => {
  withPhone({ clock: () => ({ up: 123_456, boot: 'count:7' }) }, () => assert.equal(awayClock(), 123_456));
  const before = Date.now();
  const now = awayClock();
  assert.ok(now >= before && now <= Date.now());
  withPhone({ clock: () => ({ up: Number.NaN, boot: '' }) }, () => assert.ok(awayClock() >= before));
});

test('locking covers first, and every screen that is not a space\'s ends the cover', () => {
  const layout = read('app', '_layout.tsx');
  // The password screen is asked for with the cover already there.
  const gate = layout.slice(layout.indexOf('const gate = useCallback('), layout.indexOf('const relock = useCallback('));
  assert.ok(gate.indexOf('lowerCurtain();') > 0);
  assert.ok(gate.indexOf('lowerCurtain();') < gate.indexOf('setSpaceGated(true);'));
  assert.ok(gate.indexOf('lowerCurtain();') < gate.indexOf('await loadLockConfig()'));
  // It goes once a screen that is not the space's is drawn, whichever that is.
  assert.match(gate, /if \(error === null && phase\.kind === 'open'\) return;\s+gating\.current = false;\s+liftCurtain\(true\);/);
  const shell = layout.slice(layout.indexOf('function Shell('), layout.indexOf('function CurtainEnd('));
  const open = shell.indexOf('<LockContext.Provider');
  const branches = shell.slice(0, open).split('<ScreenBackdrop>').slice(1);
  // Could not open, loading, moved, a move found, the first setup, locked.
  assert.equal(branches.length, 6);
  for (const branch of branches) assert.match(branch, /<CurtainEnd \/>/);
  // The space's own screens never carry the mark: the cover would go over them.
  assert.doesNotMatch(shell.slice(open), /CurtainEnd/);
  assert.match(layout, /function CurtainEnd\(\) \{\s+return <View nativeID=\{CURTAIN_END\}/);
  // Armed only while a space with a password lock shows, and not during a call.
  assert.match(shell, /const covered = phase\.kind === 'open' && phase\.passwordLock && !error;/);
  assert.match(shell, /armCurtain\(holds \? null : RELOCK_AFTER_MS, ground\)/);
  // Back in front: by the phone's count, and the cover goes when the space stays open.
  assert.match(layout, /awayLong\(back, since === null \? null : awayClock\(\) - since, RELOCK_AFTER_MS\)/);
  // Out of sight, the lock's time is not counted on the date and time.
  assert.doesNotMatch(layout.slice(layout.indexOf('export default function RootLayout'), layout.indexOf('function Shell(')), /backgroundAt\.current = Date\.now\(\)|Date\.now\(\) - was\.at/);
});

test('the phone\'s side covers out of sight, decides on its own clock, and waits for the mark', () => {
  const kotlin = read(...KOTLIN, 'Curtain.kt');
  assert.ok(kotlin.includes(`private const val END = "${CURTAIN_END}"`));
  // The cover comes as the screens go out of sight, only while armed, and is decided as they come back.
  const stopped = kotlin.slice(kotlin.indexOf('override fun onActivityStopped'), kotlin.indexOf('override fun onActivityStarted'));
  assert.match(stopped, /if \(activity !== stage\?\.get\(\)\) return\s+[^\n]*\n\s+if \(armed && !down\) put\(activity\)/);
  const started = kotlin.slice(kotlin.indexOf('override fun onActivityStarted'), kotlin.indexOf('override fun onActivityDestroyed'));
  assert.match(started, /SystemClock\.elapsedRealtime\(\) - was\.pausedAt/);
  assert.match(started, /armed && away > afterMs -> \{\s+held = true\s+kept = true\s+\}\s+else -> take\(\)/);
  // Both covers: inside the activity's window, and a window over its others.
  assert.match(kotlin, /decor\.addView\(view, /);
  assert.match(kotlin, /WindowManager\.LayoutParams\.TYPE_APPLICATION,/);
  assert.match(kotlin, /activity\.windowManager\.addView\(view, params\)/);
  assert.match(kotlin, /removeViewImmediate\(view\)/);
  // It takes touches, so nothing under it is pressed, and no keys.
  assert.match(kotlin, /setOnTouchListener \{ _, _ -> true \}/);
  assert.match(kotlin, /FLAG_NOT_FOCUSABLE/);
  // Lifted once the marked screen is laid out and drawn, or after a wait, never while out of sight.
  assert.match(kotlin, /ReactFindViewUtil\.findView\(it, END\)/);
  assert.match(kotlin, /end\.isAttachedToWindow && end\.isLaidOut/);
  assert.match(kotlin, /if \(here != null && !stateOf\(here\)\.stopped\) watch\(\)/);
  assert.match(kotlin, /SystemClock\.elapsedRealtime\(\) - began > WAIT_MS/);
  // A cover never outlives its screens.
  assert.match(kotlin.slice(kotlin.indexOf('override fun onActivityDestroyed')), /take\(\)/);

  const module = read(...KOTLIN, 'ErevosDeviceModule.kt');
  assert.match(module, /Curtain\.register\(context\?\.applicationContext as\? Application\)/);
  for (const name of ['curtainArm', 'curtainLower', 'curtainLift', 'curtainBack', 'curtainDown']) assert.ok(module.includes(`Function("${name}")`), name);
  assert.match(read('modules', 'erevos-device', 'android', 'build.gradle'), /implementation 'com\.facebook\.react:react-android'/);
});
