// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Gradle's own download, and the plugins it fetches before it builds anything (React Native's from
// the Gradle Plugin Portal), fail now and then: on 2026-11-27 a plugin was "not found" twice on
// GitHub's machines, in a test build of the F-Droid APK and in the check build. Every build of the
// Android app fetches them first, tried four times, a plugin not found asked for again after the
// first try (Gradle remembers it otherwise); the releases do so before the release key is there, so
// that `help` configures the app as an unsigned build and that step holds no secret. On GitHub's
// machines Maven Central's files come from Google's copy of it (scripts/maven-central-mirror.gradle),
// those the Gradle Plugin Portal would send on to Maven Central too: Maven Central at times refuses
// those machines, and Gradle then looks no further down its list, not even on the Portal. F-Droid's
// own build stays with Maven Central.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const TOP = join(import.meta.dirname, '../..');
const read = (path: string) => readFileSync(join(TOP, path), 'utf8');
// Where a workflow's step starts, by its name; -1 when it has none.
const at = (workflow: string, name: string) => workflow.indexOf(`\n      - name: ${name}\n`);
// A workflow's step, from its name to the next step or job.
const step = (workflow: string, name: string) => {
  const start = at(workflow, name);
  if (start < 0) return '';
  const rest = workflow.slice(start + 1);
  const end = rest.search(/\n {6}- |\n {2}[a-z-]+:\n/);
  return end < 0 ? rest : rest.slice(0, end);
};

const FETCH = 'Fetch Gradle and its plugins';
const MIRROR = 'scripts/maven-central-mirror.gradle';
// How a workflow's Android job puts it where Gradle applies it to every build, before any Gradle runs.
const INSTALL = `install -D -m 644 "$GITHUB_WORKSPACE/${MIRROR}" ~/.gradle/init.d/maven-central-mirror.gradle`;

// The loop: Gradle, then `help`, which configures the build and builds nothing; four tries, 15, 30
// and 60 seconds apart, the plugins asked for again from the second on; failing at the end.
function assertLoop(text: string, gradle: string, arch: string, inWorkflow: boolean, where: string) {
  const lines = text.split('\n').map((line) => line.trim());
  const start = lines.indexOf('refresh=""');
  assert.ok(start >= 0, `${where}: no refresh=""`);
  // In a workflow Maven Central's files come from Google's copy, from the first Gradle on; F-Droid's
  // recipe leaves Maven Central as it is.
  if (inWorkflow) assert.equal(lines[start - 1], INSTALL, `${where}: Google's copy of Maven Central first`);
  else assert.doesNotMatch(text, /maven-central-mirror|googleapis|init\.d|init-script/, where);
  assert.deepEqual(
    lines.slice(start, start + 8),
    [
      'refresh=""',
      'for wait in 15 30 60 0; do',
      `${gradle} --version --no-daemon && ${gradle} help --no-daemon $refresh -PreactNativeArchitectures=${arch} && ${inWorkflow ? 'exit 0' : 'break'}`,
      inWorkflow ? '[ "$wait" = 0 ] && break' : '[ "$wait" = 0 ] && exit 1',
      `echo "${inWorkflow ? '::warning::' : ''}Gradle, or a plugin it needs, could not be fetched; again in $wait s"`,
      'sleep "$wait"',
      'refresh=--refresh-dependencies',
      'done',
    ],
    where,
  );
  if (inWorkflow) assert.equal(lines[start + 8], 'exit 1', `${where}: fails after the fourth try`);
}

test('the releases fetch Gradle and its plugins first, tried four times, before the release key is there', () => {
  for (const name of ['release.yml', 'release-lite.yml', 'release-android.yml']) {
    const workflow = read(`.github/workflows/${name}`);
    assert.equal(workflow.split(`- name: ${FETCH}\n`).length, 2, `${name}: one step ${FETCH}`);
    assert.equal(at(workflow, 'Fetch Gradle'), -1, `${name}: the old step is gone`);
    const fetch = step(workflow, FETCH);
    assert.match(fetch, /\n {8}working-directory: app\/android\n/, name);
    assert.doesNotMatch(fetch, /secrets\.|ANDROID_KEY/, `${name}: no secret where the plugins are fetched`);
    assertLoop(fetch, './gradlew', 'arm64-v8a', true, name);
    assert.ok(workflow.indexOf(INSTALL) < workflow.indexOf('gradlew'), `${name}: no Gradle before Google's copy`);
    // After the Android project is made, before the key is written and the APK built with it.
    const made = at(workflow, 'Generate the Android project');
    const key = at(workflow, 'Set up the release signing key');
    const built = at(workflow, 'Build the release APK');
    assert.ok(made >= 0 && key >= 0 && built >= 0, name);
    assert.ok(made < at(workflow, FETCH) && at(workflow, FETCH) < key && key < built, `${name}: ${FETCH} comes between the project and the key`);
  }
});

test('the check build fetches them the same way before it builds', () => {
  const name = 'android.yml';
  const workflow = read(`.github/workflows/${name}`);
  const fetch = step(workflow, FETCH);
  assert.ok(fetch, name);
  assert.match(fetch, /\n {8}working-directory: app\/android\n/, name);
  assertLoop(fetch, './gradlew', 'x86_64', true, name);
  assert.ok(workflow.indexOf(INSTALL) < workflow.indexOf('gradlew'), `${name}: no Gradle before Google's copy`);
  const gradle = at(workflow, 'Gradle');
  assert.ok(gradle > at(workflow, FETCH), `${name}: fetched before it builds`);
  assert.match(step(workflow, 'Gradle'), /\n {8}run: \.\/gradlew assembleDebug -PreactNativeArchitectures=x86_64 --no-daemon/, name);
});

test("the F-Droid build fetches them the same way, in F-Droid's Gradle, before it builds", () => {
  const name = 'deploy/fdroid/build.sh';
  const script = read(name);
  assertLoop(script, 'gradle', 'arm64-v8a', false, name);
  const loop = script.indexOf('refresh=""');
  const build = script.indexOf('\ngradle assembleRelease --no-daemon -PreactNativeArchitectures=arm64-v8a\n');
  assert.ok(loop > script.indexOf('\ncd android\n') && build > loop, `${name}: fetched in android/, before it builds`);
});

test("on GitHub's machines Maven Central's files come from Google's copy of it, in every build Gradle runs", () => {
  const script = read(MIRROR);
  assert.match(script, /^def mirror = 'https:\/\/maven-central\.storage-download\.googleapis\.com\/maven2\/'$/m);
  assert.match(script, /^def central = \['repo\.maven\.apache\.org', 'repo1\.maven\.org'\]$/m);
  // Every list of repositories: the settings' (their plugins' among them) and every project's.
  for (const list of [
    'settings.buildscript.repositories',
    'settings.pluginManagement.repositories',
    'settings.dependencyResolutionManagement.repositories',
    'project.buildscript.repositories',
    'project.repositories',
  ]) {
    assert.ok(script.includes(`  fromMirror(${list})\n`), `${MIRROR}: ${list}`);
  }
  assert.match(script, /repositories\.configureEach \{ repository ->\n {4}if \(repository instanceof MavenArtifactRepository && central\.contains\(repository\.url\.host\)\) \{\n {6}repository\.url = mirror\n/);
  // The Plugin Portal sends what it does not hold itself on to Maven Central. So Maven Central, which
  // the lines above move to Google's copy, comes before the Portal: for every build's settings'
  // plugins (Gradle adds the plugin repositories after the settings' buildscript ones), and for the
  // projects' plugins of a build that names no plugin repositories, where Gradle takes the Portal
  // alone. Nothing else is added, and no list that names its own is changed.
  assert.match(
    script,
    /\nbeforeSettings \{ settings ->\n(?: {2}fromMirror\(.*\)\n)+(?: {2}\/\/.*\n)* {2}settings\.buildscript\.repositories\.mavenCentral\(\)\n\}\n/,
    `${MIRROR}: the settings' plugins`,
  );
  assert.match(
    script,
    /\nsettingsEvaluated \{ settings ->\n(?: {2}\/\/.*\n)* {2}if \(settings\.pluginManagement\.repositories\.isEmpty\(\)\) \{\n {4}settings\.pluginManagement\.repositories\.mavenCentral\(\)\n {4}settings\.pluginManagement\.repositories\.gradlePluginPortal\(\)\n {2}\}\n\}\n/,
    `${MIRROR}: the projects' plugins, where no plugin repositories are named`,
  );
  assert.deepEqual(
    script.match(/\b(mavenCentral|gradlePluginPortal|google|mavenLocal|jcenter|add[A-Za-z]*)\(/g),
    ['mavenCentral(', 'mavenCentral(', 'gradlePluginPortal('],
    `${MIRROR}: nothing else added`,
  );
  // F-Droid's scanner reads every .gradle file of the source for repositories it does not know: none
  // is declared here, Maven Central's address only changes.
  assert.doesNotMatch(script, /\b(maven|ivy)\s*[({]/, `${MIRROR}: declares no repository`);

  // F-Droid's image, on GitHub's machines: the releases ask for it, the test build's first build too,
  // and its second takes Maven Central's files from Maven Central, as F-Droid does.
  for (const name of ['release.yml', 'release-lite.yml']) {
    const build = step(read(`.github/workflows/${name}`), 'Build as F-Droid builds');
    assert.match(build, /\n {8}env:\n {10}FDROID_MAVEN_MIRROR: '1'\n {8}run: scripts\/fdroid-build\.sh /, name);
  }
  const test = read('.github/workflows/fdroid-build.yml');
  assert.match(test, /- name: one\n {12}docker: ''\n {12}mirror: '1'\n/);
  assert.match(test, /- name: two\n {12}docker: --cpuset-cpus=0-1\n {12}mirror: ''\n/);
  assert.match(step(test, 'Build as F-Droid builds'), /\n {10}FDROID_MAVEN_MIRROR: \$\{\{ matrix\.mirror \}\}\n/);
  assert.ok(read('scripts/fdroid-build.sh').includes('\n  -e MAVEN_MIRROR="${FDROID_MAVEN_MIRROR:-}" \\\n'), 'fdroid-build.sh');
  const server = read('deploy/fdroid/buildserver.sh');
  const install = server.indexOf(
    `if [ -n "\${MAVEN_MIRROR:-}" ]; then\n  install -D -m 644 /source/${MIRROR} "$home_vagrant/.gradle/init.d/maven-central-mirror.gradle"\nfi\n`,
  );
  assert.ok(install >= 0, 'buildserver.sh: only when asked to');
  assert.ok(install < server.indexOf('\nchown -R vagrant "$home_vagrant"\n'), 'buildserver.sh: before vagrant gets its home');
  assert.ok(install < server.indexOf('fdroid build --verbose'), 'buildserver.sh: before fdroid build');
  // F-Droid's recipes, which F-Droid builds with Maven Central itself, do not know of it.
  for (const name of ['deploy/fdroid/app.erevos.yml', 'deploy/fdroid/app.erevos.lite.yml']) {
    assert.doesNotMatch(read(name), /maven-central-mirror|googleapis/, name);
  }
});

test("Erevos+'s release (erevosgram.yml) fetches Gradle and its plugins the same way, before its key", () => {
  const name = 'erevosgram.yml';
  const workflow = read(`.github/workflows/${name}`);
  assert.equal(workflow.split(`- name: ${FETCH}\n`).length, 2, `${name}: one step ${FETCH}`);
  assert.equal(at(workflow, 'Fetch Gradle'), -1, `${name}: the old step is gone`);
  const fetch = step(workflow, FETCH);
  assert.match(fetch, /\n {8}working-directory: app\/android\n/, name);
  assert.doesNotMatch(fetch, /secrets\.|ANDROID_KEY|EREVOS_TG/, `${name}: no secret where the plugins are fetched`);
  assertLoop(fetch, './gradlew', 'arm64-v8a', true, name);
  assert.ok(workflow.indexOf(INSTALL) < workflow.indexOf('gradlew'), `${name}: no Gradle before Google's copy`);
  const made = at(workflow, 'Generate the Android project');
  const key = at(workflow, 'Set up the release signing key');
  const built = at(workflow, 'Build the ErevosGram APK');
  assert.ok(made >= 0 && key >= 0 && built >= 0, name);
  assert.ok(made < at(workflow, FETCH) && at(workflow, FETCH) < key && key < built, `${name}: ${FETCH} comes between the project and the key`);
});
