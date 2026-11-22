// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// What the plain Erevos (lib/edition.ts, docs/editions.md) leaves out besides its modules: the
// guide's sections of the networks only Erevos+ has, and, once in each space that had an account
// on one of them, a word that it is kept for Erevos+ (lib/edition-notice.ts). Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { guideFor, PLUS_SECTIONS } from '../guide/index';
import { randomBytes } from '../lib/crypto';
import { editionNote } from '../lib/edition-notice';
import { newNostrDm } from '../lib/nostr-dm';
import { whatsNewFor } from '../lib/whats-new';
import { asEdition, editionName, guideNamed, named, unmarkKept } from '../lib/edition';
import { KEEPS_EREVOS, KEEPS_SOME } from '../lib/edition-keeps';
import { EL } from '../i18n/el/index';
import { setLang, tFor } from '../lib/i18n';
import { saveNostrDm } from '../lock/nostr-dm-data';
import { useWasmCore } from './wasm-core';
import { blobs, files } from './files-memory';
import { store } from './secure-memory';

useWasmCore();

test('the plain Erevos guide leaves out Matrix, XMPP and the chats with other Nostr apps; Erevos+ has them', () => {
  for (const lang of ['en', 'el'] as const) {
    const plus = guideFor(lang, 'plus').map((section) => section.id);
    const lite = guideFor(lang, 'lite').map((section) => section.id);
    for (const id of PLUS_SECTIONS) {
      assert.ok(plus.includes(id), `${lang} ${id}`);
      assert.ok(!lite.includes(id), `${lang} ${id}`);
    }
    // Erevos's own Nostr, which carries its messages, stays.
    assert.ok(lite.includes('nostr'));
    assert.equal(lite.length, plus.length - PLUS_SECTIONS.length);
  }
});

test('the plain Erevos says once in a space that its Nostr account is kept for Erevos+, and nothing in Erevos+', async () => {
  store.clear();
  files.clear();
  blobs.clear();
  const key = randomBytes(32);
  const other = randomBytes(32);
  await saveNostrDm(0, key, await newNostrDm());
  assert.equal(await editionNote(0, key, 'plus'), null);
  const said = await editionNote(0, key, 'lite');
  assert.ok(said?.includes('Nostr'));
  assert.ok(said?.includes('Erevos+'));
  // Once only in that space.
  assert.equal(await editionNote(0, key, 'lite'), null);
  // A space with no such account: nothing to say.
  assert.equal(await editionNote(1, other, 'lite'), null);
  // What is kept shows neither the spaces' keys nor the networks.
  const kept = store.get('erevos.edition-told') ?? '';
  assert.doesNotMatch(kept, /nostr|matrix|xmpp/i);
  assert.equal((JSON.parse(kept) as string[]).length, 2);
});

test("the plain Erevos's What's new leaves out what is of Matrix, XMPP and chats with other Nostr apps, but says they are in Erevos+", () => {
  const plus = whatsNewFor('99.0.0', 'plus');
  const lite = whatsNewFor('99.0.0', 'lite');
  // Erevos+ folds the plain releases after 7.0.0 into its own (lib/whats-new.ts asPlus): each of its releases is one of the plain Erevos's.
  assert.ok(plus.every((v) => lite.some((w) => w.version === v.version)));
  const all = (list: typeof plus) => list.flatMap((v) => [...v.forYou, ...v.underTheHood]);
  assert.ok(all(lite).length < all(plus).length);
  for (const text of all(lite)) {
    if (text.startsWith('**Matrix, XMPP and Nostr chats are in Erevos+**')) continue;
    assert.doesNotMatch(text, /\bMatrix\b|\bXMPP\b|other Nostr apps/, text);
  }
  assert.ok(all(lite).some((text) => text.startsWith('**Matrix, XMPP and Nostr chats are in Erevos+**')));
  // A change of Erevos's own that only names another app in passing stays.
  assert.ok(all(lite).some((text) => text.startsWith('**Voice messages in Opus**')));
});

test("each edition says its own name, in every language's words", () => {
  assert.equal(editionName('plus'), 'Erevos+');
  assert.equal(editionName('lite'), 'Erevos');
  assert.equal(named('Καλώς ήρθες στο Erevos', 'plus'), 'Καλώς ήρθες στο Erevos+');
  assert.equal(named('Erevos 7.1.3 ist da.', 'plus'), 'Erevos+ 7.1.3 ist da.');
  assert.equal(named('Erevos+ stays', 'plus'), 'Erevos+ stays');
  assert.equal(named('Willkommen bei Erevos', 'lite'), 'Willkommen bei Erevos');
  // Names that are more than the app stay: ErevosGram, a repository, a file.
  assert.equal(named('ErevosGram, azzinder/Erevos, Erevos.apk, erevos-web', 'plus'), 'ErevosGram, azzinder/Erevos, Erevos.apk, erevos-web');
  assert.equal(named('Erevos contacts and Erevos.', 'plus'), 'Erevos+ contacts and Erevos+.');
  // Words that speak of the two editions apart, or of whose Erevos is, stay as written.
  assert.equal(asEdition('The next update is the plain Erevos. It installs over Erevos+.', 'plus'), 'The next update is the plain Erevos. It installs over Erevos+.');
  assert.equal(asEdition('Erevos, by azzinder', 'plus'), 'Erevos, by azzinder');
  assert.equal(asEdition('Open Erevos', 'lite'), 'Open Erevos');
  assert.equal(guideNamed('Erevos+ has Matrix, and\nErevos has not.\n\nErevos opens.', 'plus'), 'Erevos+ has Matrix, and\nErevos has not.\n\nErevos+ opens.');
  assert.equal(guideNamed('Erevos opens.\n- Erevos+ has Matrix; Erevos has not.\n**Erevos, by azzinder.**', 'plus'), 'Erevos+ opens.\n- Erevos+ has Matrix; Erevos has not.\n**Erevos, by azzinder.**');
});

test('the app says Erevos+ in its own words when the checks do not ask for the plain names', () => {
  const flags = globalThis as { __EREVOS_PLAIN_NAMES__?: boolean };
  const was = flags.__EREVOS_PLAIN_NAMES__;
  try {
    flags.__EREVOS_PLAIN_NAMES__ = false;
    assert.equal(tFor('plus', 'Open Erevos'), 'Open Erevos+');
    assert.equal(tFor('lite', 'Open Erevos'), 'Open Erevos');
    assert.equal(tFor('plus', 'Erevos, by azzinder'), 'Erevos, by azzinder');
    assert.equal(tFor('plus', 'Erevos {version} is out.', { version: '7.0.3' }), 'Erevos+ 7.0.3 is out.');
  } finally {
    flags.__EREVOS_PLAIN_NAMES__ = was;
  }
  assert.equal(tFor('plus', 'Open Erevos'), 'Open Erevos');
});

test("Erevos+ keeps «Erevos» where it speaks of the other person's app or of what both editions share", async () => {
  // Each kept text is one of the app's, with the name in it: none is left over from words that changed.
  for (const text of KEEPS_EREVOS) {
    assert.ok(text in EL, text);
    assert.match(text, /(?<![\w/.-])Erevos(?![\w+/-])/, text);
  }
  for (const [text, keep] of KEEPS_SOME) {
    assert.ok(text in EL && !KEEPS_EREVOS.has(text), text);
    assert.equal(text.match(/(?<![\w/.-])Erevos(?![\w+/-])(?!\.\w)/g)?.length, keep.length, text);
    assert.ok(keep.includes(true) && keep.includes(false), text);
  }
  const flags = globalThis as { __EREVOS_PLAIN_NAMES__?: boolean };
  const was = flags.__EREVOS_PLAIN_NAMES__;
  try {
    flags.__EREVOS_PLAIN_NAMES__ = false;
    const theirs = 'Asked, joining once Erevos is open on their phone: {names}';
    assert.ok(KEEPS_EREVOS.has(theirs));
    assert.equal(tFor('plus', theirs, { names: 'Ann' }), 'Asked, joining once Erevos is open on their phone: Ann');
    assert.equal(tFor('plus', 'Open Erevos'), 'Open Erevos+');
    // A text of both: only this app's «Erevos» says Erevos+, in English and in a translation with as many.
    const both = '{number} has Erevos. Messages to that number now go through Erevos, end-to-end encrypted.';
    assert.deepEqual(KEEPS_SOME.get(both), [true, false]);
    assert.equal(tFor('plus', both, { number: '+30' }), '+30 has Erevos. Messages to that number now go through Erevos+, end-to-end encrypted.');
    await setLang('el');
    const greek = tFor('plus', both, { number: '+30' });
    assert.equal((greek.match(/Erevos\+/g) ?? []).length, 1, greek);
    assert.ok(greek.indexOf('Erevos+') > greek.indexOf('Erevos '), greek);
  } finally {
    await setLang('en');
    flags.__EREVOS_PLAIN_NAMES__ = was;
  }
  // The guide: a marked «Erevos» stays, the others in the same paragraph are Erevos+'s, and no mark shows.
  assert.equal(guideNamed('Erevos looks for other {=Erevos} phones.', 'plus'), 'Erevos+ looks for other Erevos phones.');
  assert.equal(guideNamed('Erevos looks for other {=Erevos} phones.', 'lite'), 'Erevos looks for other Erevos phones.');
  assert.equal(unmarkKept('a {=Erevos} b'), 'a Erevos b');
  for (const lang of ['de', 'el', 'en', 'es', 'fr', 'it', 'pt', 'sh'] as const) {
    for (const section of guideFor(lang, 'plus')) assert.doesNotMatch(JSON.stringify(section), /\{=/, `${lang} ${section.id}`);
  }
});
