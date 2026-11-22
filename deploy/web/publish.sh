#!/bin/sh

# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

# Serves the web app of a GitHub release (v2.0.0 and up, or v0.1.N before, made by
# .github/workflows/release.yml from the same commit as the other packages) from your own server. Run it on the computer that holds the
# release key:
#
#   deploy/web/publish.sh [--files-only] 2.0.0 user@server app.example.org [private key file]
#
# It downloads erevos-web.tar.gz from the public download repository, checks it against the
# release's SHA256SUMS and its number, signs it with the release key (default
# ~/.erevos/web-release.key; it asks for the passphrase) and puts it on the server with deploy.sh,
# which checks the server afterwards. With the same passphrase it signs the release's Android app
# too, by its build and SHA-256 (android-update.json, served beside the web app), which Check for
# updates on Android needs before it installs it. Nothing is built here. --files-only goes to
# deploy.sh.
set -eu

files_only=
if [ "${1:-}" = --files-only ]; then
	files_only=--files-only
	shift
fi
version=${1:-}
target=${2:-}
domain=${3:-}
key=${4:-$HOME/.erevos/web-release.key}
case $version in
[0-9]*.[0-9]*.[0-9]*) ;;
*)
	echo "usage: deploy/web/publish.sh [--files-only] <version, e.g. 2.0.0> <user@server> <domain> [private key file]" >&2
	exit 2
	;;
esac
if [ -z "$target" ] || [ -z "$domain" ]; then
	echo "usage: deploy/web/publish.sh [--files-only] <version, e.g. 2.0.0> <user@server> <domain> [private key file]" >&2
	exit 2
fi
if [ ! -f "$key" ]; then
	echo "No release key at $key." >&2
	exit 1
fi
root=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
repo=${EREVOS_RELEASES_REPO:-azzinder/erevos-releases}
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

echo "== Downloading the web app of v$version"
base=${EREVOS_RELEASES_URL:-https://github.com/$repo/releases/download}/v$version
curl -fsSL "$base/SHA256SUMS" -o "$work/SHA256SUMS"
curl -fsSL "$base/version.json" -o "$work/version.json"
curl -fL --progress-bar "$base/erevos-web.tar.gz" -o "$work/erevos-web.tar.gz"
if ! grep -q ' erevos-web.tar.gz$' "$work/SHA256SUMS"; then
	echo "v$version has no web app in its SHA256SUMS." >&2
	exit 1
fi
(cd "$work" && grep ' erevos-web.tar.gz$' SHA256SUMS | sha256sum -c -)
mkdir "$work/web"
tar -xzf "$work/erevos-web.tar.gz" -C "$work/web"
label=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1])).label ?? '')" "$work/web/release.json")
if [ "$label" != "$version" ]; then
	echo "The web app in v$version says it is ${label:-unnumbered}." >&2
	exit 1
fi

# A web app is made for one address and Element Call's second one (pwa/build.mjs): another
# address needs one made for it.
made_for=$(node -e "const r = JSON.parse(require('fs').readFileSync(process.argv[1])); console.log(r.origins ? r.origins.app : '')" "$work/web/release.json")
if [ -n "$made_for" ] && [ "$made_for" != "https://$domain" ]; then
	echo "This web app is made for $made_for, not https://$domain: make one for your addresses with deploy/web/release.sh and its --origin and --call-origin." >&2
	exit 1
fi

# The Android app of the same release, when it has one: its SHA-256 as SHA256SUMS has it, which
# version.json must say too, and the build version.json names.
android=
if grep -q ' erevos-android.apk$' "$work/SHA256SUMS"; then
	apk=$(grep ' erevos-android.apk$' "$work/SHA256SUMS" | cut -d' ' -f1)
	build=$(node -e "const v = JSON.parse(require('fs').readFileSync(process.argv[1])); console.log(v.apk && v.apk.sha256 === process.argv[2] ? v.build : '')" "$work/version.json" "$apk")
	if [ -z "$build" ]; then
		echo "v$version's version.json does not name the APK in its SHA256SUMS." >&2
		exit 1
	fi
	android="--android $build $apk"
fi

echo "== Signing it"
# The release's SHA256SUMS too, served beside the web app (SHA256SUMS.sig, release.mjs verify-sums).
node "$root/pwa/release.mjs" sign "$work/web" "$key" $android --sums "$work/SHA256SUMS"
node "$root/pwa/release.mjs" verify "$work/web"

"$root/deploy/web/deploy.sh" $files_only "$target" "$domain" "$work/web"
