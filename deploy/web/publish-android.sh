#!/bin/sh

# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

# Signs an Android release that comes without a web app (an Erevos+ release, or a beta of either
# edition: app/lib/update-channel.ts) and serves its statement beside the web app, so that Check for
# updates installs it. Run it on the computer that holds the release key:
#
#   deploy/web/publish-android.sh 7.1.0 user@server [private key file]
#
# It downloads the release's version.json and SHA256SUMS from the public download repository,
# checks that they name the same APK and the release's name, signs the statement of the release's
# channel (version.json `channel`) with the release key (default ~/.erevos/web-release.key; it asks
# for the passphrase) into android-update-<channel>.json, and puts it on the server: beside the web
# app served now, and in /var/www/erevos-web/channels, from where deploy/web/install.sh keeps it
# beside each new web app. Nothing is built here. Erevos's own releases are signed with their web
# app (deploy/web/publish.sh).
set -eu

version=${1:-}
target=${2:-}
key=${3:-$HOME/.erevos/web-release.key}
usage() {
	echo "usage: deploy/web/publish-android.sh <version, e.g. 7.1.0 or 7.0.1-beta.1> <user@server> [private key file]" >&2
	exit 2
}
case $version in
[0-9]*.[0-9]*.[0-9]*) ;;
*) usage ;;
esac
[ -n "$target" ] || usage
if [ ! -f "$key" ]; then
	echo "No release key at $key." >&2
	exit 1
fi
root=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
# Erevos Lite's releases (3.2.x; 7.2.x was Erevos) are in a repository of their own:
# EREVOS_RELEASES_REPO says another.
case $version in
7.*) default_repo=azzinder/erevos-releases ;;
*.2.*) default_repo=azzinder/erevos-lite-releases ;;
*) default_repo=azzinder/erevos-releases ;;
esac
repo=${EREVOS_RELEASES_REPO:-$default_repo}
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

echo "== Reading v$version"
base=${EREVOS_RELEASES_URL:-https://github.com/$repo/releases/download}/v$version
curl -fsSL "$base/SHA256SUMS" -o "$work/SHA256SUMS"
curl -fsSL "$base/version.json" -o "$work/version.json"
# The channel, name, build and APK as version.json says them; the APK's SHA-256 as SHA256SUMS says it.
read_json() { node -e "const v = JSON.parse(require('fs').readFileSync(process.argv[1])); console.log(($1) ?? '')" "$work/version.json"; }
channel=$(read_json 'v.channel')
name=$(read_json 'v.name')
build=$(read_json 'v.build')
file=$(read_json "v.apk && v.apk.url.split('/').pop()")
sha=$(read_json 'v.apk && v.apk.sha256')
if [ "$name" != "$version" ]; then
	echo "v$version's version.json says it is ${name:-unnamed}." >&2
	exit 1
fi
case $channel in
erevos | erevos-beta | plus | plus-beta | erevos-plus | erevos-plus-beta | lite | lite-beta) ;;
*)
	echo "v$version's version.json names no channel (${channel:-none})." >&2
	exit 1
	;;
esac
if [ -z "$file" ] || ! grep -q " $file\$" "$work/SHA256SUMS"; then
	echo "v$version has no APK in its SHA256SUMS." >&2
	exit 1
fi
if [ "$(grep " $file\$" "$work/SHA256SUMS" | cut -d' ' -f1)" != "$sha" ]; then
	echo "v$version's version.json and SHA256SUMS name different APKs." >&2
	exit 1
fi

echo "== Signing it: $channel, $name, build $build"
node "$root/pwa/release.mjs" channel "$work" "$key" "$channel" "$name" "$build" "$sha"

echo "== Serving it on $target"
out="android-update-$channel.json"
ssh "$target" "cat > erevos-$out" < "$work/$out"
ssh -t "$target" "set -e; run() { if [ \"\$(id -u)\" -eq 0 ]; then \"\$@\"; else sudo \"\$@\"; fi; }; run mkdir -p /var/www/erevos-web/channels; run install -m 644 erevos-$out /var/www/erevos-web/channels/$out; run install -m 644 erevos-$out /var/www/erevos-web/current/$out; rm -f erevos-$out"
echo "== Done: Check for updates in the $channel channel now finds $name."
