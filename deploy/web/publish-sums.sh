#!/bin/sh

# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

# Signs a release's SHA256SUMS again, alone, and serves it beside the web app: after a package was
# added to the release later (release-macos.yml on a stable release, release-android.yml for an
# APK that was missing), which rewrites the list, so the signature publish.sh made no longer fits
# it. Run it on the computer that holds the release key, after the last package is in:
#
#   deploy/web/publish-sums.sh 3.0.0 user@server [private key file]
#
# It downloads the release's SHA256SUMS from the public download repository, signs it by the
# release's name (pwa/release.mjs sums; it asks for the passphrase), checks the signature, and
# puts SHA256SUMS and SHA256SUMS.sig beside the web app served now, when that is the same release's
# (a beta, published without a web app, keeps no signed list). Nothing is built here.
set -eu

version=${1:-}
target=${2:-}
key=${3:-$HOME/.erevos/web-release.key}
usage() {
	echo "usage: deploy/web/publish-sums.sh <version, e.g. 3.0.0 or 3.0.0-beta.1> <user@server> [private key file]" >&2
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
case $version in
7.*) default_repo=azzinder/erevos-releases ;;
*.2.*) default_repo=azzinder/erevos-lite-releases ;;
*) default_repo=azzinder/erevos-releases ;;
esac
repo=${EREVOS_RELEASES_REPO:-$default_repo}
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

echo "== Reading the SHA256SUMS of v$version"
base=${EREVOS_RELEASES_URL:-https://github.com/$repo/releases/download}/v$version
curl -fsSL "$base/SHA256SUMS" -o "$work/SHA256SUMS"
cat "$work/SHA256SUMS"

echo "== Signing it"
node "$root/pwa/release.mjs" sums "$work/out" "$key" "$version" "$work/SHA256SUMS"
node "$root/pwa/release.mjs" verify-sums "$work/SHA256SUMS" "$work/out/SHA256SUMS.sig"

echo "== Serving it on $target"
# Only beside that release's own web app: a beta's list must not take the place of the one signed
# for the web app served now.
served=$(ssh "$target" "cat /var/www/erevos-web/current/release.json" | node -e "let s = ''; process.stdin.on('data', (d) => (s += d)).on('end', () => console.log(JSON.parse(s).label ?? ''))")
if [ "$served" != "$version" ]; then
	echo "The web app served on $target is ${served:-unnamed}, not $version: nothing changed." >&2
	exit 1
fi
tar -C "$work/out" -cf - SHA256SUMS SHA256SUMS.sig | ssh "$target" "mkdir -p erevos-sums && tar -C erevos-sums -xf -"
ssh -t "$target" "set -e; run() { if [ \"\$(id -u)\" -eq 0 ]; then \"\$@\"; else sudo \"\$@\"; fi; }; run install -m 644 erevos-sums/SHA256SUMS erevos-sums/SHA256SUMS.sig /var/www/erevos-web/current/; rm -rf erevos-sums"
echo "== Done: verify-sums now fits the SHA256SUMS of v$version as it is on GitHub."
