// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { type Source } from './attachments';
import { isGif, isJpeg, isPng, isWebp } from './photo';

// Whether a photo or video says where it was taken: the Collection's Information says so, and
// asks before such a file leaves Erevos (app/collection.tsx). A photo's place is in its EXIF (a
// GPS directory with a latitude), or its XMP; a video's (MP4, MOV, 3GP) in its `moov` box, as
// ISO 6709 text (©xyz, as Android writes it, or Apple's location key). Only read, never changed.
// Self-contained on purpose, so it can run under plain Node for checks.

/** Yes, no, or cannot tell (a kind not read here, or a file cut short). */
export type Place = 'yes' | 'no' | 'unknown';

const ascii = (bytes: Uint8Array, at: number, text: string) =>
  at >= 0 && at + text.length <= bytes.length && [...text].every((c, i) => bytes[at + i] === c.charCodeAt(0));

// Where `text` first is in `bytes`, from `from`, or -1.
function indexOf(bytes: Uint8Array, text: string, from = 0): number {
  const first = text.charCodeAt(0);
  for (let i = from; i + text.length <= bytes.length; i += 1) {
    if (bytes[i] === first && ascii(bytes, i, text)) return i;
  }
  return -1;
}

/** Whether a TIFF block (EXIF without its "Exif\0\0") names a place: a GPS directory with a latitude or longitude. Null if it cannot be read. */
export function tiffHasPlace(tiff: Uint8Array): boolean | null {
  if (tiff.length < 8) return null;
  const little = ascii(tiff, 0, 'II*\0');
  if (!little && !ascii(tiff, 0, 'MM\0*')) return null;
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const u16 = (at: number) => view.getUint16(at, little);
  const u32 = (at: number) => view.getUint32(at, little);
  // The entries of the directory at `at`, as tag and value (the offset, for the GPS one).
  const entries = (at: number): { tag: number; count: number; value: number }[] | null => {
    if (at < 8 || at + 2 > tiff.length) return null;
    const count = u16(at);
    if (at + 2 + count * 12 > tiff.length) return null;
    const out: { tag: number; count: number; value: number }[] = [];
    for (let i = 0; i < count; i += 1) {
      const e = at + 2 + i * 12;
      out.push({ tag: u16(e), count: u32(e + 4), value: u32(e + 8) });
    }
    return out;
  };
  const first = entries(u32(4));
  if (!first) return null;
  const gps = first.find((e) => e.tag === 0x8825);
  if (!gps) return false;
  const inside = entries(gps.value);
  if (!inside) return null;
  // 1/2 latitude, 3/4 longitude: a directory with the version alone says no place.
  return inside.some((e) => (e.tag === 2 || e.tag === 4) && e.count > 0);
}

// XMP that says where: exif:GPSLatitude, as an attribute or an element.
const xmpHasPlace = (bytes: Uint8Array) => indexOf(bytes, 'GPSLatitude') >= 0;

// The TIFF blocks of a photo's EXIF, by its kind.
function tiffsOf(bytes: Uint8Array): Uint8Array[] | null {
  const tiffs: Uint8Array[] = [];
  if (isJpeg(bytes)) {
    let at = 2;
    while (at + 4 <= bytes.length && bytes[at] === 0xff) {
      const marker = bytes[at + 1];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        at += 2;
        continue;
      }
      const length = (bytes[at + 2] << 8) | bytes[at + 3];
      if (length < 2) break;
      if (marker === 0xe1 && ascii(bytes, at + 4, 'Exif\0\0')) tiffs.push(bytes.subarray(at + 10, Math.min(bytes.length, at + 2 + length)));
      at += 2 + length;
    }
    return tiffs;
  }
  if (isPng(bytes)) {
    let at = 8;
    while (at + 12 <= bytes.length) {
      const length = ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0;
      if (ascii(bytes, at + 4, 'eXIf')) tiffs.push(bytes.subarray(at + 8, Math.min(bytes.length, at + 8 + length)));
      if (ascii(bytes, at + 4, 'IEND')) break;
      at += 12 + length;
    }
    return tiffs;
  }
  if (isWebp(bytes)) {
    let at = 12;
    while (at + 8 <= bytes.length) {
      const length = (bytes[at + 4] | (bytes[at + 5] << 8) | (bytes[at + 6] << 16) | (bytes[at + 7] << 24)) >>> 0;
      if (ascii(bytes, at, 'EXIF')) {
        const data = bytes.subarray(at + 8, Math.min(bytes.length, at + 8 + length));
        tiffs.push(ascii(data, 0, 'Exif\0\0') ? data.subarray(6) : data);
      }
      at += 8 + length + (length & 1);
    }
    return tiffs;
  }
  if (isGif(bytes)) return tiffs;
  // HEIC, HEIF, AVIF: the EXIF item lies somewhere in the file, after 4 bytes of offset and "Exif\0\0".
  if (ascii(bytes, 4, 'ftyp')) {
    for (let at = indexOf(bytes, 'Exif\0\0'); at >= 0; at = indexOf(bytes, 'Exif\0\0', at + 6)) tiffs.push(bytes.subarray(at + 6));
    return tiffs;
  }
  return null;
}

/**
 * Whether a photo (JPEG, PNG, WebP, GIF, HEIC, AVIF) says where it was taken. `whole` false when
 * `bytes` is only its start: a place not found there is then "unknown" for the kinds that may
 * keep it at the end (WebP, HEIC, AVIF).
 */
export function photoPlace(bytes: Uint8Array, whole = true): Place {
  const tiffs = tiffsOf(bytes);
  if (tiffs === null) return 'unknown';
  let unread = false;
  for (const tiff of tiffs) {
    const has = tiffHasPlace(tiff);
    if (has) return 'yes';
    if (has === null) unread = true;
  }
  if (xmpHasPlace(bytes)) return 'yes';
  if (unread || (!whole && !isJpeg(bytes) && !isPng(bytes))) return 'unknown';
  return 'no';
}

/** Whether a video's `moov` box, read whole, says where it was filmed. */
export function moovHasPlace(moov: Uint8Array): boolean {
  return indexOf(moov, '©xyz') >= 0 || indexOf(moov, 'location.ISO6709') >= 0;
}

// The largest `moov` read to look in: a long video's tables can be large.
const MOST_MOOV = 16 * 1024 * 1024;

/** Whether a video (MP4, MOV, 3GP) read from `source` says where it was filmed: its top boxes walked, its `moov` read alone. */
export async function videoPlace(source: Source): Promise<Place> {
  let at = 0;
  for (let boxes = 0; at + 8 <= source.size && boxes < 64; boxes += 1) {
    const head = await source.read(at, 16);
    if (head.length < 8) return 'unknown';
    let size = ((head[0] << 24) | (head[1] << 16) | (head[2] << 8) | head[3]) >>> 0;
    let header = 8;
    if (size === 1) {
      if (head.length < 16) return 'unknown';
      size = ((head[8] << 24) | (head[9] << 16) | (head[10] << 8) | head[11]) * 2 ** 32 + (((head[12] << 24) | (head[13] << 16) | (head[14] << 8) | head[15]) >>> 0);
      header = 16;
    } else if (size === 0) {
      size = source.size - at;
    }
    if (size < header) return 'unknown';
    if (ascii(head, 4, 'moov')) {
      if (size > MOST_MOOV || at + size > source.size) return 'unknown';
      return moovHasPlace(await source.read(at, size)) ? 'yes' : 'no';
    }
    if (boxes === 0 && !ascii(head, 4, 'ftyp')) return 'unknown';
    at += size;
  }
  return 'unknown';
}
