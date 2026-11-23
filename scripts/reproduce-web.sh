#!/bin/sh

# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

# Builds a release's web app again from its source and says whether every file comes out the same
# as the one published (docs/reproducible-builds.md):
#
#   scripts/reproduce-web.sh 3.3.2 [https://erevos-web.lphl.nekten.eu]
#
# It downloads erevos-web.tar.gz of that release from the public download repository and checks it
# against the release's SHA256SUMS, takes the commit, number and build its release.json and
# version.json name, builds that commit in a folder of its own with the same steps as
# .github/workflows/release.yml, and compares every file's SHA-256. Given a web app's address too,
# it compares with the release.json that server gives out, whose signature `node pwa/release.mjs
# verify <address>` checks. Needs git, Node 22, rustup and wasm-bindgen-cli at the version
# crates/erevos-ffi pins. Nothing is signed or sent anywhere.
set -eu

version=${1:-}
site=${2:-}
case $version in
[0-9]*.[0-9]*.[0-9]*) ;;
*)
	echo "usage: scripts/reproduce-web.sh <version, e.g. 3.3.2> [https://web app address]" >&2
	exit 2
	;;
esac
root=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
repo=${EREVOS_RELEASES_REPO:-azzinder/erevos-releases}
base=${EREVOS_RELEASES_URL:-https://github.com/$repo/releases/download}/v$version
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

echo "== Downloading the web app of v$version"
curl -fsSL "$base/SHA256SUMS" -o "$work/SHA256SUMS"
curl -fsSL "$base/version.json" -o "$work/version.json"
curl -fL --progress-bar "$base/erevos-web.tar.gz" -o "$work/erevos-web.tar.gz"
(cd "$work" && grep ' erevos-web.tar.gz$' SHA256SUMS | sha256sum -c -)
mkdir "$work/published"
tar -xzf "$work/erevos-web.tar.gz" -C "$work/published"
field() { node -e "const v = JSON.parse(require('fs').readFileSync(process.argv[1]))[process.argv[2]]; console.log(v ?? '')" "$1" "$2"; }
commit=$(field "$work/published/release.json" commit)
number=$(field "$work/published/release.json" version)
label=$(field "$work/published/release.json" label)
build=$(field "$work/version.json" build)
if [ "$label" != "$version" ] || [ -z "$commit" ] || [ -z "$build" ]; then
	echo "The web app of v$version does not say its commit, number and build as this expects." >&2
	exit 1
fi
echo "   commit $commit, release $number, build $build"
# The edition it was built as (docs/editions.md): Erevos+'s web app is erevosplus-web; the plain
# Erevos's is erevos-web, built without Element Call, so with no origins. One with origins and named
# erevos-web is from before the editions, which had every module, as Erevos+ has.
app=$(field "$work/published/release.json" app)
calls=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1])).origins ? 'yes' : '')" "$work/published/release.json")
if [ "$app" = erevos-web ] && [ -z "$calls" ]; then
	export EREVOS_EDITION=erevos
else
	export EREVOS_EDITION=plus
fi
echo "   edition $EREVOS_EDITION"

echo "== Building commit $commit"
git clone -q --no-checkout "$root" "$work/src"
git -C "$work/src" checkout -q "$commit"
# Until 3.0.0 the plain Erevos was built as `lite`, now Erevos Lite's name (docs/editions.md): a
# commit from before knows only plus and lite.
if [ "$EREVOS_EDITION" = erevos ] && ! grep -q "'erevos' | 'lite'" "$work/src/app/lib/edition.ts" 2>/dev/null; then
	export EREVOS_EDITION=lite
fi
if ! grep -q remap-path-prefix "$work/src/app/scripts/build-web-core.mjs"; then
	# Built before paths were left out of the core: GitHub's runner kept Rust's crates here.
	echo "   (built before paths were left out of the core: it holds the path /home/runner/.cargo, so CARGO_HOME must be that folder)"
	export CARGO_HOME=/home/runner/.cargo
	[ -f "$work/src/rust-toolchain.toml" ] || export RUSTUP_TOOLCHAIN=${RUSTUP_TOOLCHAIN:-1.99.1}
fi
(
	cd "$work/src/app"
	npm ci --no-audit --no-fund
	node scripts/build-web-core.mjs
	EREVOS_VERSION=$version EREVOS_BUILD=$build npx expo export --clear --platform web --output-dir ../web-build
	cd ..
	node pwa/build.mjs web-build erevos-web --label "$version" --version "$number" $([ -z "$calls" ] && echo --no-element-call)
) >"$work/build.log" 2>&1 || {
	tail -30 "$work/build.log" >&2
	echo "The build failed; its log is above." >&2
	exit 1
}

compare() {
	node -e '
const fs = require("fs");
const [a, b, name] = process.argv.slice(1).map((f, i) => (i < 2 ? JSON.parse(fs.readFileSync(f)).files : f));
const names = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
const differ = names.filter((n) => a[n] !== b[n]);
if (differ.length === 0) console.log(`SAME as ${name}: all ${names.length} files.`);
else {
  console.log(`DIFFERENT from ${name}, ${differ.length} of ${names.length} files:`);
  for (const n of differ) console.log(`  ${n}`);
  process.exitCode = 1;
}' "$1" "$2" "$3"
}

echo "== Comparing"
status=0
compare "$work/src/erevos-web/release.json" "$work/published/release.json" "the published erevos-web.tar.gz" || status=1
if [ -n "$site" ]; then
	curl -fsSL "${site%/}/release.json" -o "$work/served.json"
	compare "$work/src/erevos-web/release.json" "$work/served.json" "what $site serves" || status=1
fi
exit $status
