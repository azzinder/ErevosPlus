#!/bin/bash

# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

# Runs `fdroid build` for one recipe inside F-Droid's build server image, as root, the way F-Droid's
# own check of every recipe does (fdroiddata's .gitlab-ci.yml, its job "fdroid build"): the image's
# packages brought up to date, Java 21, the newest gradlew-fdroid (F-Droid's gradle, which knows each
# Gradle version's checksum), fdroidserver from git, and the build itself run as the user vagrant in
# /home/vagrant, so the source is built in /home/vagrant/build/<app>, as on F-Droid's build server.
# scripts/fdroid-build.sh starts it with the source at /source (read only), the recipe in /work and
# APP, BUILD, SERVER (an fdroidserver commit), FORCE, MAVEN_MIRROR and OWNER set; the APK, unsigned,
# comes out in /work/out, owned by OWNER.

set -euxo pipefail

: "${APP:?}" "${BUILD:?}" "${SERVER:?}" "${OWNER:?}"
source /etc/profile.d/bsenv.sh
cat /etc/os-release

apt-get update
apt-get -y dist-upgrade
apt-get install -y openjdk-21-jdk-headless
update-alternatives --set java /usr/lib/jvm/java-21-openjdk-amd64/bin/java
git -C "$home_vagrant/gradlew-fdroid" pull

git clone https://gitlab.com/fdroid/fdroidserver.git "$fdroidserver"
git -C "$fdroidserver" checkout "$SERVER"
# The source is another user's checkout: git may read it.
git config --system --add safe.directory '*'

for d in metadata tmp unsigned logs build .android .gradle; do mkdir -p "$home_vagrant/$d"; done
cp "/work/$APP.yml" "$home_vagrant/metadata/"
# When asked to (MAVEN_MIRROR=1, as the releases ask on GitHub's machines), and unlike F-Droid:
# Maven Central's files from Google's copy of it (scripts/maven-central-mirror.gradle), the same.
if [ -n "${MAVEN_MIRROR:-}" ]; then
  install -D -m 644 /source/scripts/maven-central-mirror.gradle "$home_vagrant/.gradle/init.d/maven-central-mirror.gradle"
fi
chown -R vagrant "$home_vagrant"

force=()
[ -z "${FORCE:-}" ] || force=(--force)
cd "$home_vagrant"
status=0
sudo --preserve-env --user vagrant \
  env PATH="$fdroidserver:$(sudo --user vagrant -i printenv PATH)" \
  PYTHONPATH="$fdroidserver:$fdroidserver/examples" PYTHONUNBUFFERED=true HOME="$home_vagrant" \
  fdroid build --verbose --test --refresh-scanner --on-server --no-tarball "${force[@]}" "$APP:$BUILD" || status=$?
cat "$home_vagrant"/logs/*toolsversion.log 2> /dev/null || true

mkdir -p /work/out
if [ -f "$home_vagrant/tmp/${APP}_${BUILD}.apk" ]; then
  cp "$home_vagrant/tmp/${APP}_${BUILD}.apk" /work/out/
  sha256sum "/work/out/${APP}_${BUILD}.apk"
fi
chown -R "$OWNER" /work/out
exit "$status"
