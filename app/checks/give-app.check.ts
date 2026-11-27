// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Erevos to a phone nearby with no internet (lib/nearby-link.ts, lib/give-app.ts, NearbyApk.kt,
// ApkServer.kt): the QR code's link, read back only for addresses nearby and with a whole SHA-256,
// and what the Kotlin side checks before Android's installer opens.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { grouped, isNearbyHost, nearbyLink, nearbyPage, readNearbyLink } from '../lib/nearby-link';

const ROOT = join(import.meta.dirname, '..');
const KOTLIN = join(ROOT, 'modules', 'erevos-device', 'android', 'src', 'main', 'java', 'expo', 'modules', 'erevosdevice');
const read = (...parts: string[]) => readFileSync(join(...parts), 'utf8');

const TOKEN = '0123456789abcdef0123456789abcdef';
const SHA = 'ab'.repeat(32);

test('the link round-trips, and its hash is after # so a browser never sends it', () => {
  const link = { host: '192.168.43.1', port: 41234, token: TOKEN, sha256: SHA };
  const text = nearbyLink(link);
  assert.equal(text, `http://192.168.43.1:41234/${TOKEN}/#sha256=${SHA}`);
  assert.deepEqual(readNearbyLink(text), link);
  assert.deepEqual(readNearbyLink(`  ${text}\n`), link);
  assert.equal(nearbyPage(link), `http://192.168.43.1:41234/${TOKEN}/`);
});

test('only addresses of a home network or a hotspot', () => {
  for (const host of ['10.0.0.1', '172.16.0.1', '172.31.255.254', '192.168.1.20', '169.254.3.4']) assert.ok(isNearbyHost(host), host);
  for (const host of ['8.8.8.8', '172.15.0.1', '172.32.0.1', '127.0.0.1', '192.169.0.1', '192.168.1', '192.168.1.256', '1.2.3.4.5', 'erevos.example', '']) assert.ok(!isNearbyHost(host), host);
  const ok = (host: string) => readNearbyLink(`http://${host}:8080/${TOKEN}/#sha256=${SHA}`);
  assert.ok(ok('10.1.2.3'));
  assert.equal(ok('93.184.216.34'), null);
  assert.equal(ok('localhost'), null);
});

test('a link that is not whole is refused', () => {
  const bad = [
    `https://192.168.1.2:8080/${TOKEN}/#sha256=${SHA}`,
    `http://192.168.1.2/${TOKEN}/#sha256=${SHA}`,
    `http://192.168.1.2:0/${TOKEN}/#sha256=${SHA}`,
    `http://192.168.1.2:70000/${TOKEN}/#sha256=${SHA}`,
    `http://192.168.1.2:8080/${TOKEN.slice(1)}/#sha256=${SHA}`,
    `http://192.168.1.2:8080/${TOKEN.toUpperCase()}/#sha256=${SHA}`,
    `http://192.168.1.2:8080/${TOKEN}/#sha256=${SHA.slice(2)}`,
    `http://192.168.1.2:8080/${TOKEN}/`,
    `http://192.168.1.2:8080/${TOKEN}/erevos.apk#sha256=${SHA}`,
    `http://user@192.168.1.2:8080/${TOKEN}/#sha256=${SHA}`,
    'erevos-piece:abc',
  ];
  for (const text of bad) assert.equal(readNearbyLink(text), null, text);
  assert.equal(grouped('0123456789'), '0123 4567 89');
});

test('every reason the Kotlin side gives has words', () => {
  const kotlin = read(KOTLIN, 'ApkServer.kt') + read(KOTLIN, 'NearbyApk.kt');
  const lib = read(ROOT, 'lib', 'give-app.ts');
  const reasons = new Set([...kotlin.matchAll(/(?:return|->|"error" to) "([a-z-]+)"/g)].map((m) => m[1]));
  for (const given of ['split', 'network', 'unsigned']) assert.ok(reasons.has(given), given);
  for (const reason of reasons) {
    if (['split', 'unsigned', 'cancelled'].includes(reason)) continue;
    assert.ok(lib.includes(`  ${reason.includes('-') ? `'${reason}'` : reason}: () => t(`), reason);
  }
  assert.match(lib, /given\.error === 'split'/);
  assert.match(lib, /given\.error === 'network'/);
});

test('the receiving Erevos keeps only Erevos, signed as it is, not older, with the hash of the code', () => {
  const nearby = read(KOTLIN, 'NearbyApk.kt');
  const check = nearby.slice(nearby.indexOf('private fun check('));
  assert.match(check, /archive\.packageName != context\.packageName\) return "other-app"/);
  assert.match(check, /if \(theirs != signers\(mine\)\) return "other-signer"/);
  assert.match(check, /build < current\) "older"/);
  // Any reason not to keep it deletes the file before the installer could see it.
  assert.match(nearby, /if \(error != null\) \{\n\s+dest\.delete\(\)/);
  const server = read(KOTLIN, 'ApkServer.kt');
  assert.match(server, /!MessageDigest\.isEqual\(ApkServer\.hex\(digest\.digest\(\)\)\.toByteArray\(\), sha256\.toByteArray\(\)\) -> "hash"/);
  assert.match(server, /if \(!ApkServer\.isNearbyHost\(host\)/);
});

test('the giving phone serves under a random path, only nearby, a page with no script', () => {
  const nearby = read(KOTLIN, 'NearbyApk.kt');
  assert.match(nearby, /ByteArray\(16\)\.also \{ SecureRandom\(\)\.nextBytes\(it\) \}/);
  assert.match(nearby, /splitSourceDirs\.isNullOrEmpty\(\)\) return mapOf\("error" to "split"\)/);
  assert.match(nearby, /nearby\.any \{ ApkServer\.within\(peer, it\.address, it\.prefix\) \}/);
  assert.match(nearby, /private const val MINUTES = 10/);
  assert.doesNotMatch(nearby, /<script/i);
  const server = read(KOTLIN, 'ApkServer.kt');
  assert.match(server, /InetAddress\.getByName\("0\.0\.0\.0"\)/, 'IPv4 only');
  assert.match(server, /Content-Security-Policy: default-src 'none'/);
  assert.match(server, /MAX_REFUSED = 30/);
  assert.match(server, /sameToken\(path\[1\]\)/);
  // Words put in the page are escaped.
  assert.match(nearby, /fun w\(key: String\) = escape\(/);
});

test("F-Droid's build, signed with the same key, says it is F-Droid's, and an Erevos not from F-Droid asks before it installs it", () => {
  const nearby = read(KOTLIN, 'NearbyApk.kt');
  // Told by its manifest: F-Droid's build may not install packages (app.config.js).
  assert.match(read(ROOT, 'app.config.js'), /blockedPermissions: \[\.\.\.\(config\.android\?\.blockedPermissions \|\| \[\]\), INSTALL_PACKAGES\]/);
  assert.match(nearby, /private const val INSTALL_PACKAGES = "android\.permission\.REQUEST_INSTALL_PACKAGES"/);
  assert.match(nearby, /getPackageArchiveInfo\(dest\.path, PackageManager\.GET_PERMISSIONS\)/);
  assert.match(nearby, /"fdroid" to \(archive\?\.requestedPermissions\?\.contains\(INSTALL_PACKAGES\) != true\)/);
  // The receiving side asks before Android's installer opens, and keeps nothing when told no.
  const lib = read(ROOT, 'lib', 'give-app.ts');
  const take = lib.slice(lib.indexOf('export async function takeFromNearby('));
  const ask = take.indexOf('if (taken.fdroid && !FDROID && !(await askTakeFdroid())) {');
  assert.ok(ask > 0);
  assert.ok(ask < take.indexOf("startActivityAsync('android.intent.action.VIEW'"));
  assert.match(take.slice(ask), /^[^]*?apk\.delete\(\);[^]*?throw new Error\(t\('Nothing was installed\.'\)\);/);
  assert.match(lib, /t\('Cancel'\),\n\s+t\('Install'\),/);
  // The giving side says it, on its screen and on the page, only in F-Droid's build; the page's words are escaped.
  assert.match(lib, /\.\.\.\(FDROID \? \{ note: t\('This is the Erevos from F-Droid: only the F-Droid app updates it\./);
  assert.match(nearby, /\$\{if \(words\["note"\]\.isNullOrEmpty\(\)\) "" else "<p><strong>\$\{w\("note"\)\}<\/strong><\/p>\\n"\}/);
  assert.match(read(ROOT, 'app', 'give-app.tsx'), /\{FDROID \? \(\n\s+<Text variant="bodyStrong" style=\{hint\}>\n\s+\{t\('This is the Erevos from F-Droid: on the other phone too/);
});

test('the giving screen stops when left', () => {
  const screen = read(ROOT, 'app', 'give-app.tsx');
  assert.match(screen, /useEffect\(\(\) => \(\) => stopGiving\(\), \[\]\)/);
});
