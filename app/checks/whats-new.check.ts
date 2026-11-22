// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// What's new (lib/whats-new.ts): a version for each release of CHANGELOG.md, in its order, each
// with words, for you and under the hood as the CHANGELOG splits them; what is not out yet shows
// under the number of the version that runs; its links go to sections of the guide.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { GUIDE_SOURCES } from '../guide/index';
import { parseGuide, parseInline } from '../lib/guide';
import { laterThan, VERSION_NAME } from '../lib/version-name';
import { asPlus as asPlusForCheck, NEXT, VERSIONS, whatsNewFor, type Changes } from '../lib/whats-new';

import { ROOT } from './words';

// "## 3.3.2 (2026-10-25)" or "## 4.0.0-rc.1 (…)": the releases, newest first; "## Unreleased" is NEXT.
const changelog = () => readFileSync(join(ROOT, '..', 'CHANGELOG.md'), 'utf8');
const releases = () => [...changelog().matchAll(/^## (?!Unreleased$)(\S+)/gm)].map((m) => m[1]);
// What's new starts again at 3.0.0-beta.1, the first release of the numbering after 7.x: the
// releases before it (up to 7.2.0-rc.2) stay only in CHANGELOG.md.
const shownReleases = () => {
  const all = releases();
  return all.slice(0, all.indexOf('3.0.0-beta.1') + 1);
};
const lines = (changes: Changes) => [...changes.forYou, ...changes.underTheHood];

test('a version for each release of CHANGELOG.md, in its order, by its number alone', () => {
  // After a release, NEXT's words move under its number here, as the CHANGELOG's do.
  assert.deepEqual(
    VERSIONS.map((v) => v.version),
    shownReleases(),
  );
  for (const v of VERSIONS) assert.ok(lines(v).length > 0, v.version);
});

test('each release is named as the release workflow names it, each newer than the one below it', () => {
  const names = shownReleases();
  for (const [i, name] of names.entries()) {
    assert.match(name, VERSION_NAME);
    if (i > 0) assert.ok(laterThan(names[i - 1], name), `${names[i - 1]} above ${name}`);
  }
});

test("the CHANGELOG splits each release as What's new does: for you first, then under the hood", () => {
  for (const section of changelog().split(/^## /m).slice(1)) {
    const name = section.slice(0, section.indexOf('\n'));
    const kinds = [...section.matchAll(/^### (.+)$/gm)].map((m) => m[1]).join(' + ');
    assert.ok(['For you', 'Under the hood', 'For you + Under the hood'].includes(kinds), `${name}: ${kinds}`);
    // No entry outside the two kinds.
    assert.doesNotMatch(section.slice(0, section.indexOf('\n### ')), /^- /m, name);
  }
});

test('each line once', () => {
  const all = [...lines(NEXT), ...VERSIONS.flatMap(lines)];
  assert.deepEqual(
    all.filter((item, i) => all.indexOf(item) !== i),
    [],
  );
});

test('what is not out yet shows under the version that runs, once it comes after the last release', () => {
  const last = VERSIONS[0].version;
  assert.equal(laterThan('3.10.0', '3.9.1'), true);
  assert.equal(laterThan('3.3.2', '3.3.2'), false);
  assert.equal(laterThan('4.0.0-rc.1', '3.4.2'), true);
  assert.equal(laterThan('4.0.0-rc.1', '4.0.0'), false);
  assert.equal(laterThan('0.0.1', last), false);
  assert.equal(laterThan('0.0.1', '3.0.0'), false);
  // Since 7.x the numbers start again at 3, after every 7.x.
  assert.equal(laterThan('3.0.0', '7.2.0'), true);
  assert.equal(laterThan('3.0.0-rc.1', '7.3.0'), true);
  assert.equal(laterThan('7.2.0', '3.0.0'), false);
  assert.equal(laterThan('8.0.0', '7.9.9'), true);
  // The plain Erevos, whichever edition this build is: Erevos+ also takes in the plain releases (asPlus, below).
  const shown = whatsNewFor('99.0.0', 'lite');
  const pending = lines(NEXT).length > 0;
  assert.equal(shown.length, VERSIONS.length + (pending ? 1 : 0));
  if (pending) assert.equal(shown[0].version, '99.0.0');
  // A build of a release: no list of what is to come.
  assert.deepEqual(whatsNewFor(last, 'lite').map((v) => v.version), VERSIONS.map((v) => v.version));
  // A build of main for testing: with no number.
  if (pending) assert.equal(whatsNewFor('0.0.1', 'lite')[0].version, null);
  // Erevos+'s bridge (7.3.1) is a release, though its name comes before the 3.x ones: never «Not out yet».
  if (pending) assert.equal(whatsNewFor('7.3.1', 'plus', true)[0].version, '7.3.1');
});

test('plain Erevos keeps the lines that are its own: SMS, Phone, Collection', () => {
  const all = whatsNewFor(VERSIONS[0].version, 'lite').flatMap((v) => [...v.forYou, ...v.underTheHood]);
  for (const start of ['**Quick texts**', '**Speed dial**', '**Night photos and HDR**']) assert.ok(all.some((line) => line.startsWith(start)), start);
});

test("its links go to the guide's sections, in every one of its languages", () => {
  const links = [...lines(NEXT), ...VERSIONS.flatMap(lines)].flatMap((item) => parseInline(item).flatMap((span) => (span.link ? [span.link] : [])));
  for (const source of Object.values(GUIDE_SOURCES)) {
    const ids = new Set(parseGuide(source).map((s) => s.id));
    for (const link of links) {
      assert.ok(link.startsWith('#'), link);
      assert.ok(ids.has(link.slice(1)), link);
    }
  }
});

test("Erevos+ tells the plain Erevos's releases under its own next one, as its own", () => {
  const v = (version: string | null, forYou: string[]) => ({ version, forYou, underTheHood: [] as string[] });
  const list = [v('7.1.2', ['plus two']), v('7.0.2', ['both two', '**The guide tells only of what Erevos has**: in Erevos.']), v('7.1.1', ['plus one']), v('7.0.1', ['both one']), v('7.0.0', ['seven'])];
  assert.deepEqual(asPlusForCheck(list), [v('7.1.2', ['plus two', 'both two']), v('7.1.1', ['plus one', 'both one']), v('7.0.0', ['seven'])]);
  // From 7.2 on the plain Erevos has the even minor numbers and Erevos+ the odd ones, betas too.
  assert.deepEqual(asPlusForCheck([v('7.3.0-beta.1', ['plus three']), v('7.2.0-beta.1', ['both three']), v('7.1.2', ['plus two'])]), [v('7.3.0-beta.1', ['plus three', 'both three']), v('7.1.2', ['plus two'])]);
  // With no Erevos+ release after them, the plain ones stay as they are.
  assert.deepEqual(asPlusForCheck([v('7.0.2', ['a']), v('7.0.1', ['b'])]), [v('7.0.2', ['a']), v('7.0.1', ['b'])]);
  assert.deepEqual(asPlusForCheck([v(null, ['n']), v('7.0.1', ['b'])]), [v(null, ['n']), v('7.0.1', ['b'])]);
});

test('since 7.x, Erevos+ takes in the plain x.0.y and Erevos⁻ x.2.y releases, and lists its own x.1.y', () => {
  const entry = (version: string) => ({ version, forYou: [`in ${version}`], underTheHood: [] });
  const list = asPlusForCheck([entry('3.1.0'), entry('3.2.0'), entry('3.0.1'), entry('3.0.0'), entry('7.3.0')]);
  assert.deepEqual(
    list.map((v) => v.version),
    ['3.1.0', '7.3.0'],
  );
  assert.deepEqual(list[0].forYou, ['in 3.1.0', 'in 3.2.0', 'in 3.0.1', 'in 3.0.0']);
  // Their betas and release candidates too.
  const betas = asPlusForCheck([entry('3.1.0-beta.1'), entry('3.0.0-beta.1'), entry('7.3.0-rc.2')]);
  assert.deepEqual(betas.map((v) => v.version), ['3.1.0-beta.1', '7.3.0-rc.2']);
  assert.deepEqual(betas[0].forYou, ['in 3.1.0-beta.1', 'in 3.0.0-beta.1']);
});
