// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  encryptBytes,
  randomBytes,
  toBase64,
  toHex,
  utf8Encode,
} from "../lib/crypto";
import { writeBytes, writeFile } from "../lib/files";
import {
  idsIn,
  idsOfDrops,
  idsOfPlace,
  leftoversOf,
  LEFTOVER_AGE_MS,
  namedBy,
} from "../lib/leftovers";
import { DROP_PREFIX } from "../lock/camera-drop";
import { PAGE_PREFIX, sealedFile } from "../lock/sealed-file";
import { files as kept } from "./files-memory";

const id = () => toHex(randomBytes(16));

test("ids are every run of 32 hex digits, each 32 of a longer run cut in 32s, and the first and last 32 of any longer run", () => {
  const a = id();
  const b = id();
  const [after, before] = [id(), id()];
  const found = idsIn(
    JSON.stringify({
      file: { id: a, key: "ff".repeat(32) },
      joined: a + b,
      short: "abc123",
      odd: `${a}0`,
      // An id written right after, or right before, other hex digits.
      named: `thumb${after}`,
      numbered: `${before}00c`,
    }),
  );
  assert.ok(found.has(a));
  assert.ok(found.has(b));
  assert.ok(found.has(after));
  assert.ok(found.has(before));
  assert.ok(found.has("ff".repeat(16)));
  assert.equal(
    [...found].every((x) => x.length === 32),
    true,
  );
});

test("a place names the files of all its sealed values and of its history pages, and no other place’s", async () => {
  const space = randomBytes(32);
  const hidden = randomBytes(32);
  const [inCollection, inPage, inHidden, nowhere] = [id(), id(), id(), id()];
  const store = sealedFile<unknown>({
    name: "erevos-collection-t",
    empty: null,
    checked: (v) => v,
    block: 4096,
  });
  await store.save("space", 0, space, {
    items: [{ file: { id: inCollection, count: 3 } }],
  });
  await store.save("hidden", 0, hidden, {
    items: [{ file: { id: inHidden, count: 1 } }],
  });
  const pageId = toHex(randomBytes(12));
  const history = sealedFile<unknown>({
    name: "erevos-history-t",
    empty: null,
    checked: (v) => v,
    block: 4096,
    fixed: true,
  });
  await history.save("space", 0, space, { pages: [pageId], chats: {} });
  await writeBytes(
    PAGE_PREFIX + pageId,
    encryptBytes(
      space,
      utf8Encode(
        JSON.stringify({
          m: [
            ["peer", [1, 0, "hi", "aaaaaaaaaaaa", 0, 0, 0, 0, { id: inPage }]],
          ],
        }),
      ),
    ),
  );

  const stores = ["erevos-collection-t", "erevos-history-t"];
  const ofSpace = await idsOfPlace(
    { holder: "space", space: 0, key: space },
    stores,
  );
  assert.ok(ofSpace.has(inCollection) && ofSpace.has(inPage));
  assert.ok(!ofSpace.has(inHidden));
  const both = await idsOfPlace(
    { holder: "hidden", space: 0, key: hidden },
    stores,
    ofSpace,
  );
  assert.ok(both.has(inHidden));

  const now = 10 * LEFTOVER_AGE_MS;
  const old = now - 2 * LEFTOVER_AGE_MS;
  const files = [inCollection, inPage, inHidden, nowhere].map((f) => ({
    id: f,
    bytes: 100,
    files: 2,
    at: old,
  }));
  const fresh = id();
  files.push({ id: fresh, bytes: 7, files: 1, at: now - 1000 });
  assert.deepEqual(leftoversOf(files, both, now), {
    ids: [nowhere],
    bytes: 100,
    files: 2,
  });
  // Read with the space alone, the hidden chats' file would be one: hence every place first.
  assert.deepEqual(
    leftoversOf(
      files,
      await idsOfPlace({ holder: "space", space: 0, key: space }, stores),
      now,
    ).ids.sort(),
    [inHidden, nowhere].sort(),
  );
});

test("what the locked camera took, and no space took in yet, is named by its note whichever places are read", async () => {
  const space = randomBytes(32);
  const [taken, small, inCollection, nowhere] = [id(), id(), id(), id()];
  // A note as the camera writes it (lock/camera-drop.ts): its chunks' ids in the clear, the rest
  // sealed for the space it was taken for, which is not the one read here.
  const note = DROP_PREFIX + id();
  await writeFile(
    note,
    JSON.stringify({
      v: 1,
      files: [
        { id: taken, count: 3 },
        { id: small, count: 1 },
      ],
      sealed: toBase64(randomBytes(240)),
    }),
  );
  const store = sealedFile<unknown>({
    name: "erevos-collection-n",
    empty: null,
    checked: (v) => v,
    block: 4096,
  });
  await store.save("space", 0, space, {
    items: [{ file: { id: inCollection, count: 1 } }],
  });

  const ofNotes = await idsOfDrops();
  assert.ok(ofNotes.has(taken) && ofNotes.has(small));
  assert.ok(!ofNotes.has(inCollection));
  // The search names with them, though the place read does not hold them.
  const stores = ["erevos-collection-n"];
  const place = { holder: "space" as const, space: 0, key: space };
  assert.ok(!(await idsOfPlace(place, stores)).has(taken));
  const named = await namedBy([place], stores);
  assert.ok(named.has(taken) && named.has(small) && named.has(inCollection));

  // More than a day old, as after a day and more in another space: still not a leftover.
  const now = 10 * LEFTOVER_AGE_MS;
  const old = now - 2 * LEFTOVER_AGE_MS;
  const files = [taken, small, inCollection, nowhere].map((f) => ({
    id: f,
    bytes: 100,
    files: 1,
    at: old,
  }));
  assert.deepEqual(leftoversOf(files, named, now).ids, [nowhere]);

  // A note that cannot be read may name any file: the search stops, and nothing is deleted.
  const get = kept.get.bind(kept);
  kept.get = (name) => {
    if (name === note) throw new Error("cannot read");
    return get(name);
  };
  try {
    await assert.rejects(namedBy([place], stores), /could not be read/);
  } finally {
    kept.get = get;
  }

  // Once its space took it in, the note is gone and the Collection names it instead.
  kept.delete(note);
  assert.ok(!(await idsOfDrops()).has(taken));
});

test("the search for leftovers names through the notes too, before the places", async () => {
  const { readFileSync } = await import("node:fs");
  const source = readFileSync(
    new URL("../lib/leftovers.ts", import.meta.url),
    "utf8",
  );
  assert.match(
    source,
    /const named = await namedBy\(places, await storeFiles\(\)\);\s*return leftoversOf\(/,
  );
  assert.match(
    source,
    /const named = await idsOfDrops\(\);\s*for \(const place of places\) await idsOfPlace\(place, stores, named\);/,
  );
});
