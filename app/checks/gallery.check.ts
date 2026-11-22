// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Collection as a gallery: whether a photo or video says where it was taken (lib/media-place.ts),
// read from its EXIF, XMP or MP4 boxes; and the sums for turning and cutting a photo (lib/photo-cut.ts).

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { effectFor, pinchedZoom, troubleOf, zoomName, zoomStops } from '../lib/camera-controls';
import { bytesSource } from '../lib/attachments';
import { moovHasPlace, photoPlace, tiffHasPlace, videoPlace } from '../lib/media-place';
import { cleanImage } from '../lib/photo';
import { dragged, editedName, LEAST, turnedCut, WHOLE, wholeCut } from '../lib/photo-cut';

import { ROOT } from './words';

const ascii = (text: string) => Uint8Array.from([...text].map((c) => c.charCodeAt(0)));
const joined = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
};

// A little-endian TIFF block with an IFD0 that has Orientation and, with `gps`, a GPS directory
// holding the latitude (`withLatitude`) or only its version.
function tiff(gps: boolean, withLatitude = true): Uint8Array {
  const out = new Uint8Array(80);
  const view = new DataView(out.buffer);
  out.set(ascii('II*\0'));
  view.setUint32(4, 8, true);
  const entries = gps ? 2 : 1;
  view.setUint16(8, entries, true);
  // Orientation 1.
  view.setUint16(10, 0x0112, true);
  view.setUint16(12, 3, true);
  view.setUint32(14, 1, true);
  view.setUint32(18, 1, true);
  if (gps) {
    view.setUint16(22, 0x8825, true);
    view.setUint16(24, 4, true);
    view.setUint32(26, 1, true);
    view.setUint32(30, 40, true);
    // The GPS directory at 40: its version, and the latitude's reference when asked.
    view.setUint16(40, withLatitude ? 2 : 1, true);
    view.setUint16(42, 0, true);
    view.setUint16(44, 1, true);
    view.setUint32(46, 4, true);
    if (withLatitude) {
      view.setUint16(54, 2, true);
      view.setUint16(56, 5, true);
      view.setUint32(58, 3, true);
    }
  }
  return out;
}

// A JPEG with an EXIF segment holding `block`, then a tiny picture's markers.
function jpeg(block: Uint8Array): Uint8Array {
  const exif = joined(ascii('Exif\0\0'), block);
  const length = exif.length + 2;
  return joined(Uint8Array.of(0xff, 0xd8, 0xff, 0xe1, length >> 8, length & 0xff), exif, Uint8Array.of(0xff, 0xda, 0, 2, 0xff, 0xd9));
}

function box(type: string, body: Uint8Array): Uint8Array {
  const size = body.length + 8;
  return joined(Uint8Array.of(size >>> 24, (size >> 16) & 0xff, (size >> 8) & 0xff, size & 0xff), ascii(type), body);
}

test('a GPS directory with a latitude says a place; one with only its version, or none, does not', () => {
  assert.equal(tiffHasPlace(tiff(true)), true);
  assert.equal(tiffHasPlace(tiff(true, false)), false);
  assert.equal(tiffHasPlace(tiff(false)), false);
  assert.equal(tiffHasPlace(ascii('nonsense')), null);
});

test('a JPEG says where it was taken through its EXIF or its XMP, and not once cleaned', () => {
  const placed = jpeg(tiff(true));
  assert.equal(photoPlace(placed), 'yes');
  assert.equal(photoPlace(jpeg(tiff(false))), 'no');
  const packet = joined(ascii('http://ns.adobe.com/xap/1.0/\0'), ascii('<x:xmpmeta exif:GPSLatitude="40,38.1N"/>'));
  const xmp = joined(Uint8Array.of(0xff, 0xd8, 0xff, 0xe1, (packet.length + 2) >> 8, (packet.length + 2) & 0xff), packet, Uint8Array.of(0xff, 0xda, 0, 2, 0xff, 0xd9));
  assert.equal(photoPlace(xmp), 'yes');
  const cleaned = cleanImage(placed);
  assert.ok(cleaned);
  assert.equal(photoPlace(cleaned), 'no');
});

test('a HEIC says its place through its EXIF item, and cannot be told from its start alone', () => {
  const head = joined(Uint8Array.of(0, 0, 0, 24), ascii('ftypheic'), new Uint8Array(12));
  assert.equal(photoPlace(joined(head, Uint8Array.of(0, 0, 0, 6), ascii('Exif\0\0'), tiff(true))), 'yes');
  assert.equal(photoPlace(head, true), 'no');
  assert.equal(photoPlace(head, false), 'unknown');
  assert.equal(photoPlace(ascii('just text')), 'unknown');
});

test('a video says where it was filmed by ©xyz in its moov, wherever the moov lies', async () => {
  const ftyp = box('ftyp', ascii('isom\0\0\0\0'));
  const placed = box('moov', box('udta', box('©xyz', ascii('+40.6+022.9/'))));
  const plain = box('moov', box('mvhd', new Uint8Array(20)));
  const mdat = box('mdat', new Uint8Array(1000));
  assert.equal(moovHasPlace(placed), true);
  assert.equal(await videoPlace(bytesSource(joined(ftyp, placed, mdat))), 'yes');
  // As cameras write it: the moov after the pictures.
  assert.equal(await videoPlace(bytesSource(joined(ftyp, mdat, placed))), 'yes');
  assert.equal(await videoPlace(bytesSource(joined(ftyp, mdat, plain))), 'no');
  assert.equal(await videoPlace(bytesSource(joined(ftyp, mdat))), 'unknown');
  assert.equal(await videoPlace(bytesSource(ascii('not a video at all'))), 'unknown');
});

test('an edited copy is named after its photo, once', () => {
  assert.equal(editedName('IMG_20261122_093000.jpg', '.jpg'), 'IMG_20261122_093000 (edited).jpg');
  assert.equal(editedName('IMG_1 (edited).jpg', '.jpg'), 'IMG_1 (edited).jpg');
  assert.equal(editedName('photo.heic', '.jpg'), 'photo (edited).jpg');
  assert.equal(editedName('noending', '.png'), 'noending (edited).png');
});

test('the frame stays inside the photo, no smaller than its least, and turns with it', () => {
  assert.equal(wholeCut(WHOLE), true);
  const moved = dragged(WHOLE, 'move', 0.3, 0.3);
  assert.deepEqual(moved, WHOLE);
  const cut = dragged(WHOLE, 'tl', 0.25, 0.1);
  assert.deepEqual(cut, { x: 0.25, y: 0.1, w: 0.75, h: 0.9 });
  assert.equal(wholeCut(cut), false);
  const small = dragged(cut, 'br', -5, -5);
  assert.ok(Math.abs(small.w - LEAST) < 1e-9 && Math.abs(small.h - LEAST) < 1e-9);
  const beyond = dragged({ x: 0.2, y: 0.2, w: 0.5, h: 0.5 }, 'move', 1, -1);
  assert.deepEqual(beyond, { x: 0.5, y: 0, w: 0.5, h: 0.5 });
  // A quarter turn clockwise: the left strip becomes the top one; four turns, the frame it was.
  const left = { x: 0, y: 0, w: 0.25, h: 1 };
  assert.deepEqual(turnedCut(left), { x: 0, y: 0, w: 1, h: 0.25 });
  const odd = { x: 0.1, y: 0.2, w: 0.3, h: 0.4 };
  const back = turnedCut(turnedCut(turnedCut(turnedCut(odd))));
  for (const k of ['x', 'y', 'w', 'h'] as const) assert.ok(Math.abs(back[k] - odd[k]) < 1e-9);
});

test("what the camera left in the cache goes as Erevos starts: from the camera's own folder", () => {
  const folder = readFileSync(join(ROOT, 'lib', 'camera-cache.ts'), 'utf8').match(/CAMERA_FOLDER = '([^']+)'/)?.[1];
  assert.equal(folder, 'Camera');
  // The camera (CameraPreview.kt) records its videos there; its photos never touch the storage.
  const camera = readFileSync(join(ROOT, 'modules', 'erevos-collection', 'android', 'src', 'main', 'java', 'expo', 'modules', 'erevoscollection', 'CameraPreview.kt'), 'utf8');
  assert.match(camera, /File\(context\.cacheDir, CAMERA_FOLDER\)/);
  assert.match(camera, /CAMERA_FOLDER = "Camera"/);
  assert.match(readFileSync(join(ROOT, 'app', '_layout.tsx'), 'utf8'), /clearCameraCache\(\)/);
});

test("the camera's zoom buttons, pinch and effects follow what the phone has", () => {
  assert.deepEqual(zoomStops(0.5, 30), [0.5, 1, 2, 5]);
  assert.deepEqual(zoomStops(1, 8), [1, 2, 5]);
  assert.deepEqual(zoomStops(1, 1), [1]);
  assert.equal(zoomName(0.5), '0.5×');
  assert.equal(zoomName(2), '2×');
  assert.equal(pinchedZoom(1, 100, 200, 0.5, 10), 2);
  assert.equal(pinchedZoom(1, 100, 10, 0.5, 10), 0.5);
  assert.equal(pinchedZoom(8, 100, 300, 0.5, 10), 10);
  assert.equal(effectFor('night', false, ['night', 'hdr']), 'night');
  assert.equal(effectFor('night', false, ['hdr']), 'none');
  assert.equal(effectFor('portrait', true, ['bokeh']), 'bokeh');
  assert.equal(effectFor('photo', true, ['hdr']), 'hdr');
  assert.equal(effectFor('photo', false, ['hdr']), 'none');
  assert.equal(effectFor('video', true, ['hdr', 'night']), 'none');
});

test("the camera's troubles are told by their code, so the owner reads them in their language", () => {
  assert.equal(troubleOf({ code: 'ERR_CAMERA', message: 'The camera is not ready' }, 'photo'), 'not-ready');
  assert.equal(troubleOf({ code: 'ERR_PHOTO' }, 'photo'), 'photo');
  assert.equal(troubleOf({ code: 'ERR_VIDEO' }, 'video'), 'video');
  assert.equal(troubleOf(new Error('Disk full'), 'photo'), 'keep-photo');
  assert.equal(troubleOf('nothing', 'video'), 'keep-video');
});
