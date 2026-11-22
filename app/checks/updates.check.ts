// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Reading a release's version.json (lib/updates.ts). Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { test } from 'node:test';

import { templateFile } from './expo-template';
import { buildNumber, buildOf, DOWNLOAD_TRIES, isNewer, isReleaseFile, PACKAGE_FILES, packageFile, parseRelease, RELEASES_REPO, stalled } from '../lib/updates';

const SHA = 'a'.repeat(64);
const url = (name: string) => `https://github.com/${RELEASES_REPO}/releases/download/v0.1.7/${name}`;
const json = (over: Record<string, unknown> = {}) =>
  JSON.stringify({ version: '0.1.7', build: 7, date: '2026-10-19', apk: { url: url('erevos-android.apk'), size: 1000, sha256: SHA }, ...over });

test('a release is read with its package', () => {
  assert.deepEqual(parseRelease(json()), { version: '0.1.7', build: 7, date: '2026-10-19', apk: { url: url('erevos-android.apk'), size: 1000, sha256: SHA }, package: null });
  // The Android package it names, when one of the three editions'; anything else is not told.
  assert.equal(parseRelease(json({ package: 'app.erevos.plus' }))?.package, 'app.erevos.plus');
  assert.equal(parseRelease(json({ package: 'app.erevos.lite' }))?.package, 'app.erevos.lite');
  assert.equal(parseRelease(json({ package: 'com.other' }))?.package, null);
});

test('the version and build must agree', () => {
  assert.equal(parseRelease(json({ build: 8 })), null);
  assert.equal(parseRelease(json({ version: '1.0.7' })), null);
  assert.equal(parseRelease('not json'), null);
});

test('since 2.0.0 a release is read by its name, and Erevos 0.1.16 and before still find it', () => {
  const v2 = json({ name: '2.0.0', version: '0.1.17', build: 17 });
  assert.equal(parseRelease(v2)?.version, '2.0.0');
  assert.equal(parseRelease(v2)?.build, 17);
  assert.equal(isNewer(parseRelease(v2)!, 16), true);
  // What those versions check: a 0.1.<build> version with the same build, which the workflow writes.
  assert.equal(buildOf('0.1.17'), 17);
  const workflow = readFileSync(join(import.meta.dirname, '../../.github/workflows/release.yml'), 'utf8');
  assert.ok(workflow.includes('--arg name "$EREVOS_VERSION" --arg version "0.1.$EREVOS_BUILD" --argjson build "$EREVOS_BUILD"'));
  for (const name of ['2.0', 'v2.0.0', '2.0.0-beta', '02.0.0', 2]) {
    assert.equal(parseRelease(json({ name, version: '2.0.0', build: 17 })), null, String(name));
  }
  assert.equal(parseRelease(json({ name: '2.0.0', build: 0 })), null);
});

test('a test release such as 4.0.0-rc.1 is read by its name too', () => {
  const rc = parseRelease(json({ name: '4.0.0-rc.1', version: '0.1.45', build: 45 }));
  assert.equal(rc?.version, '4.0.0-rc.1');
  assert.equal(isNewer(rc!, 39), true);
  for (const name of ['4.0.0-RC1', '4.0.0rc1', '4.0.0-rc', '4.0.0-rc.0']) {
    assert.equal(parseRelease(json({ name, version: '2.0.0', build: 45 })), null, name);
  }
});

test("the running app's build number: apart from the version since 2.0.0, in it before", () => {
  assert.equal(buildNumber(17, '2.0.0'), 17);
  assert.equal(buildNumber(undefined, '0.1.16'), 16);
  assert.equal(buildNumber(undefined, '2.0.0'), 0);
  assert.equal(buildNumber('17', '2.0.0'), 0);
  assert.equal(buildNumber(undefined, '0.0.1'), 0);
  // app.config.js puts a release's build in extra.build and Android's versionCode.
  const config = createRequire(import.meta.url)('../app.config.js') as (c: { config: Record<string, unknown> }) => Record<string, any>;
  const env = { ...process.env };
  try {
    Object.assign(process.env, { EREVOS_BUILD: '17', EREVOS_VERSION: '2.0.0' });
    const made = config({ config: { version: '0.0.1', android: {}, extra: { other: 1 }, plugins: [] } });
    assert.equal(made.version, '2.0.0');
    assert.equal(made.android.versionCode, 17);
    assert.deepEqual(made.extra, { other: 1, build: 17 });
    delete process.env.EREVOS_BUILD;
    delete process.env.EREVOS_VERSION;
    const local = config({ config: { version: '0.0.1', android: {}, plugins: [] } });
    assert.equal(local.version, '0.0.1');
    assert.equal(local.android.versionCode, undefined);
    assert.equal(buildNumber(local.extra?.build, local.version), 0);
  } finally {
    process.env = env;
  }
});

const appJson = () => (JSON.parse(readFileSync(join(import.meta.dirname, '../app.json'), 'utf8')) as { expo: Record<string, unknown> }).expo;
const INSTALL_PACKAGES = 'android.permission.REQUEST_INSTALL_PACKAGES';

test('the F-Droid build may not install packages, and knows F-Droid updates it; the release build may; a release makes both', () => {
  const config = createRequire(import.meta.url)('../app.config.js') as (c: { config: Record<string, unknown> }) => Record<string, any>;
  const env = { ...process.env };
  try {
    delete process.env.EREVOS_DISTRIBUTION;
    const release = config({ config: appJson() });
    assert.ok(release.android.permissions.includes(INSTALL_PACKAGES));
    assert.equal(release.android.blockedPermissions, undefined);
    assert.equal(release.extra?.distribution, undefined);
    process.env.EREVOS_DISTRIBUTION = 'fdroid';
    const fdroid = config({ config: appJson() });
    assert.equal(fdroid.android.permissions.includes(INSTALL_PACKAGES), false);
    assert.deepEqual(fdroid.android.blockedPermissions, [INSTALL_PACKAGES]);
    assert.equal(fdroid.extra.distribution, 'fdroid');
    // A misspelt one fails the build rather than making the release build by mistake.
    process.env.EREVOS_DISTRIBUTION = 'f-droid';
    assert.throws(() => config({ config: appJson() }), /only "fdroid"/);
    // The ErevosGram build is marked, and never the F-Droid one.
    delete process.env.EREVOS_DISTRIBUTION;
    process.env.EREVOS_TELEGRAM = '1';
    assert.equal(config({ config: appJson() }).extra.edition, 'erevosgram');
    process.env.EREVOS_DISTRIBUTION = 'fdroid';
    assert.throws(() => config({ config: appJson() }), /no Telegram/);
  } finally {
    process.env = env;
  }
  const workflow = readFileSync(join(import.meta.dirname, '../../.github/workflows/release.yml'), 'utf8');
  // The release builds both: the APK Updates installs as the release build, and the F-Droid one,
  // signed with the same key, for F-Droid to compare with its own build of the tag.
  assert.match(workflow, /- distribution: ""\n\s+file: erevos-android\.apk\n/);
  assert.match(workflow, /- distribution: fdroid\n\s+file: erevos-android-fdroid\.apk\n/);
  assert.equal(workflow.match(/EREVOS_DISTRIBUTION:/g)?.length, 1);
  assert.match(workflow, /EREVOS_DISTRIBUTION: \$\{\{ matrix\.distribution \}\}/);
});

test("no build's manifest names Google Play services: expo-image-picker's service is taken out", async () => {
  const require = createRequire(import.meta.url);
  const config = require('../app.config.js') as (c: { config: Record<string, unknown> }) => Record<string, any>;
  assert.ok(config({ config: appJson() }).plugins.includes('./plugins/with-no-gms-entry'));
  const picker = readFileSync(join(import.meta.dirname, '../node_modules/expo-image-picker/android/src/main/AndroidManifest.xml'), 'utf8');
  const named = [...picker.matchAll(/<service\s+android:name="(com\.google\.android\.gms[^"]*)"/g)].map((found) => found[1]);
  const plugin = require('../plugins/with-no-gms-entry.js') as (c: Record<string, unknown>) => { mods: { android: { manifest: (c: unknown) => Promise<any> } } };
  const made = await plugin({ name: 'Erevos', slug: 'erevos' }).mods.android.manifest({
    modResults: { manifest: { $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' }, application: [{ $: {} }] } },
    modRequest: { platform: 'android', modName: 'manifest' },
    modRawConfig: {},
  });
  const manifest = made.modResults.manifest;
  assert.equal(manifest.$['xmlns:tools'], 'http://schemas.android.com/tools');
  const removed = (manifest.application[0].service as { $: Record<string, string> }[]).filter((service) => service.$['tools:node'] === 'remove').map((service) => service.$['android:name']);
  // Whatever service of Google's the picker names now, the merged manifest leaves it out.
  for (const name of named) assert.ok(removed.includes(name), name);
});

test("React Native's plain views come from modules/erevos-views, put first in MainApplication", async () => {
  const require = createRequire(import.meta.url);
  const config = require('../app.config.js') as (c: { config: Record<string, unknown> }) => Record<string, any>;
  assert.ok(config({ config: appJson() }).plugins.includes('./plugins/with-movable-views'));
  const plugin = require('../plugins/with-movable-views.js') as (c: Record<string, unknown>) => { mods: { android: { mainApplication: (c: unknown) => Promise<any> } } };
  const made = async (contents: string) =>
    (await plugin({ name: 'Erevos', slug: 'erevos' }).mods.android.mainApplication({
      modResults: { language: 'kt', contents },
      modRequest: { platform: 'android', modName: 'mainApplication' },
      modRawConfig: {},
    })).modResults.contents as string;
  const template = templateFile('/MainApplication.kt');
  const once = await made(template);
  // First of the packages, before React Native's own (PackageList's MainReactPackage).
  assert.match(once, /PackageList\(this\)\.packages\.apply \{\n\s+add\(0, expo\.modules\.erevosviews\.MovableViewsPackage\(\)\)\n/);
  assert.equal(await made(once), once);
  await assert.rejects(made(template.replace('PackageList(this).packages.apply {', 'PackageList(this).packages')), /no "PackageList/);
  // The view it gives is React Native's View, by its name.
  const kotlin = readFileSync(join(import.meta.dirname, '../modules/erevos-views/android/src/main/java/expo/modules/erevosviews/MovableViews.kt'), 'utf8');
  assert.match(kotlin, /class MovableViewManager : ReactViewManager\(\)/);
  assert.match(kotlin, /listOf\(ReactViewManager\.REACT_CLASS\)/);
});

test('a package from anywhere else, or without its SHA-256, is not offered', () => {
  for (const apk of [
    { url: 'https://example.com/erevos.apk', size: 1, sha256: SHA },
    { url: `https://github.com/${RELEASES_REPO}/releases/download/../../other/x.apk`, size: 1, sha256: SHA },
    { url: url('erevos-android.apk'), size: 1 },
    { url: url('erevos-android.apk'), size: 0, sha256: SHA },
  ]) {
    assert.equal(parseRelease(json({ apk }))?.apk, null, JSON.stringify(apk));
  }
  assert.equal(isReleaseFile(`https://github.com/${RELEASES_REPO}/releases/download/%2e%2e/%2e%2e/x/y`), false);
  assert.equal(isReleaseFile(`http://github.com/${RELEASES_REPO}/releases/download/v1/x`), false);
});

test('only a newer build of a release is offered, never to a build from a computer', () => {
  // The ErevosGram build takes only its own APK.
  assert.equal(parseRelease(json(), undefined, 'erevosgram')?.apk, null);
  assert.equal(parseRelease(json({ erevosgram: { url: url('erevosgram-android.apk'), size: 9, sha256: SHA } }), undefined, 'erevosgram')?.apk?.url, url('erevosgram-android.apk'));
  const release = parseRelease(json())!;
  assert.equal(buildOf('0.1.7'), 7);
  assert.equal(buildOf('0.0.1'), 0);
  assert.equal(isNewer(release, 6), true);
  assert.equal(isNewer(release, 7), false);
  assert.equal(isNewer(release, 0), false);
});

test('a computer is told the file of its own package, as the release names it', () => {
  assert.equal(packageFile('electron', 'windows'), 'erevos-windows-x64-setup.exe');
  assert.equal(packageFile('electron', 'windows-portable'), 'erevos-windows-x64-portable.exe');
  assert.equal(packageFile('electron', 'linux-appimage'), 'erevos-linux-x86_64.AppImage');
  assert.equal(packageFile('sailfish', ''), 'erevos-sailfish-aarch64.rpm');
  // A shell that does not say, or says something else, gets the general note.
  assert.equal(packageFile('electron', ''), null);
  assert.equal(packageFile('electron', 'constructor'), null);
  assert.equal(packageFile(null, 'windows'), null);
  // Each is a file the release workflow publishes, and desktop/main.js says each name.
  const workflow = readFileSync(join(import.meta.dirname, '../../.github/workflows/release.yml'), 'utf8');
  const shell = readFileSync(join(import.meta.dirname, '../../desktop/main.js'), 'utf8');
  for (const [system, file] of PACKAGE_FILES) {
    assert.ok(workflow.includes(file), file);
    assert.ok(shell.includes(`'${system}'`), system);
  }
});

test('a download whose connection stalls or breaks is tried again; one that cannot work is not', () => {
  // As Android gives them for the APK's download (expo-file-system over OkHttp).
  for (const message of [
    "Call to function 'FileSystem.downloadFileAsync' has been rejected.\n→ Caused by: java.net.SocketTimeoutException: timeout",
    'java.net.SocketTimeoutException: Read timed out',
    'java.net.SocketException: Connection reset',
    'java.io.IOException: unexpected end of stream on https://github.com/...',
    'okhttp3.internal.http2.StreamResetException: stream was reset: CANCEL',
  ]) {
    assert.equal(stalled(new Error(message)), true, message);
  }
  for (const message of ['java.net.UnknownHostException: Unable to resolve host "github.com"', 'No space left on device', 'Response code 404']) {
    assert.equal(stalled(new Error(message)), false, message);
  }
  assert.equal(stalled('java.net.SocketTimeoutException: timeout'), true);
  assert.equal(stalled(null), false);
  assert.ok(DOWNLOAD_TRIES >= 2);
});
