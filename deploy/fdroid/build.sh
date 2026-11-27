#!/bin/bash

# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

# The build step of the F-Droid recipes beside it (app.erevos.yml, app.erevos.lite.yml): what
# F-Droid's `fdroid build` runs in its build server, from the top of the checkout, once the
# recipe's sudo step has put Node in /opt/node and Debian's compilers, Go, rustup and Java 17
# beside Java 21. It leaves the APK, unsigned, where the recipe's output names it:
# app/android/app/build/outputs/apk/release/app-release-unsigned.apk.
# scripts/fdroid-build.sh runs the same recipe the same way for a release, which then signs it.
#
#   deploy/fdroid/build.sh <erevos|lite> <version> <build number>

set -euo pipefail

edition=${1:?edition} version=${2:?version} build=${3:?build number}
case "$edition" in
  erevos | lite) ;;
  *) echo "Not an edition: $edition (erevos or lite)" >&2; exit 1 ;;
esac
cd "$(dirname "$0")/../.."

# Expo's template for the Android project, by its exact version, so a template Expo publishes
# later for the same SDK changes nothing in this build. It moves with Expo's SDK, by hand.
template=expo-template-bare-minimum@58.0.36

export PATH="/opt/node/bin:$HOME/.cargo/bin:$PATH"
if ! command -v cargo > /dev/null && [ -x /usr/lib/rustup/bin/cargo ]; then
  export PATH="/usr/lib/rustup/bin:$PATH"
fi

# The app as app.config.js makes it for F-Droid: this edition, F-Droid's (no Check for updates,
# no permission to install packages), this release's version and build, unsigned.
export EREVOS_EDITION=$edition EREVOS_DISTRIBUTION=fdroid EREVOS_VERSION=$version EREVOS_BUILD=$build EREVOS_UNSIGNED=1
export EXPO_NO_TELEMETRY=1 EXPO_NO_GIT_STATUS=1
# Whatever reads the time reads the commit's.
SOURCE_DATE_EPOCH=$(git log -1 --pretty=%ct)
export SOURCE_DATE_EPOCH

# Go as transports/go.mod names it: Debian's Go fetches that one, checked against Go's checksum
# database, to build lyrebird (app/modules/erevos-core/android/build.gradle).
GOTOOLCHAIN=go$(sed -n 's/^go //p' transports/go.mod)
export GOTOOLCHAIN GOPROXY=https://proxy.golang.org,direct GOSUMDB=sum.golang.org
# Rust as rust-toolchain.toml names it, for 64-bit ARM phones, and cargo-ndk, as the releases use.
rustup toolchain install "$(sed -n 's/^channel = "\(.*\)"$/\1/p' rust-toolchain.toml)" --profile minimal --target aarch64-linux-android
cargo install cargo-ndk --version 4.1.2 --locked
node --version
go version
cargo --version

cd app
npm ci
# Each of Expo's modules from its source, not the library its npm package carries built.
node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync("package.json", "utf8"));
const autolinking = p.expo?.autolinking ?? {};
p.expo = { ...p.expo, autolinking: { ...autolinking, android: { ...autolinking.android, buildFromSource: [".*"] } } };
fs.writeFileSync("package.json", JSON.stringify(p, null, 2) + "\n");
'
npx expo prebuild --platform android --no-install --template "$template"

cd android
# Gradle's own download, and the plugins it fetches before it builds anything (React Native's from
# the Gradle Plugin Portal), fail now and then: tried four times. `help` builds nothing. Gradle
# remembers a plugin it did not find, so a try after the first asks for each again.
refresh=""
for wait in 15 30 60 0; do
  gradle --version --no-daemon && gradle help --no-daemon $refresh -PreactNativeArchitectures=arm64-v8a && break
  [ "$wait" = 0 ] && exit 1
  echo "Gradle, or a plugin it needs, could not be fetched; again in $wait s"
  sleep "$wait"
  refresh=--refresh-dependencies
done
gradle assembleRelease --no-daemon -PreactNativeArchitectures=arm64-v8a
sha256sum app/build/outputs/apk/release/app-release-unsigned.apk
