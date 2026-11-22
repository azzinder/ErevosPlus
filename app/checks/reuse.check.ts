// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Every file in the repository says whose it is and under which licence (AUTHORS.md, the REUSE
// way, https://reuse.software): a notice at its top, or, for a file that cannot hold one, a path
// in REUSE.toml. A new file without either fails here. To add the notice to a new file:
//   pip install reuse && reuse annotate --template erevos -c azzinder -y 2026 -l AGPL-3.0-or-later FILE
// (a file copied from elsewhere keeps its own maker and licence instead; see LICENSES/).
// The full check is `reuse lint`; this one needs neither Python nor the network.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const REPO = join(import.meta.dirname, '..', '..');
const toml = readFileSync(join(REPO, 'REUSE.toml'), 'utf8');

/** The path globs of REUSE.toml, as regular expressions (** = any folders, a last /** all within, * = within one name). */
const globs = [...toml.matchAll(/^path\s*=\s*(\[[^\]]*\]|"[^"]*")/gm)]
  .flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((g) => g[1]))
  .map((g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\//g, '\0').replace(/\*\*/g, '\u0001').replace(/\*/g, '[^/]*').replace(/\0/g, '(?:.*/)?').replace(/\u0001/g, '.*') + '$'));

const files = execFileSync('git', ['ls-files', '-z'], { cwd: REPO, encoding: 'utf8' })
  .split('\0')
  .filter((f) => f && existsSync(join(REPO, f)));

test('every file has an SPDX notice at its top or a path in REUSE.toml', () => {
  const without = files.filter((f) => {
    if (f.startsWith('LICENSES/') || f.startsWith('.reuse/') || f === 'LICENSE' || f === 'REUSE.toml') return false;
    if (globs.some((g) => g.test(f))) return false;
    const head = readFileSync(join(REPO, f), 'utf8').split('\n').slice(0, 12).join('\n');
    return !/SPDX-License-Identifier: \S/.test(head) || !/SPDX-FileCopyrightText: \S/.test(head);
  });
  assert.deepEqual(without, [], 'no SPDX notice and not in REUSE.toml');
});

test('every licence named is in LICENSES/', () => {
  const named = new Set<string>();
  for (const f of files) {
    if (f.startsWith('LICENSES/')) continue;
    const text = f === 'REUSE.toml' ? toml : readFileSync(join(REPO, f), 'utf8').split('\n').slice(0, 12).join('\n');
    for (const m of text.matchAll(/SPDX-License-Identifier(?::| =) "?([A-Za-z0-9.+-]+)/g)) named.add(m[1]);
  }
  const missing = [...named].filter((id) => !existsSync(join(REPO, 'LICENSES', `${id}.txt`)));
  assert.deepEqual(missing, []);
});

test('the notice of Erevos\'s own files points to the additional terms in AUTHORS.md', () => {
  const authors = readFileSync(join(REPO, 'AUTHORS.md'), 'utf8');
  assert.match(authors, /Additional terms \(AGPL-3\.0, section 7\)/);
  assert.match(authors, /Erevos, by azzinder/);
  assert.match(toml, /Additional terms under AGPL-3\.0 section 7 apply/);
  for (const f of files.filter((f) => /^app\/guide\/[a-z]{2}\.ts$/.test(f))) {
    assert.match(readFileSync(join(REPO, f), 'utf8'), /Erevos, by azzinder/, `${f}: the About part names the maker (term 7b)`);
  }
});
