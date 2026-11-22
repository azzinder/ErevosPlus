// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Session's library (libsession-util-android), which modules/erevos-messenger needs in Erevos+, is
// only in its makers' own Maven repository. A module's own repositories do not count when the app
// resolves what goes into it, so the app's build lists that repository too, for that one group only:
// nothing else is ever taken from it.
//
// That library is built with a newer Kotlin than the app's (2.1) and brings its newer kotlin-stdlib,
// which then is the one every module compiles against. The app's Kotlin reads those classes fine, as
// messenger/android's own app does, once told not to stop at their newer metadata version: so every
// Kotlin compile in the app gets -Xskip-metadata-version-check. Nothing changes in what the app does.
//
// The library also needs Android 8.0 (API 26) or newer, so Erevos+ asks for that (the plain Erevos
// keeps Expo's 24): android.minSdkVersion in gradle.properties, which Expo's version catalog reads.
const { withProjectBuildGradle, withGradleProperties } = require('expo/config-plugins');

const MARK = '// Erevos: Session\'s library, from its makers\' repository (plugins/with-session-maven.js)';
const REPOSITORY = `
${MARK}
allprojects {
  repositories {
    maven {
      url 'https://oxen.rocks/session-foundation/libsession-util-android/maven'
      content { includeGroup 'org.sessionfoundation' }
    }
  }
}
allprojects {
  tasks.configureEach { task ->
    if (task.class.name.startsWith('org.jetbrains.kotlin.gradle.tasks.KotlinCompile')) {
      task.compilerOptions.freeCompilerArgs.add('-Xskip-metadata-version-check')
    }
  }
}
`;

const MIN_SDK = '26';

module.exports = function withSessionMaven(config) {
  config = withProjectBuildGradle(config, (c) => {
    if (c.modResults.language !== 'groovy') throw new Error('with-session-maven: the project build file is not Groovy');
    if (!c.modResults.contents.includes(MARK)) c.modResults.contents += REPOSITORY;
    return c;
  });
  return withGradleProperties(config, (c) => {
    c.modResults = c.modResults.filter((item) => !(item.type === 'property' && item.key === 'android.minSdkVersion'));
    c.modResults.push({ type: 'property', key: 'android.minSdkVersion', value: MIN_SDK });
    return c;
  });
};
