// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The sums behind the buttons of Erevos's own camera (components/erevos-camera.tsx): its zoom and
// which of the phone maker's effects it asks for. Self-contained, so the checks run it under Node.

/** A photo Extension of the phone's maker, as the camera names it (modules/erevos-collection CameraEffect). */
export type Effect = 'night' | 'hdr' | 'bokeh' | 'auto';

/** What the shutter does: a photo (night and portrait where the phone has them) or a video. */
export type CameraMode = 'night' | 'portrait' | 'photo' | 'video';

/** The zoom after two fingers went from `start` apart to `now` apart, from `from`, kept within the camera's. */
export const pinchedZoom = (from: number, start: number, now: number, least: number, most: number) =>
  Math.min(most, Math.max(least, from * (now / Math.max(1, start))));

/** The zoom buttons for a camera that zooms from `least` to `most`: its wide lens, 1×, and 2× and 5× where it reaches them. */
export function zoomStops(least: number, most: number): number[] {
  const stops: number[] = [];
  if (least < 0.95) stops.push(Math.round(least * 10) / 10);
  stops.push(1);
  if (most >= 2) stops.push(2);
  if (most >= 5) stops.push(5);
  return stops;
}

/** How a zoom shows: 0.5×, 1×, 2.4×. */
export const zoomName = (ratio: number) => `${Number.isInteger(ratio) ? ratio : ratio.toFixed(1)}×`;

/** The effect the camera is asked for, by the mode, whether HDR is on, and what this camera has. */
export function effectFor(mode: CameraMode, hdr: boolean, effects: Effect[]): Effect | 'none' {
  if (mode === 'night' && effects.includes('night')) return 'night';
  if (mode === 'portrait' && effects.includes('bokeh')) return 'bokeh';
  if (mode === 'photo' && hdr && effects.includes('hdr')) return 'hdr';
  return 'none';
}

/** What went wrong with the camera, for the words the owner sees in their language. */
export type CameraTrouble = 'open' | 'stopped' | 'not-ready' | 'photo' | 'video' | 'keep-photo' | 'keep-video';

/**
 * The trouble a camera call failed with, by the code the camera gave (CameraPreview.kt rejects with
 * ERR_CAMERA, ERR_PHOTO or ERR_VIDEO); anything else failed while keeping it in the Collection.
 */
export function troubleOf(error: unknown, taking: 'photo' | 'video'): CameraTrouble {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';
  if (code === 'ERR_CAMERA') return 'not-ready';
  if (code === 'ERR_PHOTO') return 'photo';
  if (code === 'ERR_VIDEO') return 'video';
  return taking === 'photo' ? 'keep-photo' : 'keep-video';
}
