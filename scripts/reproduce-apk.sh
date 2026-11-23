#!/bin/sh

# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

# Builds a release's Android app again from its source and says whether it comes out the same as
# the published APK, apart from the signature (docs/reproducible-builds.md):
#
#   scripts/reproduce-apk.sh 3.3.2
#
# It downloads erevos-android.apk of that release from the public download repository and checks
# it against the release's SHA256SUMS, takes the commit and build version.json names, builds that
# commit unsigned with the same steps as the apk job of .github/workflows/release.yml, then copies
# the published APK's signature onto the one built here and checks that it verifies
# (apksigcopier compare, as F-Droid does): it verifies only if every other byte is the same.
#
# Needs what that job needs (Node 22, Java 21, rustup with cargo-ndk 4.1.2, Go, the Android SDK
# with ANDROID_HOME set) and apksigcopier (pip install apksigcopier). The C++ of React Native's
# modules keeps the paths it was built at, so build in the same folder as GitHub's runner did
# (/home/runner/work/Erevos/Erevos); .github/workflows/reproduce-apk.yml does. Nothing is signed
# or sent anywhere.
set -eu

version=${1:-}
case $version in
[0-9]*.[0-9]*.[0-9]*) ;;
*)
	echo "usage: scripts/reproduce-apk.sh <version, e.g. 3.3.2> [folder to build in]" >&2
	exit 2
	;;
esac
root=$(git -C "$(dirname "$0")" rev-parse --show-toplevel 2>/dev/null || git -C "${2:-.}" rev-parse --show-toplevel)
# Erevos Lite's releases (3.2.x; 7.2.x was Erevos) are in a repository of their own, with their own APK.
apk=erevos-android.apk
default_repo=azzinder/erevos-releases
case $version in
7.*) ;;
*.2.*)
	default_repo=azzinder/erevos-lite-releases
	apk=erevos-lite-android.apk
	export EREVOS_EDITION=lite
	;;
esac
repo=${EREVOS_RELEASES_REPO:-$default_repo}
base=${EREVOS_RELEASES_URL:-https://github.com/$repo/releases/download}/v$version
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
src=${2:-$work/src}

echo "== Downloading the Android app of v$version"
curl -fsSL "$base/SHA256SUMS" -o "$work/SHA256SUMS"
curl -fsSL "$base/version.json" -o "$work/version.json"
curl -fL --progress-bar "$base/$apk" -o "$work/erevos-android.apk"
(cd "$work" && grep " $apk\$" SHA256SUMS | sed "s/ $apk\$/ erevos-android.apk/" | sha256sum -c -)
field() { node -e "const v = JSON.parse(require('fs').readFileSync(process.argv[1]))[process.argv[2]]; console.log(v ?? '')" "$1" "$2"; }
commit=$(field "$work/version.json" commit)
build=$(field "$work/version.json" build)
if [ -z "$commit" ] || [ -z "$build" ]; then
	echo "version.json of v$version does not say its commit and build." >&2
	exit 1
fi
echo "   commit $commit, build $build"

echo "== Building commit $commit in $src"
if [ "$src" != "$(git -C "$src" rev-parse --show-toplevel 2>/dev/null)" ]; then
	git clone -q --no-checkout "$root" "$src"
fi
cp "$root/app/plugins/with-release-signing.js" "$work/"
git -C "$src" checkout -q "$commit"
# Until 3.0.0 the plain Erevos was built as `lite`, now Erevos Lite's name (docs/editions.md): a
# commit from before knows only plus and lite.
if [ "${EREVOS_EDITION:-}" = erevos ] && ! grep -q "'erevos' | 'lite'" "$src/app/lib/edition.ts" 2>/dev/null; then
	export EREVOS_EDITION=lite
fi
if ! grep -q EREVOS_UNSIGNED "$src/app/plugins/with-release-signing.js"; then
	# Made before it could build unsigned: only how Gradle signs changes, not what goes in the APK.
	cp "$work/with-release-signing.js" "$src/app/plugins/"
fi
(
	export EXPO_NO_TELEMETRY=1
	cd "$src/app"
	npm ci --no-audit --no-fund
	EREVOS_VERSION=$version EREVOS_BUILD=$build npx expo prebuild --platform android --no-install
	cd android
	EREVOS_VERSION=$version EREVOS_BUILD=$build EREVOS_UNSIGNED=1 \
		./gradlew assembleRelease --no-daemon -PreactNativeArchitectures=arm64-v8a
) >"$work/build.log" 2>&1 || {
	tail -40 "$work/build.log" >&2
	echo "The build failed; its log is above." >&2
	exit 1
}
built=$(ls "$src"/app/android/app/build/outputs/apk/release/*.apk | head -1)

echo "== Comparing"
# apksigcopier calls apksigner, from the Android SDK's newest build-tools.
if ! command -v apksigner >/dev/null 2>&1 && [ -n "${ANDROID_HOME:-}" ]; then
	PATH="$ANDROID_HOME/build-tools/$(ls "$ANDROID_HOME/build-tools" | sort -V | tail -1):$PATH"
fi
if apksigcopier compare --unsigned "$work/erevos-android.apk" "$built"; then
	echo "SAME as the published erevos-android.apk, apart from its signature."
else
	echo "DIFFERENT from the published erevos-android.apk. The files inside that differ:" >&2
	# Leaves out the signature files; for each file that differs, a few of the strings only one has.
	python3 -I - "$work/erevos-android.apk" "$built" >&2 <<'EOF' || true
import re, sys, zipfile
a, b = (zipfile.ZipFile(p) for p in sys.argv[1:3])
ia = {i.filename: i for i in a.infolist() if not i.filename.startswith("META-INF/")}
ib = {i.filename: i for i in b.infolist() if not i.filename.startswith("META-INF/")}
for name in sorted(set(ia) - set(ib)): print(f"  only published: {name}")
for name in sorted(set(ib) - set(ia)): print(f"  only rebuilt:   {name}")
order = [n for n in ia if n in ib] != [n for n in ib if n in ia]
if order: print("  the files are in a different order")
strings = lambda data: set(re.findall(rb"[\x20-\x7e]{8,}", data))
for name in sorted(set(ia) & set(ib)):
    x, y = ia[name], ib[name]
    if (x.CRC, x.file_size) == (y.CRC, y.file_size):
        if (x.compress_type, x.date_time, x.external_attr) != (y.compress_type, y.date_time, y.external_attr):
            print(f"  {name}: same content, different zip entry ({x.compress_type},{x.date_time} / {y.compress_type},{y.date_time})")
        continue
    print(f"  {name}: {x.file_size} / {y.file_size} bytes")
    da, db = a.read(name), b.read(name)
    first = next((i for i, (p, q) in enumerate(zip(da, db)) if p != q), min(len(da), len(db)))
    print(f"    first difference at byte {first}")
    sa, sb = strings(da), strings(db)
    for s in sorted(sa - sb)[:6]: print(f"    published: {s[:160].decode()}")
    for s in sorted(sb - sa)[:6]: print(f"    rebuilt:   {s[:160].decode()}")
EOF
	mkdir -p compared
	cp "$built" compared/erevos-android-rebuilt.apk
	cp "$work/erevos-android.apk" compared/erevos-android-published.apk
	echo "  compared/erevos-android-published.apk compared/erevos-android-rebuilt.apk" >&2
	exit 1
fi
