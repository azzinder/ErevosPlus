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
// module; `erevos` is the plain Erevos, with only Erevos's own chats, the Phone, the SMS and the
// Collection, its core built without the other networks; `lite` is Erevos Lite, Erevos's own chats
// and calls alone: the Phone's, the SMS's and the Collection's native code is not in its app
// (plugins/with-edition-modules.js), nor their permissions. Each is an app of its own: the plain
// Erevos app.erevos, Erevos+ app.erevos.plus (from 3.1.0; its 7.x were app.erevos), Erevos Lite
// app.erevos.lite, so all three can be on a phone, and moving from one to another hands everything
// over (lib/edition-move.ts). Kept in `extra.edition` (lib/edition.ts). Until 3.0.0 the plain Erevos
// was `lite`: a build asked for it by that name now is Erevos Lite, so every workflow says `erevos`.
// EREVOS_TELEGRAM=1 puts Telegram into Erevos+ (docs/erevosgram.md): the same package with Telegram
// (modules/erevos-telegram), marked in `extra.edition` so Check for updates takes its own APK.
const INSTALL_PACKAGES = 'android.permission.REQUEST_INSTALL_PACKAGES';
// Each edition's Android package (app/lib/update-channel.ts PACKAGES).
// EREVOS_BRIDGE=1 builds Erevos+ as app.erevos: the bridge, which the Erevos+ 7.x apps take as an
// update and which then moves to app.erevos.plus (lib/update-channel.ts wireOf).
const PACKAGES = { erevos: 'app.erevos', lite: 'app.erevos.lite', plus: process.env.EREVOS_BRIDGE === '1' ? 'app.erevos' : 'app.erevos.plus' };
const NAMES = { erevos: 'Erevos', lite: 'Erevos Lite', plus: 'Erevos+' };
// EREVOS_WEB_ORIGIN and EREVOS_START_RELAY name a community's own servers instead of LPHL's
// (lib/servers.ts): the web server with Erevos's pages and models, which Android then opens in
// Erevos for /c and /i (that server needs its own .well-known/assetlinks.json for this build's
// key), and the relay a phone with no relay yet is offered to sign in at. Left out, LPHL's.
const LPHL_WEB_HOST = 'erevos-web.lphl.nekten.eu';
const WEB_ORIGIN = /^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:[0-9]{1,5})?$/;
const START_RELAY = /^wss:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:[0-9]{1,5})?$/;

module.exports = ({ config }) => {
  const build = Number(process.env.EREVOS_BUILD || 0);
  const distribution = process.env.EREVOS_DISTRIBUTION || '';
  if (distribution && distribution !== 'fdroid') throw new Error(`EREVOS_DISTRIBUTION is "${distribution}": only "fdroid" is known`);
  const fdroid = distribution === 'fdroid';
  const edition = process.env.EREVOS_EDITION || 'plus';
  if (!(edition in PACKAGES)) throw new Error(`EREVOS_EDITION is "${edition}": only "plus", "erevos" and "lite" are known`);
  if (edition !== 'plus' && process.env.EREVOS_BRIDGE === '1') throw new Error('EREVOS_BRIDGE is only for Erevos+');
  const erevosgram = process.env.EREVOS_TELEGRAM === '1';
  if (erevosgram && fdroid) throw new Error('The F-Droid build has no Telegram: EREVOS_TELEGRAM and EREVOS_DISTRIBUTION=fdroid do not go together');
  if (erevosgram && edition !== 'plus') throw new Error('Only Erevos+ has Telegram: EREVOS_TELEGRAM goes only with EREVOS_EDITION=plus');
  const webOrigin = process.env.EREVOS_WEB_ORIGIN || '';
  if (webOrigin && !WEB_ORIGIN.test(webOrigin)) throw new Error(`EREVOS_WEB_ORIGIN is "${webOrigin}": it must be an origin, like https://erevos.example.org, with no path`);
  const startRelay = process.env.EREVOS_START_RELAY || '';
  if (startRelay && !START_RELAY.test(startRelay)) throw new Error(`EREVOS_START_RELAY is "${startRelay}": it must be a relay, like wss://relay.example.org, with no path`);
  const webHost = webOrigin ? new URL(webOrigin).host : LPHL_WEB_HOST;
  const intentFilters = (config.android?.intentFilters || []).map((filter) => ({
    ...filter,
    data: (filter.data || []).map((data) => (data.host === LPHL_WEB_HOST ? { ...data, host: webHost } : data)),
  }));
  return {
    ...config,
    // The name under the icon is the edition's: Erevos+, Erevos, or Erevos Lite.
    name: NAMES[edition],
    version: process.env.EREVOS_VERSION || config.version,
    android: {
      ...config.android,
      package: PACKAGES[edition],
      intentFilters,
      ...(build > 0 ? { versionCode: build } : {}),
      ...(fdroid
        ? {
            permissions: (config.android?.permissions || []).filter((permission) => permission !== INSTALL_PACKAGES),
            blockedPermissions: [...(config.android?.blockedPermissions || []), INSTALL_PACKAGES],
          }
        : {}),
    },
    extra: { ...config.extra, ...(build > 0 ? { build } : {}), ...(fdroid ? { distribution } : {}), ...(erevosgram ? { edition: 'erevosgram' } : edition !== 'plus' ? { edition } : {}), ...(process.env.EREVOS_BRIDGE === '1' && edition === 'plus' ? { bridge: true } : {}), ...(webOrigin ? { webOrigin } : {}), ...(startRelay ? { startRelay } : {}) },
    plugins: [...(config.plugins || []), './plugins/with-release-signing', './plugins/with-native-programs', './plugins/with-unshrunk-release', './plugins/with-no-gms-entry', './plugins/with-launcher-icons', './plugins/with-movable-views', './plugins/with-latest-intent', './plugins/with-notices', ['./plugins/with-edition-modules', { edition }], ...(edition === 'plus' ? ['./plugins/with-session-maven'] : [])],
  };
};
