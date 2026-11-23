// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Naming a release (.github/workflows/release.yml, its version job): 2.1.0, or a test release
// such as 4.0.0-rc.1, always newer than the latest; its build number, above every Erevos and
// Erevos+ build so far; and the Sailfish RPM's version of a test release. The workflow's own
// scripts run here, with a gh of this check's own. Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';

import { laterThan, VERSION_NAME } from '../lib/version-name';

import { ROOT } from './words';

const workflow = readFileSync(join(ROOT, '..', '.github', 'workflows', 'release.yml'), 'utf8').split('\n');

/** The script of the step whose `id:` is `id`, as GitHub runs it. */
function stepScript(id: string): string {
  const at = workflow.findIndex((line) => line.trim() === `id: ${id}`);
  assert.ok(at >= 0, id);
  const run = workflow.findIndex((line, i) => i > at && line.trim() === 'run: |');
  const indent = (line: string) => line.length - line.trimStart().length;
  const body: string[] = [];
  for (const line of workflow.slice(run + 1)) {
    if (line.trim() && indent(line) <= indent(workflow[run])) break;
    body.push(line);
  }
  const least = Math.min(...body.filter((line) => line.trim()).map(indent));
  return body.map((line) => line.slice(least)).join('\n');
}

const dir = mkdtempSync(join(tmpdir(), 'erevos-release-version-'));
after(() => rmSync(dir, { recursive: true, force: true }));
// gh api, its --jq done already: the published plain Erevos releases (`LATEST`, or none at all), a
// tag's commit, and GitHub's latest release (`GITHUB_LATEST`, an Erevos+ one, which the job no
// longer counts on from).
writeFileSync(
  join(dir, 'gh'),
  [
    '#!/bin/sh',
    'case "$2" in',
    '  *releases/latest) [ -n "$GITHUB_LATEST" ] || exit 1; printf "%s abc1234\\n" "$GITHUB_LATEST" ;;',
    '  *releases/tags/*) echo abc1234 ;;',
    '  *) [ -n "$LATEST" ] || exit 1; printf "%s\\n" "${LATEST#v}" ;;',
    'esac',
    '',
  ].join('\n'),
);
chmodSync(join(dir, 'gh'), 0o755);
writeFileSync(join(dir, 'check.sh'), stepScript('check'));

/** The version the job names, with `latest` the latest release's tag and `wanted` the one asked for; an error's words when it refuses. */
function named(latest: string, wanted: string, githubLatest = latest): string {
  const output = join(dir, 'output');
  writeFileSync(output, '');
  const env = {
    ...process.env,
    PATH: `${dir}:${process.env.PATH}`,
    LATEST: latest,
    GITHUB_LATEST: githubLatest,
    WANTED: wanted,
    GITHUB_OUTPUT: output,
    GITHUB_REF_NAME: 'main',
    GITHUB_EVENT_NAME: 'workflow_dispatch',
    GITHUB_SHA: 'def5678',
    GH_REPO: 'example/erevos',
    EREVOS_BUILD: '45',
  };
  try {
    execFileSync('bash', ['--noprofile', '--norc', '-eo', 'pipefail', join(dir, 'check.sh')], { env, stdio: 'pipe' });
  } catch (e) {
    const out = String((e as { stdout?: Buffer }).stdout ?? '');
    return out.match(/::error::(.*)/)?.[1] ?? out;
  }
  return /^version=(.*)$/m.exec(readFileSync(output, 'utf8'))?.[1] ?? '';
}

test('a release is named as asked, or the one after the latest', () => {
  assert.equal(named('v3.4.2', ''), '3.4.3');
  assert.equal(named('v3.4.2', '3.5.0'), '3.5.0');
  assert.equal(named('v3.4.2', 'v4.0.0'), '4.0.0');
  assert.equal(named('', ''), '2.0.0');
  assert.match(named('v3.4.2', '3.4.2'), /not newer/);
  assert.match(named('v3.4.2', '3.4.1'), /not newer/);
  assert.match(named('v3.4.2', '3.4'), /Not a version/);
  // GitHub's latest is an Erevos+ release: the plain Erevos counts on from its own.
  assert.equal(named('v7.0.0', '', 'v7.1.0'), '7.0.1');
});

test('since 7.x the numbers start again at 3, after every 7.x (the second number says the edition)', () => {
  assert.equal(named('v7.2.0', '3.0.0'), '3.0.0');
  assert.equal(named('v7.2.0', '3.0.0-rc.1'), '3.0.0-rc.1');
  assert.equal(named('v3.0.0', ''), '3.0.1');
  assert.equal(named('v3.0.0', '4.0.0'), '4.0.0');
  assert.equal(named('v6.0.0', '8.0.0'), '8.0.0');
  assert.match(named('v3.0.0', '7.2.1'), /not newer/);
  assert.match(named('v3.0.1', '3.0.0'), /not newer/);
  // Only 3.x to 6.x come after 7.x: 8.x and on after them, and 1.x or 2.x stay before.
  assert.match(named('v7.2.0', '2.0.0'), /not newer/);
  assert.equal(named('v6.9.0', '9.0.0'), '9.0.0');
  for (const [a, b] of [['7.2.0', '3.0.0'], ['7.3.0-rc.2', '3.0.0-beta.1'], ['7.9.9', '8.0.0'], ['3.0.0', '3.1.0'], ['6.9.9', '8.0.0'], ['2.0.0', '7.0.0'], ['1.0.0', '2.0.0'], ['8.0.0', '9.0.0']]) {
    assert.equal(laterThan(b, a), true, `${b} after ${a}`);
    assert.equal(laterThan(a, b), false, `${a} not after ${b}`);
  }
});

test('a test release before a version: 4.0.0-rc.1, after 3.x, before 4.0.0, and the one after it is rc.2', () => {
  assert.equal(named('v3.4.2', '4.0.0-rc.1'), '4.0.0-rc.1');
  assert.equal(named('v3.4.2', 'v4.0.0-rc.1'), '4.0.0-rc.1');
  assert.equal(named('v4.0.0-rc.1', ''), '4.0.0-rc.2');
  assert.equal(named('v4.0.0-rc.9', ''), '4.0.0-rc.10');
  assert.equal(named('v4.0.0-rc.9', '4.0.0-rc.10'), '4.0.0-rc.10');
  assert.equal(named('v4.0.0-beta.2', '4.0.0-rc.1'), '4.0.0-rc.1');
  assert.equal(named('v4.0.0-rc.2', '4.0.0'), '4.0.0');
  assert.match(named('v4.0.0-rc.2', '4.0.0-rc.1'), /not newer/);
  assert.match(named('v4.0.0-rc.2', '4.0.0-rc.2'), /not newer/);
  assert.match(named('v4.0.0', '4.0.0-rc.3'), /not newer/);
  assert.match(named('v4.0.0-rc.1', '3.4.3'), /not newer/);
  for (const odd of ['4.0.0RC1', '4.0.0-RC1', '4.0.0-rc', '4.0.0-rc1', '4.0.0-rc.0', '4.0.0-rc.01', '4.0.0-test.1', '4.0.0-rc.1.2']) {
    assert.match(named('v3.4.2', odd), /Not a version/, odd);
  }
});

test('the app reads the names the workflow gives, in the same order', () => {
  const names = ['3.4.2', '3.4.3', '4.0.0-alpha.1', '4.0.0-beta.2', '4.0.0-rc.1', '4.0.0-rc.2', '4.0.0-rc.10', '4.0.0', '4.0.1'];
  for (const [i, name] of names.entries()) {
    assert.ok(VERSION_NAME.test(name), name);
    if (i > 0) assert.equal(named(`v${names[i - 1]}`, name), name);
    if (i > 0) assert.equal(laterThan(name, names[i - 1]), true, `${name} after ${names[i - 1]}`);
    if (i > 0) assert.equal(laterThan(names[i - 1], name), false, `${names[i - 1]} not after ${name}`);
    assert.equal(laterThan(name, name), false, name);
  }
  for (const odd of ['4.0.0RC1', '4.0.0-RC1', '4.0.0-rc', '4.0.0-rc.0', '4.0.0-rc.01', 'v4.0.0-rc.1', '4.0.0-rc.1.2']) {
    assert.equal(VERSION_NAME.test(odd), false, odd);
  }
});

// The build number step, with a gh of its own: PUBLISHED lists "<tag>:<build>" of the published
// releases with a version.json, DRAFTS the drafts' tags, RUNS erevosgram.yml's run names, and
// FAIL makes the call naming it fail.
const numberDir = join(dir, 'number');
mkdirSync(numberDir);
writeFileSync(
  join(numberDir, 'gh'),
  [
    '#!/bin/bash',
    'case "$*" in',
    // Erevos Lite's download repository: missing (404) until LITE names its releases.
    '  *"--jq .full_name"*) [ "$FAIL" = lite ] && exit 1; [ -z "$LITE" ] && { echo "gh: Not Found (HTTP 404)" >&2; exit 1; }; echo "$LITE_RELEASES_REPO" ;;',
    '  "release download "*erevos-lite-releases*) for p in $LITE; do [ "${p%%:*}" = "$3" ] && printf \'{"name": "x", "build": %s}\\n\' "${p##*:}"; done ;;',
    '  *erevos-lite-releases/releases*) for p in $LITE; do echo "${p%%:*}"; done ;;',
    '  "release download "*) [ "$FAIL" = download ] && exit 1; for p in $PUBLISHED; do [ "${p%%:*}" = "$3" ] && printf \'{"name": "x", "build": %s}\\n\' "${p##*:}"; done ;;',
    '  *"select(.draft | not)"*) [ "$FAIL" = releases ] && exit 1; for p in $PUBLISHED; do echo "${p%%:*}"; done ;;',
    '  *"select(.draft)"*) for d in $DRAFTS; do echo "$d" | sed "s/^build-//"; done ;;',
    '  *erevosgram.yml/runs*) [ "$FAIL" = runs ] && exit 1; printf "%s\\n" "$RUNS" ;;',
    '  *) exit 1 ;;',
    'esac',
    'exit 0',
    '',
  ].join('\n'),
);
chmodSync(join(numberDir, 'gh'), 0o755);
writeFileSync(join(numberDir, 'number.sh'), stepScript('number'));

/** The build number the version job gives run `run`; an error's words when it refuses. */
function numbered(run: number, builds: { published?: string; drafts?: string; runs?: string[]; built?: string; fail?: string; lite?: string } = {}): string {
  const output = join(numberDir, 'output');
  writeFileSync(output, '');
  const env = {
    ...process.env,
    PATH: `${numberDir}:${process.env.PATH}`,
    PUBLISHED: builds.published ?? '',
    DRAFTS: builds.drafts ?? '',
    RUNS: (builds.runs ?? []).join('\n'),
    FAIL: builds.fail ?? '',
    LITE: builds.lite ?? '',
    LITE_RELEASES_REPO: 'azzinder/erevos-lite-releases',
    EREVOS_BUILT: builds.built ?? '',
    GITHUB_OUTPUT: output,
    GITHUB_RUN_NUMBER: String(run),
    GH_REPO: 'example/erevos',
  };
  try {
    execFileSync('bash', ['--noprofile', '--norc', '-eo', 'pipefail', join(numberDir, 'number.sh')], { env, stdio: 'pipe' });
  } catch (e) {
    const out = String((e as { stdout?: Buffer }).stdout ?? '');
    return out.match(/::error::(.*)/)?.[1] ?? out;
  }
  return /^number=(.*)$/m.exec(readFileSync(output, 'utf8'))?.[1] ?? '';
}

test("a build's number is the run's, unless an Erevos or Erevos+ build already took it or one above it", () => {
  assert.equal(numbered(67), '67');
  assert.equal(numbered(67, { published: 'v7.0.0-rc.10:66 v7.0.0-rc.9:64' }), '67');
  // Erevos+ 7.1.0-beta.5 is build 67: Erevos's next is 68, not the run's 67.
  assert.equal(numbered(67, { published: 'v7.0.0-rc.10:66 v7.1.0-beta.5:67' }), '68');
  assert.equal(numbered(80, { published: 'v7.0.0-rc.10:66 v7.1.0-beta.5:67' }), '80');
  // An Erevos+ or ErevosGram build under way or never published, by its run's name.
  assert.equal(numbered(67, { runs: ['erevosgram', 'Erevos+ 7.1.1-beta.1, build 71', '7.1.0-EGram-beta1'] }), '72');
  // A build of this workflow under way, by its draft.
  assert.equal(numbered(67, { drafts: 'build-69' }), '70');
  assert.equal(numbered(67, { published: 'v7.1.0-beta.5:67', drafts: 'build-65', runs: ['Erevos+ 7.1.0-beta.5, build 67'] }), '68');
  // A build out that nothing names, written into the workflow.
  assert.equal(numbered(67, { built: '67', runs: ['erevosgram'] }), '68');
  // Several, one kept before its run names it.
  assert.equal(numbered(67, { built: '67 68', runs: ['erevosgram'] }), '69');
  assert.equal(numbered(67, { built: '62 67' }), '68');
  // Erevos Lite's builds, once its download repository is there.
  assert.equal(numbered(67, { lite: 'v3.2.0-beta.1:90' }), '91');
  assert.equal(numbered(95, { lite: 'v3.2.0-beta.1:90' }), '95');
});

test('a build whose number is not sure does not go out', () => {
  for (const fail of ['releases', 'download', 'runs', 'lite']) {
    assert.match(numbered(67, { published: 'v7.0.0-rc.10:66', fail }), /Not every build so far could be read/, fail);
  }
});

test("the Sailfish RPM's version has no -: 4.0.0~rc.1, which RPM puts before 4.0.0; and 3.x an epoch", () => {
  const at = workflow.findIndex((line) => line.trim().startsWith('sed -i "s/^Version:'));
  assert.ok(at >= 0);
  const epoch = workflow[at + 3]?.trim() ?? '';
  assert.match(epoch, /Epoch/);
  const sed = `${workflow[at].trim()}\n${epoch}`;
  const spec = (version: string) => {
    const where = join(dir, 'sailfish');
    mkdirSync(join(where, 'rpm'), { recursive: true });
    copyFileSync(join(ROOT, '..', 'sailfish', 'rpm', 'erevos.spec'), join(where, 'rpm', 'erevos.spec'));
    execFileSync('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', sed], { cwd: where, env: { ...process.env, EREVOS_VERSION: version } });
    const text = readFileSync(join(where, 'rpm', 'erevos.spec'), 'utf8');
    const name = /^Version:\s*(\S+)$/m.exec(text)?.[1];
    const marked = /^Epoch:\s*(\S+)$/m.exec(text)?.[1];
    return marked ? `${marked}:${name}` : name;
  };
  assert.equal(spec('7.2.0-rc.1'), '7.2.0~rc.1');
  assert.equal(spec('7.2.0'), '7.2.0');
  // Since 7.x the numbers start again at 3: an epoch puts them after 7.x.
  assert.equal(spec('3.0.0'), '1:3.0.0');
  assert.equal(spec('3.0.0-rc.1'), '1:3.0.0~rc.1');
  assert.equal(spec('8.0.0'), '1:8.0.0');
});
