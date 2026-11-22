// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// No library of Google's services goes into the Android app: no Play services (com.google.android.gms)
// and no ML Kit (com.google.mlkit). They are closed code, ML Kit reports its use to Google, and
// F-Droid takes no app with them. Erevos's camera is its own (CameraX): expo-camera, which built
// them in unless told not to, is gone. Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { test } from 'node:test';

import { ROOT } from './words';

const require = createRequire(import.meta.url);
const GOOGLE = /com\.google\.(android\.gms|mlkit)/;

test("Erevos's camera is its own (CameraX), with no expo-camera and its Google scanners", () => {
  const app = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8'));
  assert.ok(!app.expo.plugins.some((p: unknown) => p === 'expo-camera' || (Array.isArray(p) && p[0] === 'expo-camera')));
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies['expo-camera'], undefined);
  assert.ok(!existsSync(join(ROOT, 'node_modules', 'expo-camera')));
});

test("no other library or module of the app builds in Google's services", () => {
  const gradles: string[] = [];
  const modules = join(ROOT, 'modules');
  for (const name of readdirSync(modules)) gradles.push(join(modules, name, 'android', 'build.gradle'));
  const nm = join(ROOT, 'node_modules');
  for (const name of readdirSync(nm)) {
    const names = name.startsWith('@') ? readdirSync(join(nm, name)).map((n) => join(name, n)) : [name];
    for (const n of names) gradles.push(join(nm, n, 'android', 'build.gradle'));
  }
  const found = gradles.filter((g) => existsSync(g) && GOOGLE.test(readFileSync(g, 'utf8')));
  assert.deepEqual(found, []);
});
