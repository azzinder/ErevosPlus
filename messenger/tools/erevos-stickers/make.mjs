// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// Makes android/app/src/main/assets/erevos-stickers from an Erevos checkout:
//   EREVOS=../Erevos node tools/erevos-stickers/make.mjs <erevos-commit>
// Needs esbuild and playwright (Chromium); Pillow (python3) packs lossless WebP.
// The pictures are drawn as Erevos's web app draws them (lib/sticker-image.web.ts):
// the SVG into a canvas of 512, then PNG, then lossless WebP without metadata.
import * as esbuild from 'esbuild';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const erevos = path.resolve(process.env.EREVOS ?? '../Erevos');
const version = process.argv[2] ?? 'dev';
const here = path.dirname(new URL(import.meta.url).pathname);
const out = path.resolve(here, '../../android/app/src/main/assets/erevos-stickers');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'stk-'));

fs.writeFileSync(path.join(tmp, 'i18n.ts'), "export const mark = (s: string) => s;\nexport const t = (s: string) => s;\nexport const lang = () => 'el';\n");
await esbuild.build({
  entryPoints: [path.join(here, 'svgs.ts')], bundle: true, platform: 'node', format: 'esm', outfile: path.join(tmp, 'svgs.mjs'), logLevel: 'error',
  plugins: [{ name: 'erevos', setup(b) {
    b.onResolve({ filter: /^EREVOS\// }, (a) => ({ path: require_ts(a.path.replace(/^EREVOS/, erevos)) }));
    b.onResolve({ filter: /\/i18n$/ }, (a) => (a.path === './i18n' ? { path: path.join(tmp, 'i18n.ts') } : undefined));
    b.onResolve({ filter: /^react/ }, () => ({ path: 'react', external: true }));
  } }],
});
function require_ts(p) { return fs.existsSync(p + '.ts') ? p + '.ts' : p + '.tsx'; }
const j = JSON.parse(execFileSync('node', [path.join(tmp, 'svgs.mjs')], { maxBuffer: 1 << 28 }).toString());

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
const stickers = [];
for (const s of j.stickers) {
  if (!s.svg) continue;
  const b64 = await page.evaluate(async ({ svg, size }) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    try {
      const image = new Image();
      await new Promise((res, rej) => { image.onload = res; image.onerror = rej; image.src = url; });
      const c = document.createElement('canvas');
      c.width = size; c.height = size;
      c.getContext('2d').drawImage(image, 0, 0, size, size);
      return c.toDataURL('image/png').split(',')[1];
    } catch { return null; } finally { URL.revokeObjectURL(url); }
  }, { svg: s.svg, size: 512 });
  if (!b64) continue;
  const file = s.name.replace(/[^A-Za-z0-9_-]/g, '_');
  fs.writeFileSync(path.join(tmp, file + '.png'), Buffer.from(b64, 'base64'));
  stickers.push({ name: s.name, set: s.set, label: s.label, file: file + '.webp' });
}
await browser.close();
execFileSync('python3', ['-I', '-c', "import sys,os\nfrom PIL import Image\nfor f in sys.argv[2:]:\n  Image.open(os.path.join(sys.argv[1], f + '.png')).save(os.path.join(sys.argv[1], f + '.webp'), 'WEBP', lossless=True, method=6)", tmp, ...stickers.map((s) => s.file.slice(0, -5))]);
for (const s of stickers) fs.copyFileSync(path.join(tmp, s.file), path.join(out, s.file));
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify({ version: 'erevos-' + version, sets: j.sets, stickers }));
fs.rmSync(tmp, { recursive: true, force: true });
console.log('stickers:', stickers.length);
