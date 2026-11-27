// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// F-Droid's recipes for Erevos and Erevos Lite (deploy/fdroid/), from which scripts/fdroid-build.sh
// builds the F-Droid APK the way F-Droid does, in each release with no key at hand, which then signs
// it: each names its own app, edition and download, the release key every Android release is
// signed with (README.md), the NDK React Native builds with,
// one Node, checked by its SHA-256, and placeholders that scripts/fdroid-build.sh fills in;
// deploy/fdroid/build.sh takes Expo's template of the SDK the app is on; and scripts/fdroid-sign.sh
// signs the APK as Gradle signs the release APK, changing nothing else, which the twin builds of
// .github/workflows/fdroid-build.yml check as F-Droid does. Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const TOP = join(import.meta.dirname, '../..');
const read = (path: string) => readFileSync(join(TOP, path), 'utf8');
const field = (text: string, name: string) => text.match(new RegExp(`^${name}: (.+)$`, 'm'))?.[1];
// A script's or a workflow's lines without their comments.
const code = (text: string) => text.split('\n').filter((line) => !line.trim().startsWith('#')).join('\n');
// A workflow's job, from its name to the next job.
const job = (workflow: string, name: string) => workflow.match(new RegExp(`\\n  ${name}:\\n[\\s\\S]*?(?=\\n  [a-z-]+:\\n|$)`))?.[0] ?? '';

const RECIPES = [
  { app: 'app.erevos', edition: 'erevos', name: 'Erevos', repo: 'erevos-releases', file: 'erevos-android-fdroid.apk', workflow: 'release.yml' },
  { app: 'app.erevos.lite', edition: 'lite', name: 'Erevos Lite', repo: 'erevos-lite-releases', file: 'erevos-lite-android-fdroid.apk', workflow: 'release-lite.yml' },
];

test("each recipe names its own app, edition and download, and the release key", () => {
  const readme = read('README.md');
  const key = readme.match(/^((?:[0-9A-F]{2}:){31}[0-9A-F]{2})$/m)?.[1];
  assert.ok(key, "README.md names the release key's SHA-256");
  for (const { app, edition, name, repo, file, workflow } of RECIPES) {
    const recipe = read(`deploy/fdroid/${app}.yml`);
    assert.equal(field(recipe, 'AutoName'), name, app);
    assert.equal(field(recipe, 'Repo'), 'https://github.com/azzinder/Erevos.git', app);
    assert.equal(field(recipe, 'Binaries'), `https://github.com/azzinder/${repo}/releases/download/v%v/${file}`, app);
    // The release workflow builds the F-Droid APK with this recipe, with no secret in that job,
    // then signs it with the release key under the file name the recipe downloads.
    const release = read(`.github/workflows/${workflow}`);
    const build = job(release, 'fdroid'), sign = job(release, 'fdroid-sign');
    assert.match(build, new RegExp(`\\n\\s+run: scripts/fdroid-build\\.sh ${edition} "\\$EREVOS_VERSION" "\\$EREVOS_BUILD" fdroid-unsigned\\.apk\\n`), app);
    assert.doesNotMatch(build, /secrets\./, app);
    assert.match(sign, new RegExp(`\\n\\s+APK: ${file.replace(/\./g, '\\.')}\\n`), app);
    assert.match(sign, /\n\s+ANDROID_KEYSTORE="\$RUNNER_TEMP\/release\.keystore" scripts\/fdroid-sign\.sh fdroid-unsigned\.apk "\$APK"/, app);
    assert.equal(field(recipe, 'AllowedAPKSigningKeys'), key.replace(/:/g, '').toLowerCase(), app);
    assert.match(recipe, new RegExp(`^      - deploy/fdroid/build\\.sh ${edition} \\$\\$VERSION\\$\\$ \\$\\$VERCODE\\$\\$$`, 'm'), app);
    assert.match(recipe, /^    output: app\/android\/app\/build\/outputs\/apk\/release\/app-release-unsigned\.apk$/m, app);
  }
});

test('the recipes build with the NDK React Native names, one Node checked by its SHA-256, and placeholders the build fills in', () => {
  const ndk = read('app/node_modules/react-native/gradle/libs.versions.toml').match(/^ndkVersion = "([^"]+)"$/m)?.[1];
  assert.ok(ndk);
  const recipes = RECIPES.map(({ app }) => read(`deploy/fdroid/${app}.yml`));
  const builds = recipes.map((recipe) => recipe.slice(recipe.indexOf('\nBuilds:\n'), recipe.indexOf('\nAllowedAPKSigningKeys:')));
  // Both build the same way: the build entries differ only in the edition.
  assert.equal(builds[0].replace(' erevos ', ' lite '), builds[1]);
  const recipe = recipes[0];
  assert.match(recipe, new RegExp(`^    ndk: ${ndk.replace(/\./g, '\\.')}$`, 'm'));
  const node = recipe.match(/nodejs\.org\/dist\/v(\d+\.\d+\.\d+)\/node-v\1-linux-x64\.tar\.gz/)?.[1];
  assert.ok(node, 'Node from nodejs.org, by its exact version');
  assert.match(recipe.replace(/\n\s+/g, ' '), /echo '[0-9a-f]{64} {2}\/tmp\/node\.tar\.gz' \| sha256sum -c -/);
  assert.match(recipe, new RegExp(`mv /opt/node-v${node.replace(/\./g, '\\.')}-linux-x64 /opt/node`));
  for (const text of recipes) {
    for (const placeholder of ["versionName: '@VERSION@'", "versionCode: '@BUILD@'", "commit: '@COMMIT@'", "CurrentVersion: '@VERSION@'", "CurrentVersionCode: '@BUILD@'"]) {
      assert.ok(text.includes(placeholder), placeholder);
    }
  }
  // scripts/fdroid-build.sh fills in each, the build number without its quotes.
  const script = read('scripts/fdroid-build.sh');
  for (const replace of [`s|'@VERSION@'|'$version'|g`, `s|'@BUILD@'|$build|g`, `s|'@COMMIT@'|$commit|g`]) assert.ok(script.includes(replace), replace);
});

test("the build takes Expo's template of the SDK the app is on, by its exact version", () => {
  const sdk = JSON.parse(read('app/package.json')).dependencies.expo.match(/(\d+)\.\d+\.\d+/)?.[1];
  assert.ok(sdk);
  assert.match(read('deploy/fdroid/build.sh'), new RegExp(`^template=expo-template-bare-minimum@${sdk}\\.\\d+\\.\\d+$`, 'm'));
});

test('the APK is signed as the release APK is, nothing else changed, and the twin builds check it as F-Droid does', () => {
  // APK Signature Scheme v2 alone, as Gradle signs from Android 7 (SDK 24) up, the oldest the app runs on.
  const min = Number(read('app/node_modules/react-native/gradle/libs.versions.toml').match(/^minSdk = "(\d+)"$/m)?.[1]);
  assert.ok(min >= 24, `minSdk ${min}`);
  const sign = read('scripts/fdroid-sign.sh');
  assert.match(sign, /--alignment-preserved true --v1-signing-enabled false --v2-signing-enabled true --v3-signing-enabled false \\\n\s+--v4-signing-enabled false /);
  // Only the SDK's apksigner sees the key: nothing from outside the runner runs beside it.
  const fetches = /\b(?:apksigcopier|pip3?|npm|npx|curl|wget)\b/;
  assert.doesNotMatch(code(sign), fetches);
  // apksigcopier, and click, which it needs, by their SHA-256, wherever a signed F-Droid APK is checked.
  const requirements = read('scripts/apksigcopier-requirements.txt');
  for (const name of ['apksigcopier', 'click']) assert.match(requirements, new RegExp(`^${name}==[\\d.]+ --hash=sha256:[0-9a-f]{64}$`, 'm'));
  const pinned = '/venv/bin/pip" install --quiet --require-hashes --no-deps --only-binary :all: -r scripts/apksigcopier-requirements.txt';
  // The twin builds: the first signed with a key made for the test, nothing but its signature
  // added, and that signature, copied onto the second, must verify.
  const twins = read('.github/workflows/fdroid-build.yml');
  assert.ok(twins.includes(pinned));
  assert.match(twins, /scripts\/fdroid-sign\.sh unsigned-one\.apk signed-one\.apk\n(?:\s+#.*\n)?\s+apksigcopier compare --unsigned signed-one\.apk unsigned-one\.apk\n\s+apksigcopier compare --unsigned signed-one\.apk unsigned-two\.apk\n/);
  // A release: the key in the one step that signs, apksigcopier installed only after it, to check
  // that the signature alone was added.
  for (const { workflow } of RECIPES) {
    const steps = job(read(`.github/workflows/${workflow}`), 'fdroid-sign').split(/\n {6}- /);
    const signing = steps.findIndex((step) => step.includes('secrets.ANDROID_KEYSTORE_BASE64'));
    const checking = steps.findIndex((step) => step.includes(pinned));
    assert.ok(signing > 0 && checking > signing, workflow);
    assert.equal(steps.filter((step) => step.includes('secrets.')).length, 1, workflow);
    assert.doesNotMatch(code(steps[signing]), fetches, workflow);
    assert.match(steps[checking], /\n\s+apksigcopier compare --unsigned "\$APK" fdroid-unsigned\.apk\n/, workflow);
  }
});
