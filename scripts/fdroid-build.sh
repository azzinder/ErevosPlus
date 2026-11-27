#!/bin/bash

# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

# Builds an edition's F-Droid APK the way F-Droid builds it, so that F-Droid's own build of the same
# commit comes out the same, byte for byte: in F-Droid's build server image, with F-Droid's
# `fdroid build` and the edition's recipe in deploy/fdroid/, in F-Droid's folder
# (/home/vagrant/build/<app>). The APK comes out unsigned; a release signs it with the release key
# and publishes it, and F-Droid, comparing its build with that one, hands out the signed APK
# (docs/reproducible-builds.md). .github/workflows/fdroid-build.yml builds one twice, on two
# machines, and compares the two.
#
#   scripts/fdroid-build.sh <erevos|lite> <version> <build number> <unsigned APK to write>
#
# It builds the checkout's last commit, not what is not committed. Needs git and Docker, about 30 GB
# of disk, and about an hour. FDROID_IMAGE names another image, FDROID_SERVER another fdroidserver
# commit, FDROID_DOCKER more options for `docker run` (such as --cpuset-cpus=0-1), FDROID_FORCE=1
# builds on when F-Droid's scanner finds a problem in the source, for a test only, and
# FDROID_MAVEN_MIRROR=1 takes Maven Central's files from Google's copy of it, as the releases do on
# GitHub's machines (scripts/maven-central-mirror.gradle); F-Droid takes the same files from Maven
# Central.

set -euo pipefail

edition=${1:?edition} version=${2:?version} build=${3:?build number} out=${4:?APK to write}
case "$edition" in
  erevos) app=app.erevos ;;
  lite) app=app.erevos.lite ;;
  *) echo "Not an edition: $edition (erevos or lite)" >&2; exit 1 ;;
esac
[[ "$build" =~ ^[1-9][0-9]*$ ]] || { echo "Not a build number: $build" >&2; exit 1; }
[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+\.[0-9]+)?$ ]] || { echo "Not a version: $version" >&2; exit 1; }

repo=$(git rev-parse --show-toplevel)
commit=$(git -C "$repo" rev-parse HEAD)
image=${FDROID_IMAGE:-registry.gitlab.com/fdroid/fdroidserver:buildserver-trixie}
# fdroidserver's master on 2026-11-26. F-Droid's own server moves with master.
server=${FDROID_SERVER:-fa7b54e637963337877cd31645d364a467f490f7}
work=$(mktemp -d)

# The recipe for this release: its version, build and commit, with this checkout as its source.
sed -e "s|'@VERSION@'|'$version'|g" -e "s|'@BUILD@'|$build|g" -e "s|'@COMMIT@'|$commit|g" \
  -e "s|^Repo: .*|Repo: /source|" -e '/^Binaries:/d' "$repo/deploy/fdroid/$app.yml" > "$work/$app.yml"
if grep -n '@VERSION@\|@BUILD@\|@COMMIT@' "$work/$app.yml"; then
  echo "The recipe still has a placeholder" >&2; exit 1
fi
echo "Building $app $version ($build) from $commit"

docker pull "$image"
docker image inspect --format 'Image: {{index .RepoDigests 0}}' "$image"
# shellcheck disable=SC2086 # FDROID_DOCKER is a list of options.
docker run --rm ${FDROID_DOCKER:-} \
  -v "$repo:/source:ro" -v "$work:/work" \
  -e APP="$app" -e BUILD="$build" -e SERVER="$server" -e FORCE="${FDROID_FORCE:-}" -e OWNER="$(id -u):$(id -g)" \
  -e MAVEN_MIRROR="${FDROID_MAVEN_MIRROR:-}" \
  "$image" bash /source/deploy/fdroid/buildserver.sh

cp "$work/out/${app}_${build}.apk" "$out"
sha256sum "$out"
