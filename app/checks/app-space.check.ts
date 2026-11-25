// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  measureAppSpace,
  partsBytes,
  spaceRows,
  spaceText,
  wholeBackupAtMost,
} from "../lib/app-space";

test("what takes room: kinds in words, those of the same words together, the largest first", () => {
  const rows = spaceRows([
    { kind: "erevos-voice-", bytes: 2_000_000, files: 4 },
    { kind: "erevos-file-", bytes: 14_000_000_000, files: 3500 },
    { kind: "*.new", bytes: 10, files: 1 },
    { kind: "*.part", bytes: 4_000_000, files: 1 },
    { kind: "files/tor/", bytes: 30_000_000, files: 20 },
    { kind: "queues.journal", bytes: 5_000, files: 1 },
    { kind: "shared_prefs/", bytes: 0, files: 0 },
  ]);
  assert.deepEqual(
    rows.map((row) => [row.label, row.bytes, row.files]),
    [
      ["The Collection, and photos and files in chats", 14_000_000_000, 3500],
      ["Tor", 30_000_000, 20],
      ["Left over from writes that did not end", 4_000_010, 2],
      ["Voice messages", 2_000_000, 4],
      ["Other: queues.journal", 5_000, 1],
    ],
  );
  assert.equal(spaceText(15_250_000_000), "15.3 GB");
  assert.equal(spaceText(240_400_000), "240 MB");
  assert.equal(spaceText(300), "1 KB");
});

test("what takes room is not measured where there is no phone module for it", async () => {
  assert.equal(await measureAppSpace(), null);
});

test("what a backup made whole holds at most: the photos, files and voice messages, and nothing else measured", async () => {
  assert.equal(
    partsBytes([
      { kind: "erevos-file-", bytes: 5_000_000_000, files: 76_000 },
      { kind: "erevos-voice-", bytes: 20_000_000, files: 40 },
      { kind: "erevos-page-", bytes: 9_000_000, files: 300 },
      { kind: "files/tor/", bytes: 30_000_000, files: 20 },
      { kind: "cache/", bytes: 700_000_000, files: 9 },
    ]),
    5_020_000_000,
  );
  assert.equal(partsBytes([]), 0);
  // Not said where it cannot be measured.
  assert.equal(await wholeBackupAtMost(), null);
});
