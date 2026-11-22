// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// CREDITS.md (scripts/credits.mjs): the open-source work Erevos is built on lists exactly the
// packages the lockfiles hold, so a change that adds, updates or drops a dependency has to run
// `node scripts/credits.mjs` in the same change. The check reads only names and versions from files
// in the repository: no network, no cargo, no node_modules. And it says what differs.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';

type Differences = { missing: string[]; gone: string[] };
const { check } = (await import('../../scripts/credits.mjs')) as { check: (root?: string) => Differences };

const REPO = join(import.meta.dirname, '..', '..');
const { checkNotices } = (await import('../../scripts/notices.mjs')) as {
  checkNotices: (root?: string) => { missing: string[]; gone: string[]; stale: string[] };
};
const credits = readFileSync(join(REPO, 'CREDITS.md'), 'utf8');

test('CREDITS.md lists every package in the lockfiles and no other: run node scripts/credits.mjs', () => {
  const { missing, gone } = check();
  assert.deepEqual(missing, [], 'not in CREDITS.md');
  assert.deepEqual(gone, [], 'in CREDITS.md, but not in the lockfiles any more');
});

test('the hand-written parts and the list are all in CREDITS.md, in order', () => {
  const marks = ['## Main parts', '<!-- main:start -->', '<!-- main:end -->', '## Other works', '<!-- other:start -->', '<!-- other:end -->', '## Every package', '<!-- generated:start -->', '<!-- generated:end -->'];
  const places = marks.map((mark) => credits.indexOf(mark));
  for (const [i, mark] of marks.entries()) assert.ok(places[i] >= 0, mark);
  assert.deepEqual([...places].sort((a, b) => a - b), places);
});

// The repository's lockfiles with a CREDITS.md that is wrong in the ways a change would make it.
const dir = mkdtempSync(join(tmpdir(), 'erevos-credits-'));
after(() => rmSync(dir, { recursive: true, force: true }));
for (const file of ['app/package-lock.json', 'desktop/package-lock.json', 'Cargo.lock', 'transports/go.mod', 'app/modules/erevos-contacts/android/build.gradle', 'app/modules/erevos-collection/android/build.gradle', 'app/modules/erevos-phone/android/build.gradle', 'app/modules/erevos-messenger/android/build.gradle']) {
  mkdirSync(join(dir, dirname(file)), { recursive: true });
  copyFileSync(join(REPO, file), join(dir, file));
}

/** What the check says of the lockfiles above against `text` as CREDITS.md. */
function differences(text: string): Differences {
  writeFileSync(join(dir, 'CREDITS.md'), text);
  return check(dir);
}

test('a package the lockfiles hold and CREDITS.md does not is missing, in whichever part it is', () => {
  const row = (name: string) => new RegExp(`^\\| \\[?${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]?(\\(.*?\\))? \\| .*\\n`, 'm');
  const without = (...names: string[]) => names.reduce((text, name) => text.replace(row(name), ''), credits);
  assert.deepEqual(differences(credits), { missing: [], gone: [] });
  const { missing, gone } = differences(without('serde_json', 'electron', 'com.google.zxing:core', 'github.com/pion/webrtc/v4', 'react-native'));
  assert.deepEqual(gone, []);
  assert.equal(missing.length, 5);
  for (const [part, name] of [
    ['Rust crates', 'serde_json'],
    ['The computer app', 'electron'],
    ['Android libraries', 'com.google.zxing:core'],
    ['Go modules for the Tor bridges', 'github.com/pion/webrtc/v4'],
    ["The app's JavaScript packages", 'react-native'],
  ]) {
    assert.ok(
      missing.some((line) => line.startsWith(`${part}: ${name} `)),
      `${part}: ${name}`,
    );
  }
});

test('a package CREDITS.md lists that the lockfiles no longer hold is gone, and so is an old version of one they do', () => {
  const part = (title: string, first: string, name: string, version: string) => `### ${title}\n\n| ${first} | Version | Licence |\n| --- | --- | --- |\n| ${name} | ${version} | MIT |\n\n`;
  const text = credits
    .replace('### Rust crates\n', () => part('Rust crates', 'Crate', 'gone-crate', '9.9.9') + '### Rust crates\n')
    .replace('<!-- generated:end -->', () => part('Android libraries', 'Library', 'com.example:gone', '1.0') + '<!-- generated:end -->');
  assert.deepEqual(differences(text), { missing: [], gone: ['Android libraries: com.example:gone 1.0', 'Rust crates: gone-crate 9.9.9'] });
  // zstd as listed now (the lock's version) turned into an older one: that one is no longer in use, and the lock's is not listed.
  const row = /^(\| \[?zstd\]?(?:\(.*?\))? \| )(\d+\.\d+\.\d+)/m;
  const now = credits.match(row)?.[2];
  assert.ok(now, 'zstd is listed in CREDITS.md');
  const old = credits.replace(row, (_, head: string) => `${head}0.0.1`);
  assert.deepEqual(differences(old), { missing: [`Rust crates: zstd ${now}`], gone: ['Rust crates: zstd 0.0.1'] });
});

test('CREDITS.md without the marks around the list is refused, not taken for an empty one', () => {
  assert.throws(() => differences(credits.replace('<!-- generated:end -->', '')), /generated:start/);
});

test('app/public/NOTICES.txt, which every build carries, names the same packages and the AUTHORS.md and LICENSE of now: run node scripts/credits.mjs', () => {
  const { missing, gone, stale } = checkNotices();
  assert.deepEqual(missing, [], 'not in NOTICES.txt');
  assert.deepEqual(gone, [], 'in NOTICES.txt, but not in the lockfiles any more');
  assert.deepEqual(stale, [], 'NOTICES.txt holds an old copy');
});
