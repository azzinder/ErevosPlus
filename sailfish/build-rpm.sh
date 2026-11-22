#!/bin/bash

# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

# Builds the aarch64 RPM in the Sailfish SDK image, from sailfish/. After the RPM, mb2 looks for
# it by the spec's name and version to check it; with an Epoch (3.x and on, the release
# workflows) it finds none and fails with "None of the selected test suites…" although the RPM
# was written. Only that failure, with the RPM there, counts as built.
set -u
log=$(mktemp)
docker run --rm -v "$PWD:/home/mersdk/src" -w /home/mersdk/src \
  coderus/sailfishos-platform-sdk-aarch64:5.0.0.43 \
  bash -lc 'mb2 -t SailfishOS-5.0.0.43-aarch64 build' 2>&1 | tee "$log"
status=${PIPESTATUS[0]}
if [ "$status" != 0 ]; then
  if grep -q '^Epoch:' rpm/erevos.spec &&
    grep -q 'None of the selected test suites operate on the selected test levels' "$log" &&
    ls RPMS/*.aarch64.rpm >/dev/null 2>&1; then
    echo "::warning::mb2 found no package to check (the spec has an Epoch); the RPM was built"
    status=0
  fi
fi
rm -f "$log"
exit "$status"
