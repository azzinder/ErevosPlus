// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Settings screens' list (lib/settings.ts): every setting opens a screen that exists, each part
// one its screen knows, and what shows on a phone and elsewhere, and the search through it.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { test } from 'node:test';

import { setLang, t } from '../lib/i18n';
import { makerContact } from '../lib/maker';
import { groupsHere, hasParts, itemsHere, searchSettings, SETTINGS, type SettingsLeaf, type SettingsPlace } from '../lib/settings';

const APP = join(import.meta.dirname, '..', 'app');

const PHONE: SettingsPlace = { web: false, webApp: false, push: false, background: true, checks: true, launcher: true, widget: true, sims: true };
const WEB_APP: SettingsPlace = { web: true, webApp: true, push: true, background: false, checks: true, launcher: false, widget: false, sims: false };
const DESKTOP: SettingsPlace = { web: true, webApp: false, push: false, background: true, checks: false, launcher: false, widget: false, sims: false };
const SAILFISH: SettingsPlace = { ...DESKTOP, background: false };

const leaves = (): SettingsLeaf[] => SETTINGS.flatMap((group) => group.items.flatMap((item) => (hasParts(item) ? item.parts : [item])));

/** The parts a screen opens alone, from its PARTS. */
function partsOf(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const parts = source.slice(source.indexOf('const PARTS = {'), source.indexOf('};', source.indexOf('const PARTS = {')));
  return [...parts.matchAll(/^\s*(\w+): mark\(/gm), ...parts.matchAll(/[{,] (\w+): mark\(/g)].map((m) => m[1]);
}

test('every setting opens a screen that exists, each part one its screen knows', () => {
  for (const leaf of leaves()) {
    if (leaf.language) continue;
    const href = leaf.href ?? '';
    assert.ok(href.startsWith('/'), leaf.id);
    const [path, query] = href.slice(1).split('?');
    const file = [join(APP, `${path}.tsx`), join(APP, path, 'index.tsx'), join(APP, dirname(path), '[id].tsx')].find(existsSync);
    assert.ok(file, `${leaf.id}: ${href}`);
    // A section of the guide: one both guides have.
    if (path.startsWith('guide/')) for (const lang of ['en', 'el']) assert.ok(readFileSync(join(APP, '..', 'guide', `${lang}.ts`), 'utf8').includes(`{#${basename(path)}}`), `${leaf.id}: ${lang}`);
    const part = new URLSearchParams(query ?? '').get('part');
    if (part) assert.ok(partsOf(file).includes(part), `${leaf.id}: ${part} in ${path}`);
  }
});

test("the maker's contact link that comes with Erevos reads, with its keys, so Contact shows", () => {
  const maker = makerContact();
  assert.ok(maker, 'MAKER_LINK (lib/maker.ts) is a contact link with keys');
  assert.match(maker.code.senderHex, /^[0-9a-f]{48}$/);
  assert.ok(maker.name);
  assert.ok(itemsHere(SETTINGS[0], PHONE).some((item) => item.id === 'contact-maker'));
  // A link with no keys is no contact to write to, and then Contact does not show.
  assert.equal(makerContact(`https://erevos-web.lphl.nekten.eu/c#id=${'a'.repeat(48)}`), null);
  assert.equal(makerContact(''), null);
});

test('the ids are unique where they are looked up', () => {
  const groups = SETTINGS.map((group) => group.id);
  assert.equal(new Set(groups).size, groups.length);
  for (const group of SETTINGS) {
    const items = group.items.map((item) => item.id);
    assert.equal(new Set(items).size, items.length, group.id);
  }
});

test('a phone shows every group; elsewhere, what needs a phone does not show', () => {
  assert.deepEqual(
    groupsHere(PHONE).map((group) => group.id),
    SETTINGS.map((group) => group.id),
  );
  const ids = (place: SettingsPlace) => groupsHere(place).flatMap((group) => itemsHere(group, place).map((item) => item.id));
  const desktop = ids(DESKTOP);
  for (const gone of ['tor', 'lora', 'radio-test', 'permissions', 'browser-permissions', 'icons', 'widget', 'phone', 'sms', 'web-app', 'screenshots']) assert.ok(!desktop.includes(gone), gone);
  // Nostr, reached straight where there is no Tor (lib/nostr.ts): on a computer, Sailfish OS and the web app too.
  for (const [where, place] of [['desktop', DESKTOP], ['Sailfish OS', SAILFISH], ['web app', WEB_APP]] as const) assert.ok(ids(place).includes('nostr'), where);
  // The desktop app sets only whether it keeps running with its window closed; Sailfish OS's app has
  // no notices of its own to set: the group goes.
  assert.ok(!groupsHere(DESKTOP).some((group) => group.id === 'phone'));
  assert.ok(desktop.includes('background'));
  assert.ok(!groupsHere(SAILFISH).some((group) => group.id === 'notices' || group.id === 'phone'));
  const web = ids(WEB_APP);
  for (const shown of ['push', 'web-app', 'browser-permissions', 'relay', 'backups', 'icon-number']) assert.ok(web.includes(shown), shown);
  assert.ok(!web.includes('permissions'));
  // The number on the icon: the web app's with Web Push, the phone's with its messages notice.
  assert.ok(ids(PHONE).includes('icon-number'));
  assert.ok(!desktop.includes('icon-number'));
});

test('a setting with parts goes when none of them shows', () => {
  const sms = SETTINGS.find((group) => group.id === 'phone')?.items.find((item) => item.id === 'sms');
  assert.ok(sms && hasParts(sms));
  const parts = (place: SettingsPlace) => itemsHere(SETTINGS.find((group) => group.id === 'phone')!, place).flatMap((item) => (hasParts(item) ? item.parts.filter((p) => !p.when || p.when(place)).map((p) => p.id) : []));
  assert.ok(parts(PHONE).includes('sims'));
  assert.ok(!parts({ ...PHONE, sims: false }).includes('sims'));
});

test('the search finds a setting by its words, in the language shown, without accents', async () => {
  await setLang('en');
  const spam = searchSettings('spam filter', PHONE, t);
  assert.deepEqual(
    spam.map((hit) => [hit.leaf.id, hit.path.join(' › ')]),
    [['spam', 'Phone and SMS › SMS']],
  );
  // A group's name finds what is in it.
  assert.ok(searchSettings('privacy', PHONE, t).some((hit) => hit.leaf.id === 'hidden'));
  assert.deepEqual(searchSettings('   ', PHONE, t), []);
  assert.deepEqual(searchSettings('tor', DESKTOP, t), []);
  await setLang('el');
  assert.ok(searchSettings('φιλτρο ανεπιθυμητων', PHONE, t).some((hit) => hit.leaf.id === 'spam'));
  assert.ok(searchSettings('ΤΑΠΕΤΣΑΡΙΑ', PHONE, t).some((hit) => hit.leaf.id === 'wallpaper'));
  await setLang('en');
});
