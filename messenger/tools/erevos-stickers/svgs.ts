// SPDX-FileCopyrightText: 2026 azzinder
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// Erevos's built-in stickers as SVG, drawn by Erevos's own lib/sticker-svg.ts with the
// Greek words. Bundled by make.mjs, with EREVOS pointing at an Erevos checkout.
import { STICKERS, SETS, GONE_SETS } from 'EREVOS/app/lib/stickers';
import { stickerSvg, sizedSvg } from 'EREVOS/app/lib/sticker-svg';
import { EL } from 'EREVOS/app/i18n/el/index';

const el = (k: string) => (EL as Record<string, string>)[k] ?? k;
const stickers = STICKERS.filter((s) => !GONE_SETS.includes(s.set)).map((s) => {
  const svg = stickerSvg(s.name, el(s.label));
  return { name: s.name, set: s.set, label: el(s.label), svg: svg && sizedSvg(svg, 512) };
});
const sets = SETS.filter((s) => !GONE_SETS.includes(s.set)).map((s) => ({ set: s.set, label: el(s.label) }));
console.log(JSON.stringify({ sets, stickers }));
