// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

/**
 * The type of a video by its first bytes, as the file is whatever its name says: MP4 and 3GP both
 * start with an ftyp box, whose brand tells them apart (3gp…, 3g2…); WebM with its EBML mark.
 * `fallback` when the bytes say none of these.
 */
export function videoMimeOf(bytes: Uint8Array, fallback: string): string {
  const text = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes.length >= 12 && text(4, 8) === 'ftyp') {
    const brand = text(8, 12).toLowerCase();
    if (brand.startsWith('3g2')) return 'video/3gpp2';
    if (brand.startsWith('3gp') || brand.startsWith('3ge') || brand.startsWith('3gg')) return 'video/3gpp';
    return 'video/mp4';
  }
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'video/webm';
  return fallback;
}
