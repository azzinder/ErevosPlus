// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The app's settings are in app.json; this adds what a build changes. The release workflow
// (.github/workflows/release.yml) sets EREVOS_VERSION (2.0.0 and up) and EREVOS_BUILD (the run's
// number, or above it when an Erevos+ build took it: it goes up with every build of either), so
// each release has its own version and Android installs it over the one before; Updates (app/updates.tsx) reads the build in `extra`. A build on a
// computer without them keeps app.json's version and has no build number.
// EREVOS_DISTRIBUTION=fdroid makes the F-Droid build: F-Droid updates it, so it has no Check for
// updates (lib/distribution.ts) and may not install packages. The release workflow does not set it.
// EREVOS_EDITION picks the edition (docs/editions.md): `plus` (the default) is Erevos+, with every
// module; `lite` is the plain Erevos, with only Erevos's own chats, the Phone, the SMS and the
// Collection, its core built without the other networks. Each is an app of its own: the plain Erevos
// app.erevos, Erevos+ app.erevos.plus (from 3.1.0; its 7.x were app.erevos), so both can be on a
// phone, and moving from one to the other hands everything over (lib/edition-move.ts). Kept in
// `extra.edition` (lib/edition.ts).
// EREVOS_TELEGRAM=1 puts Telegram into Erevos+ (docs/erevosgram.md): the same package with Telegram
// (modules/erevos-telegram), marked in `extra.edition` so Check for updates takes its own APK.
const INSTALL_PACKAGES = 'android.permission.REQUEST_INSTALL_PACKAGES';
// Each edition's Android package (app/lib/update-channel.ts PACKAGES).
// EREVOS_BRIDGE=1 builds Erevos+ as app.erevos: the bridge, which the Erevos+ 7.x apps take as an
// update and which then moves to app.erevos.plus (lib/update-channel.ts wireOf).
const PACKAGES = { lite: 'app.erevos', plus: process.env.EREVOS_BRIDGE === '1' ? 'app.erevos' : 'app.erevos.plus' };

module.exports = ({ config }) => {
  const build = Number(process.env.EREVOS_BUILD || 0);
  const distribution = process.env.EREVOS_DISTRIBUTION || '';
  if (distribution && distribution !== 'fdroid') throw new Error(`EREVOS_DISTRIBUTION is "${distribution}": only "fdroid" is known`);
  const fdroid = distribution === 'fdroid';
  const edition = process.env.EREVOS_EDITION || 'plus';
  if (edition !== 'plus' && edition !== 'lite') throw new Error(`EREVOS_EDITION is "${edition}": only "plus" and "lite" are known`);
  const erevosgram = process.env.EREVOS_TELEGRAM === '1';
  if (erevosgram && fdroid) throw new Error('The F-Droid build has no Telegram: EREVOS_TELEGRAM and EREVOS_DISTRIBUTION=fdroid do not go together');
  if (erevosgram && edition === 'lite') throw new Error('The plain Erevos has no Telegram: EREVOS_TELEGRAM and EREVOS_EDITION=lite do not go together');
  return {
    ...config,
    // The name under the icon is the edition's: Erevos+, or Erevos for the plain one.
    name: edition === 'lite' ? 'Erevos' : 'Erevos+',
    version: process.env.EREVOS_VERSION || config.version,
    android: {
      ...config.android,
      package: PACKAGES[edition],
      ...(build > 0 ? { versionCode: build } : {}),
      ...(fdroid
        ? {
            permissions: (config.android?.permissions || []).filter((permission) => permission !== INSTALL_PACKAGES),
            blockedPermissions: [...(config.android?.blockedPermissions || []), INSTALL_PACKAGES],
          }
        : {}),
    },
    extra: { ...config.extra, ...(build > 0 ? { build } : {}), ...(fdroid ? { distribution } : {}), ...(erevosgram ? { edition: 'erevosgram' } : edition === 'lite' ? { edition } : {}), ...(process.env.EREVOS_BRIDGE === '1' && edition === 'plus' ? { bridge: true } : {}) },
    plugins: [...(config.plugins || []), './plugins/with-release-signing', './plugins/with-native-programs', './plugins/with-unshrunk-release', './plugins/with-no-gms-entry', './plugins/with-launcher-icons', './plugins/with-movable-views', './plugins/with-latest-intent', './plugins/with-notices', ...(edition === 'plus' ? ['./plugins/with-session-maven'] : [])],
  };
};
