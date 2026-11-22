// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The sums behind turning and cutting a photo of the Collection (components/collection-edit.tsx,
// lib/collection-edit.ts), apart, so they can run under plain Node for checks.

/** The part of the photo kept, as shares of its width and height once turned: 0 to 1. */
export type Cut = { x: number; y: number; w: number; h: number };

/** Quarter turns clockwise: 0 to 3. */
export type Turn = 0 | 1 | 2 | 3;

/** Which part of the frame a drag took: a corner, or its middle to move it. */
export type Grip = 'tl' | 'tr' | 'bl' | 'br' | 'move';

export const WHOLE: Cut = { x: 0, y: 0, w: 1, h: 1 };

/** The smallest frame, as a share of the photo's side. */
export const LEAST = 0.08;

/** The name of an edited copy: "IMG_1.jpg" → "IMG_1 (edited).jpg", with the ending of its new kind. */
export function editedName(name: string, ending: string): string {
  const dot = name.lastIndexOf('.');
  const stem = (dot > 0 ? name.slice(0, dot) : name).replace(/ \(edited\)$/, '');
  return `${stem} (edited)${ending}`;
}

/** Whether a cut keeps the whole photo: nothing to cut. */
export const wholeCut = (cut: Cut) => cut.x <= 0.001 && cut.y <= 0.001 && cut.w >= 0.999 && cut.h >= 0.999;

/** The frame once the photo turns a quarter clockwise: it turns with it. */
export const turnedCut = (c: Cut): Cut => ({ x: 1 - c.y - c.h, y: c.x, w: c.h, h: c.w });

/** The frame `from` with `grip` dragged by dx, dy (shares of the photo's sides), kept inside the photo and no smaller than LEAST. */
export function dragged(from: Cut, grip: Grip, dx: number, dy: number): Cut {
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  if (grip === 'move') return { ...from, x: clamp(from.x + dx, 0, 1 - from.w), y: clamp(from.y + dy, 0, 1 - from.h) };
  let left = from.x;
  let top = from.y;
  let right = from.x + from.w;
  let bottom = from.y + from.h;
  if (grip === 'tl' || grip === 'bl') left = clamp(left + dx, 0, right - LEAST);
  else right = clamp(right + dx, left + LEAST, 1);
  if (grip === 'tl' || grip === 'tr') top = clamp(top + dy, 0, bottom - LEAST);
  else bottom = clamp(bottom + dy, top + LEAST, 1);
  return { x: left, y: top, w: right - left, h: bottom - top };
}
