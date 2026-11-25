// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Erevos Lite (EREVOS_EDITION=lite, docs/editions.md) is Erevos's own chats and calls alone: the
// Phone's and the SMS's native modules are left out of its app, so neither their code nor the
// permissions their manifests ask for (calls, call log, SMS, MMS) are in it. The Collection's stays:
// chats open a file with another app and play its videos through it (lib/open-with.ts), while the
// Collection itself is not offered (lib/modules.ts). Expo's autolinking leaves out the modules
// named in `expoAutolinking.exclude`, set here in android/settings.gradle before the modules are
// found. Their JavaScript finds no native module
// (requireOptionalNativeModule), as in a browser, and lib/modules.ts never offers them.
//
// What the Collection's module brings for the Collection alone goes too: the Camera's icon among
// the phone's apps and the activity it opens (modules/erevos-collection AndroidManifest.xml), named
// here to be removed when Gradle merges the manifests. With them gone, the icons' module finds no
// Camera (modules/erevos-icons `exists`): no card for it under Launcher icons, and no Camera
// shortcut on Erevos Lite's icon.
const { withAndroidManifest, withSettingsGradle } = require('expo/config-plugins');

/** The local modules Erevos Lite has not. */
const NOT_IN_LITE = ['erevos-phone', 'erevos-sms'];

/** What the Collection's manifest declares for its camera, which Erevos Lite has not: by kind. */
const CAMERA = 'expo.modules.erevoscollection.Camera';
const CAMERA_NOT_IN_LITE = {
  activity: [`${CAMERA}OpenActivity`],
  'activity-alias': ['Activity', 'Red', 'Green', 'Blue', 'Violet', 'Dark'].map((name) => `${CAMERA}Launcher${name}`),
};
const TOOLS = 'http://schemas.android.com/tools';

const USE = 'expoAutolinking.useExpoModules()';
const MARK = '// Erevos Lite: modules left out (plugins/with-edition-modules.js)';

/** `contents` of settings.gradle with `names` left out of autolinking. */
function excluding(contents, names) {
  if (contents.includes(MARK)) return contents;
  if (!contents.includes(USE)) throw new Error(`with-edition-modules: settings.gradle has no ${USE}`);
  const list = names.map((name) => `'${name}'`).join(', ');
  return contents.replace(USE, `${MARK}\nexpoAutolinking.exclude = [${list}]\n${USE}`);
}

/**
 * The app's manifest (as expo's config plugins hold it) telling the merge to leave out each
 * component of `names` ({ activity: [...], 'activity-alias': [...] }) that a module's manifest brings.
 */
function removing(manifest, names) {
  manifest.manifest.$ = { ...manifest.manifest.$, 'xmlns:tools': TOOLS };
  const application = manifest.manifest.application[0];
  for (const [kind, list] of Object.entries(names)) {
    const kept = (application[kind] || []).filter((node) => !list.includes(node.$['android:name']));
    application[kind] = [...kept, ...list.map((name) => ({ $: { 'android:name': name, 'tools:node': 'remove' } }))];
  }
  return manifest;
}

module.exports = function withEditionModules(config, { edition } = {}) {
  if (edition !== 'lite') return config;
  const without = withSettingsGradle(config, (c) => {
    c.modResults.contents = excluding(c.modResults.contents, NOT_IN_LITE);
    return c;
  });
  return withAndroidManifest(without, (c) => {
    c.modResults = removing(c.modResults, CAMERA_NOT_IN_LITE);
    return c;
  });
};

module.exports.excluding = excluding;
module.exports.removing = removing;
module.exports.NOT_IN_LITE = NOT_IN_LITE;
module.exports.CAMERA_NOT_IN_LITE = CAMERA_NOT_IN_LITE;
