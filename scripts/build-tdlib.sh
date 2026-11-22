#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.
#
# Builds TDLib (Telegram's own library, Boost Software License 1.0) for Android from source, with
# its JSON interface for Java (JsonClient, libtdjsonjava.so), into ./tdlib, where the ErevosGram
# build finds it (app/modules/erevos-telegram/android/build.gradle). Only the ErevosGram build needs
# it; plain Erevos has no TDLib.
#
# Needs: git, a C++ compiler, JDK 17, php, perl, gperf, make, cmake, ninja, unzip.
# Takes long the first time (Android SDK, OpenSSL, then TDLib for each ABI).
set -euo pipefail

# Pinned TDLib commit, the same as the ErevosGram app's. Change only on purpose.
TD_COMMIT="4c6377aa7386c39217878a9a56d581922ad37ca4"
ABIS="${ABIS:-arm64-v8a}"
API_LEVEL=26

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$ROOT/third-party"
mkdir -p "$WORK"
cd "$WORK"

if [ ! -d td/.git ]; then
  git init -q td
  git -C td remote add origin https://github.com/tdlib/td
fi
git -C td fetch -q --depth 1 origin "$TD_COMMIT"
git -C td checkout -q --force FETCH_HEAD

cd td/example/android
SDK="${TDLIB_ANDROID_SDK:-$WORK/android-sdk}"
[ -d "$SDK" ] || ./fetch-sdk.sh "$SDK"
[ -d third-party/openssl ] || ./build-openssl.sh "$SDK"
./build-tdlib.sh "$SDK" "" third-party/openssl c++_static JSONJava "$API_LEVEL" "$ABIS"

rm -rf "$ROOT/tdlib"
mkdir -p "$ROOT/tdlib"
cp -r tdlib/java tdlib/libs "$ROOT/tdlib/"
echo "$TD_COMMIT" > "$ROOT/tdlib/COMMIT"
echo "TDLib $TD_COMMIT is ready in $ROOT/tdlib"
