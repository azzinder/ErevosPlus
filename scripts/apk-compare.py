#!/usr/bin/env python3

# SPDX-FileCopyrightText: 2026 azzinder
# SPDX-License-Identifier: AGPL-3.0-or-later
# Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

# Compares two APKs file by file and says what differs: files only one has, a different order, the
# same content in a different zip entry, and for each file that differs its sizes, where it first
# differs and some of the strings only one of them has (often a folder a build kept). The signature
# files in META-INF/ are left out. Exits 0 when the two are the same byte for byte, else 1.
# For the twin builds of .github/workflows/fdroid-build.yml (docs/reproducible-builds.md).
#
#   python3 -I scripts/apk-compare.py <one.apk> <two.apk>

import hashlib
import re
import sys
import zipfile


def digest(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()


def strings(data):
    return set(re.findall(rb'[\x20-\x7e]{8,}', data))


def main(one, two):
    da, db = digest(one), digest(two)
    print(f'{da}  {one}')
    print(f'{db}  {two}')
    if da == db:
        print('SAME, byte for byte.')
        return 0
    print('DIFFERENT. What differs:')
    a, b = zipfile.ZipFile(one), zipfile.ZipFile(two)
    ia = {i.filename: i for i in a.infolist() if not i.filename.startswith('META-INF/')}
    ib = {i.filename: i for i in b.infolist() if not i.filename.startswith('META-INF/')}
    for name in sorted(set(ia) - set(ib)):
        print(f'  only in the first: {name}')
    for name in sorted(set(ib) - set(ia)):
        print(f'  only in the second: {name}')
    if [n for n in ia if n in ib] != [n for n in ib if n in ia]:
        print('  the files are in a different order')
    entries = 0
    for name in [n for n in ia if n in ib]:
        x, y = ia[name], ib[name]
        if (x.CRC, x.file_size) == (y.CRC, y.file_size):
            if (x.compress_type, x.compress_size, x.date_time, x.external_attr, x.extra) != (
                y.compress_type, y.compress_size, y.date_time, y.external_attr, y.extra):
                entries += 1
                print(f'  {name}: same content, different zip entry'
                      f' ({x.compress_type}, {x.compress_size}, {x.date_time}, {x.extra.hex()}'
                      f' / {y.compress_type}, {y.compress_size}, {y.date_time}, {y.extra.hex()})')
            continue
        entries += 1
        print(f'  {name}: {x.file_size} / {y.file_size} bytes')
        ca, cb = a.read(name), b.read(name)
        first = next((i for i, (p, q) in enumerate(zip(ca, cb)) if p != q), min(len(ca), len(cb)))
        print(f'    first difference at byte {first}: {ca[first:first + 24].hex()} / {cb[first:first + 24].hex()}')
        sa, sb = strings(ca), strings(cb)
        for s in sorted(sa - sb)[:8]:
            print(f'    first only:  {s[:160].decode()}')
        for s in sorted(sb - sa)[:8]:
            print(f'    second only: {s[:160].decode()}')
    if not entries and set(ia) == set(ib):
        print('  every file is the same: the difference is in the zip around them, or in META-INF/')
    return 1


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('usage: apk-compare.py <one.apk> <two.apk>')
    sys.exit(main(sys.argv[1], sys.argv[2]))
