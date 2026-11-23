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
const { withSettingsGradle } = require('expo/config-plugins');

/** The local modules Erevos Lite has not. */
const NOT_IN_LITE = ['erevos-phone', 'erevos-sms'];

const USE = 'expoAutolinking.useExpoModules()';
const MARK = '// Erevos Lite: modules left out (plugins/with-edition-modules.js)';

/** `contents` of settings.gradle with `names` left out of autolinking. */
function excluding(contents, names) {
  if (contents.includes(MARK)) return contents;
  if (!contents.includes(USE)) throw new Error(`with-edition-modules: settings.gradle has no ${USE}`);
  const list = names.map((name) => `'${name}'`).join(', ');
  return contents.replace(USE, `${MARK}\nexpoAutolinking.exclude = [${list}]\n${USE}`);
}

module.exports = function withEditionModules(config, { edition } = {}) {
  if (edition !== 'lite') return config;
  return withSettingsGradle(config, (c) => {
    c.modResults.contents = excluding(c.modResults.contents, NOT_IN_LITE);
    return c;
  });
};

module.exports.excluding = excluding;
module.exports.NOT_IN_LITE = NOT_IN_LITE;
