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
import { asPlus as asPlusForCheck, NEXT, VERSIONS, whatsNewFor, whatsNewOf, type Changes } from '../lib/whats-new';

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
  // Newest first by date: a release of Erevos (x.0.y), Erevos+ (x.1.y) or Erevos Lite (x.2.y) each
  // comes after the last of its own edition, whichever number is higher.
  const edition = (name: string) => name.split('.')[1];
  for (const [i, name] of names.entries()) {
    assert.match(name, VERSION_NAME);
    const above = names.slice(0, i).reverse().find((other) => edition(other) === edition(name));
    if (above) assert.ok(laterThan(above, name), `${above} above ${name}`);
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
  // The plain Erevos's releases: Erevos Lite's (x.2.y) are not among them.
  const plain = VERSIONS.filter((v) => !/^(?!7\.)\d+\.2\./.test(v.version));
  const last = plain[0].version;
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
  const shown = whatsNewFor('99.0.0', 'erevos');
  const pending = lines(NEXT).length > 0;
  assert.equal(shown.length, plain.length + (pending ? 1 : 0));
  if (pending) assert.equal(shown[0].version, '99.0.0');
  // A build of a release: no list of what is to come.
  assert.deepEqual(whatsNewFor(last, 'erevos').map((v) => v.version), plain.map((v) => v.version));
  // A build of main for testing: with no number.
  if (pending) assert.equal(whatsNewFor('0.0.1', 'erevos')[0].version, null);
  // Erevos+'s bridge (7.3.1) is a release, though its name comes before the 3.x ones: never «Not out yet».
  if (pending) assert.equal(whatsNewFor('7.3.1', 'plus', true)[0].version, '7.3.1');
});

test('plain Erevos keeps the lines that are its own: SMS, Phone, Collection', () => {
  const all = whatsNewFor(VERSIONS[0].version, 'erevos').flatMap((v) => [...v.forYou, ...v.underTheHood]);
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

test('Erevos Lite tells what Erevos had until it under its own number, without the Phone, SMS or Collection', () => {
  // Its first release brings all Erevos had until then, as this version.
  // As it was at that release: what came after it is not in it.
  const at = VERSIONS.slice(VERSIONS.findIndex((v) => v.version === '3.2.0-beta.2'));
  const first = whatsNewOf(at, { forYou: [], underTheHood: [] }, '3.2.0-beta.2', 'lite');
  assert.equal(first[0].version, '3.2.0-beta.2');
  // Its own line, which Erevos and Erevos+ do not show.
  assert.ok(first[0].forYou[0].startsWith('**Erevos Lite**:'), first[0].forYou[0]);
  for (const edition of ['erevos', 'plus'] as const) assert.ok(!whatsNewFor('3.2.0-beta.2', edition).flatMap(lines).some((line) => line.startsWith('**Erevos Lite**:')), edition);
  assert.ok(first.every((v) => v.version === null || /^\d+\.2\./.test(v.version)), JSON.stringify(first.map((v) => v.version)));
  const all = first.flatMap(lines);
  // The phone you hold is not the Phone.
  assert.ok(all.some((line) => line.startsWith('**Erevos, Erevos+ or Erevos Lite**')));
  for (const line of all) assert.doesNotMatch(line, /\bSMS\b|\bPhone\b|\bCollection\b|\(#(?:sms|phone|collection|modules)\)/, line);
  // Nothing empty is listed.
  for (const v of whatsNewFor('0.0.1', 'lite')) assert.ok(lines(v).length > 0, String(v.version));
});

test("each release of Erevos Lite keeps what came before it; Erevos and Erevos+ never list Erevos Lite's", () => {
  const v = (version: string, line: string) => ({ version, forYou: [line], underTheHood: [] as string[] });
  const none = { forYou: [] as string[], underTheHood: [] as string[] };
  const list = [v('3.0.2', 'two'), v('3.2.0-beta.1', 'lite one'), v('3.0.1', 'one'), v('3.0.0', 'zero')];
  // Its second beta: only what came after the first, under this version; the first keeps the rest.
  assert.deepEqual(
    whatsNewOf(list, none, '3.2.0-beta.2', 'lite').map((x) => [x.version, x.forYou]),
    [['3.2.0-beta.2', ['two']], ['3.2.0-beta.1', ['lite one', 'one', 'zero']]],
  );
  // The first beta itself, recorded.
  assert.deepEqual(whatsNewOf(list.slice(1), none, '3.2.0-beta.1', 'lite').map((x) => x.version), ['3.2.0-beta.1']);
  // What is not out yet, in Erevos Lite after its release, and in Erevos after Erevos Lite's.
  const next = { forYou: ['next'], underTheHood: [] as string[] };
  assert.deepEqual(whatsNewOf(list, next, '3.2.0-beta.2', 'lite')[0].forYou, ['next', 'two']);
  const plain = whatsNewOf([v('3.2.0-beta.1', 'lite one'), v('3.0.1', 'one')], next, '3.0.2', 'erevos');
  assert.deepEqual(plain.map((x) => x.version), ['3.0.2', '3.0.1']);
  assert.ok(!plain.some((x) => x.forYou.includes('lite one')));
  assert.ok(!whatsNewOf(list, none, '3.0.2', 'plus').some((x) => x.forYou.includes('lite one')));
});
