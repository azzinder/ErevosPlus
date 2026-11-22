// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Web addresses in messages (lib/links.ts), and links that open Erevos (lib/open-link.ts).
// Run with: npm run check
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { test } from 'node:test';

import { handOverCall, takeCall } from '../lib/call-handoff';
import { splitLinks } from '../lib/links';
import { dropLink, holdLink, setupKeepsLink, hrefLink, ICON_LINK, keepLink, KEEP_MS, linkHref, linkMove, linkParts, lockingKeepsLink, onLinkHeld, peekLink, RELOCK_MS, screenLink, screenParams, smsOnlyLink, SMS_ONLY_SCREENS, ONLY_SCREENS, onlyPartOf, takeLink } from '../lib/open-link';

import { templateFile } from './expo-template';

const urls = (text: string) => splitLinks(text).flatMap((part) => (part.url ? [part.url] : []));

test('finds web addresses, and leaves the words around them', () => {
  assert.deepEqual(splitLinks('see https://example.org/a?b=1 now'), [{ text: 'see ' }, { text: 'https://example.org/a?b=1', url: 'https://example.org/a?b=1' }, { text: ' now' }]);
  assert.deepEqual(urls('www.example.org and http://x.y/z'), ['https://www.example.org', 'http://x.y/z']);
  assert.equal(splitLinks('no links here').length, 1);
  assert.equal(splitLinks('').length, 0);
});

test('a sentence mark or an unopened bracket after it is not part of it', () => {
  assert.deepEqual(urls('Go to https://example.org/page.'), ['https://example.org/page']);
  assert.deepEqual(urls('(at https://example.org/x)'), ['https://example.org/x']);
  assert.deepEqual(urls('https://en.wikipedia.org/wiki/Foo_(bar)'), ['https://en.wikipedia.org/wiki/Foo_(bar)']);
  assert.deepEqual(urls('«https://example.org»'), ['https://example.org']);
});

test('a long run of marks or brackets after a link takes no longer than its length', () => {
  const started = performance.now();
  assert.deepEqual(urls(`https://example.org/a${'.)'.repeat(20000)} next`), ['https://example.org/a']);
  assert.deepEqual(urls(`https://example.org/(a)${')!'.repeat(20000)}`), ['https://example.org/(a)']);
  assert.deepEqual(urls(`example.org/[a]${'],'.repeat(20000)}`), ['https://example.org/[a]']);
  assert.ok(performance.now() - started < 2000);
});

test('only web addresses: no other kinds of link', () => {
  assert.deepEqual(urls('javascript:alert(1) file:///etc/passwd tel:123'), []);
});

// Links that open Erevos, held while the password screen shows (lib/open-link.ts).

test('a link that opens Erevos names one of its screens, with its details', () => {
  assert.equal(linkHref('erevos://contacts'), '/contacts');
  assert.equal(linkHref('erevos://phone?number=%2B306900000000'), '/phone?number=%2B306900000000');
  assert.equal(linkHref('EREVOS://contact-edit?fill=%7B%7D'), '/contact-edit?fill=%7B%7D');
  assert.equal(linkHref('erevos:///'), '');
  assert.equal(linkHref('erevos://'), '');
  assert.equal(linkHref('https://example.org/contacts'), '');
  assert.equal(linkHref('erevos://../secret'), '');
  assert.deepEqual(linkParts('/phone?number=%2B30%20690&tab=recents'), { path: '/phone', params: { number: '+30 690', tab: 'recents' } });
  assert.deepEqual(linkParts('/contacts'), { path: '/contacts', params: {} });
  assert.deepEqual(linkParts('/sms?to=%E0%A4'), { path: '/sms', params: { to: '%E0%A4' } });
});

test("another app's Share opens Send to with its words, and a photo or file by the id it was encrypted under", () => {
  // As ShareActivity.kt makes it: Android's Uri.Builder writes a space as %20 and + as %2B.
  const href = linkHref('erevos://share?text=https%3A%2F%2Fexample.org%2Fa%3Fb%3D1%2B2%20%CE%B5&sealed=0123456789abcdef0123456789abcdef&name=IMG%201.jpg&mime=image%2Fjpeg');
  assert.equal(linkMove(href, { path: '/', hidden: false }), 'push');
  assert.deepEqual(linkParts(href), {
    path: '/share',
    params: { text: 'https://example.org/a?b=1+2 ε', sealed: '0123456789abcdef0123456789abcdef', name: 'IMG 1.jpg', mime: 'image/jpeg' },
  });
  assert.equal(linkMove(linkHref('erevos://share?large=1'), { path: '/share', hidden: false }), 'params');
});

test('a link waits for the password, a few minutes at most, and opens once', () => {
  let told = 0;
  const stop = onLinkHeld(() => told++);
  holdLink('erevos://contacts', 1000);
  assert.equal(told, 1);
  assert.equal(takeLink(2000), '/contacts');
  assert.equal(takeLink(2000), null);
  holdLink('erevos://phone', 1000);
  assert.equal(takeLink(1000 + KEEP_MS + 1), null);
  holdLink('erevos:///', 1000);
  assert.equal(takeLink(1000), null);
  assert.equal(told, 2, 'the home screen is no link');
  stop();
  holdLink('erevos://phone', 1000);
  assert.equal(told, 2);
  takeLink(1000);
});

test('a link opened just before Erevos locks opens again after the password', () => {
  holdLink('erevos://contacts', 1000);
  assert.equal(takeLink(1000), '/contacts');
  lockingKeepsLink(1000 + RELOCK_MS);
  assert.equal(takeLink(5000), '/contacts');
  // Locking later, or again, does not bring it back.
  lockingKeepsLink(5000 + RELOCK_MS + 1);
  assert.equal(takeLink(9000), null);
  lockingKeepsLink(9000);
  assert.equal(takeLink(9000), null);
});

test('the home screen with details is a link too, as the widget gives it', () => {
  assert.equal(linkHref('erevos://?show=sms'), '/?show=sms');
  assert.equal(linkHref('erevos:///?show=erevos'), '/?show=erevos');
  assert.equal(linkHref('erevos://?'), '');
  assert.deepEqual(linkParts('/?show=sms'), { path: '/', params: { show: 'sms' } });
});

test("the launcher's icons and the widget show what they name each time, also a second time", () => {
  const on = (path: string, hidden = false) => ({ path, hidden });
  const sms = linkHref('erevos://?show=sms');
  const chats = linkHref(ICON_LINK);
  assert.equal(chats, '/?show=erevos&from=launcher');
  // The home screen is gone back to, from wherever, with the link's tab, also when it shows already.
  assert.equal(linkMove(sms, on('/')), 'back');
  assert.equal(linkMove(sms, on('/chat')), 'back');
  assert.equal(linkMove(chats, on('/')), 'back');
  assert.equal(linkMove(chats, on('/sms')), 'back');
  assert.equal(linkMove(chats, on('/phone')), 'back');
  assert.equal(linkMove(linkHref('erevos://?show=erevos'), on('/chat')), 'back', "the widget's Messages button");
  // Erevos's own icon leaves one of its chats as it was.
  assert.equal(linkMove(chats, on('/chat')), 'stay');
  assert.equal(linkMove(chats, on('/group')), 'stay');
  assert.equal(linkMove(chats, on('/public-group')), 'stay');
  // The Phone and Contacts showing take the link afresh; a hidden place's Contacts is left, and
  // the space's open over it, as a screen that is not there opens over the one on top.
  assert.equal(linkMove('/phone', on('/phone')), 'back');
  assert.equal(linkMove('/phone?tab=recents', on('/phone')), 'back');
  assert.equal(linkMove('/contacts', on('/contacts')), 'back');
  assert.equal(linkMove('/contacts', on('/contacts', true)), 'push');
  assert.equal(linkMove('/phone', on('/contacts')), 'push');
  assert.equal(linkMove('/contacts', on('/')), 'push');
  // Another screen showing only takes the link's details, as before.
  assert.equal(linkMove('/sms?to=123', on('/sms')), 'params');
  // Opened again, a link's details change each time, so the screen shows its tab again.
  assert.deepEqual(screenParams(sms, 1000), { show: 'sms', opened: '1000' });
  assert.notDeepEqual(screenParams(sms, 2000), screenParams(sms, 1000));
  assert.deepEqual(screenParams('/phone', 5), { opened: '5' });
});

test('a held link can be looked at, as the locked Phone does, and stays held', () => {
  holdLink('erevos://phone?tab=recents', 1000);
  assert.equal(peekLink(2000), '/phone?tab=recents');
  assert.equal(peekLink(1000 + KEEP_MS + 1), null, 'too old');
  assert.equal(takeLink(2000), '/phone?tab=recents');
  assert.equal(peekLink(2000), null);
});

test('the SMS icon, the widget and an SMS notice open only the SMS; every other link opens all', () => {
  for (const url of ['erevos://?show=sms', 'erevos://?show=sms&opened=1', 'erevos://sms?to=%2B3069', 'erevos://sms-folder?folder=spam']) assert.equal(smsOnlyLink(linkHref(url)), true, url);
  for (const url of ['erevos://', 'erevos://?show=erevos', ICON_LINK, 'erevos://?show=all', 'erevos://phone', 'erevos://contacts', 'erevos://chat?contact=ab', 'erevos://sms-settings', 'erevos://smsx']) assert.equal(smsOnlyLink(linkHref(url)), false, url);
  assert.equal(smsOnlyLink(null), false);
  // The screens it opens are the SMS list (on the home screen), a conversation and the folders.
  assert.deepEqual([...SMS_ONLY_SCREENS].sort(), ['index', 'sms', 'sms-folder']);
});

test('the Contacts icon and the widget open only the Contacts and their own screens', () => {
  for (const url of ['erevos://contacts', 'erevos://contacts?add=%2B3069', 'erevos://contact-card?id=4', 'erevos://contact-edit?fill=x', 'erevos://contact-groups', 'erevos://contact-duplicates', 'erevos://contact-sim', 'erevos://contact-import'])
    assert.equal(onlyPartOf(linkHref(url)), 'contacts', url);
  for (const url of ['erevos://?show=sms', 'erevos://sms?to=%2B3069']) assert.equal(onlyPartOf(linkHref(url)), 'sms', url);
  for (const url of ['erevos://', ICON_LINK, 'erevos://phone', 'erevos://chat?contact=ab', 'erevos://contact-maker', 'erevos://contactsx', 'erevos://relay-invite?code=1'])
    assert.equal(onlyPartOf(linkHref(url)), null, url);
  assert.equal(onlyPartOf(null), null);
  // A call or an SMS from a contact, its chat in Erevos, its history: the rest of Erevos, behind the password.
  for (const screen of ['phone', 'sms', 'chat', 'settings']) assert.equal(ONLY_SCREENS.contacts.has(screen), false, screen);
  assert.equal(ONLY_SCREENS.contacts.has('index'), true);
});

// As app/_layout.tsx has it: with only the Contacts open, the screens' link handler (OpenLink) asks
// for the password again for a link to anything else, and the password screen keeps that link for
// after. Told of it, the handler would take it at once and ask again, without end: "Maximum call
// stack size exceeded" on the Pixel (4.0.0-rc.9), from a contact's chat or SMS, a screen that asks
// again (AskAgain), or another icon.
test('a link kept for after the password is not taken again by the screens that are going', () => {
  dropLink();
  let taken = 0;
  const askAgain = (link: string) => {
    dropLink();
    keepLink(link);
  };
  const stop = onLinkHeld(() => {
    const href = takeLink();
    if (!href) return;
    taken += 1;
    if (taken > 3) throw new Error('asked again without end');
    if (onlyPartOf(href) !== 'contacts') askAgain(hrefLink(href));
  });
  try {
    holdLink('erevos://chat?contact=ab');
    assert.equal(taken, 1);
    assert.equal(peekLink(), '/chat?contact=ab');
    // Kept again, quietly: the screens going take nothing; after the password it opens.
    askAgain('erevos://sms?to=%2B3069');
    assert.equal(taken, 1);
    assert.equal(takeLink(), '/sms?to=%2B3069');
  } finally {
    stop();
    dropLink();
  }
});

test('a screen asked for with only the SMS open is held as a link, and opens after the password', () => {
  assert.equal(screenLink('contacts'), 'erevos://contacts');
  assert.equal(screenLink('chat', { contact: 'ab', phone: '+30 69' }), 'erevos://chat?contact=ab&phone=%2B30%2069');
  assert.equal(linkHref(screenLink('chat', { contact: 'ab', phone: '+30 69' })), '/chat?contact=ab&phone=%2B30%2069');
  assert.equal(linkParts(linkHref(screenLink('chat', { contact: 'ab', phone: '+30 69' }))).params.phone, '+30 69');
  // Only words and numbers go: what is not a detail of the screen does not.
  assert.equal(screenLink('phone', { tab: 'recents', screen: { x: 1 }, n: 2 }), 'erevos://phone?tab=recents&n=2');
  assert.equal(screenLink('settings/index'), 'erevos://settings');
  assert.equal(screenLink('index'), '');
  assert.equal(screenLink('guide/[id]', { id: 'lock' }), '');
  // A link taken while only the SMS show, back to a link to hold.
  assert.equal(linkHref(hrefLink('/?show=erevos&from=launcher')), '/?show=erevos&from=launcher');
  assert.equal(linkHref(hrefLink('/phone?tab=recents')), '/phone?tab=recents');
  // The password asked again forgets the SMS link just opened, and holds the screen asked for.
  holdLink('erevos://?show=sms', 1000);
  assert.equal(takeLink(1000), '/?show=sms');
  lockingKeepsLink(1500);
  assert.equal(peekLink(1500), '/?show=sms');
  dropLink();
  assert.equal(peekLink(1500), null);
  holdLink(screenLink('contacts'), 1500);
  assert.equal(smsOnlyLink(peekLink(1500)), false);
  assert.equal(takeLink(1500), '/contacts');
  lockingKeepsLink(1600);
  dropLink();
  assert.equal(peekLink(1600), null);
});

test('a call starts with a chat only when a tap in Erevos asked for it, once, for that contact', () => {
  const alice = 'a'.repeat(64);
  const bob = 'b'.repeat(64);
  // A link from outside names a chat and nothing more: no call waits for it.
  assert.deepEqual(linkParts(linkHref('erevos://chat?contact=' + alice + '&call=video')).params.call, 'video');
  assert.equal(takeCall(alice), null);
  handOverCall(alice, 'video', 1000);
  assert.equal(takeCall(alice, 2000), 'video');
  assert.equal(takeCall(alice, 2000), null);
  handOverCall(alice, 'voice', 1000);
  assert.equal(takeCall(bob, 2000), null);
  assert.equal(takeCall(alice, 2000), null);
  handOverCall(alice, 'voice', 1000);
  assert.equal(takeCall(alice, 1000 + 31_000), null);
});

test('another icon, with only the SMS open, waits for the password and then opens what it names alone', () => {
  dropLink();
  // The layout takes the Contacts icon's link with only the SMS open (app/_layout.tsx OpenLink)…
  holdLink('erevos://contacts', 1000);
  const href = takeLink(1000);
  assert.equal(href, '/contacts');
  assert.notEqual(onlyPartOf(href), 'sms');
  // …keeps it, quietly, and locks: the password then opens only the Contacts.
  keepLink(hrefLink(href ?? ''), 1000);
  lockingKeepsLink(1000);
  assert.equal(peekLink(1000), '/contacts');
  assert.equal(onlyPartOf(peekLink(1000)), 'contacts');
  // Erevos's own icon opens all of it after the password, as when locked.
  assert.equal(onlyPartOf(linkHref(ICON_LINK)), null);
  dropLink();
});

test('the link that brought Erevos back stays its intent, and Back puts it behind (plugins/with-latest-intent.js)', async () => {
  const require = createRequire(import.meta.url);
  const config = require('../app.config.js') as (c: { config: Record<string, unknown> }) => Record<string, any>;
  const app = (JSON.parse(readFileSync(join(import.meta.dirname, '../app.json'), 'utf8')) as { expo: Record<string, unknown> }).expo;
  assert.ok(config({ config: app }).plugins.includes('./plugins/with-latest-intent'));
  const plugin = require('../plugins/with-latest-intent.js') as (c: Record<string, unknown>) => { mods: { android: { mainActivity: (c: unknown) => Promise<any> } } };
  const made = async (contents: string) =>
    (await plugin({ name: 'Erevos', slug: 'erevos' }).mods.android.mainActivity({
      modResults: { language: 'kt', contents },
      modRequest: { platform: 'android', modName: 'mainActivity' },
      modRawConfig: {},
    })).modResults.contents as string;
  const template = templateFile('/MainActivity.kt');
  const once = await made(template);
  assert.match(once, /class MainActivity : ReactActivity\(\) \{\n.*\n  override fun onNewIntent\(intent: android\.content\.Intent\) \{\n    setIntent\(intent\)\n    super\.onNewIntent\(intent\)\n  \}\n/);
  assert.match(once, /override fun invokeDefaultOnBackPressed\(\) \{\n.*\n      if \(isTaskRoot && moveTaskToBack\(false\)\) return\n/);
  assert.equal(await made(once), once);
  await assert.rejects(made(template.replace('override fun invokeDefaultOnBackPressed()', 'fun back()')), /invokeDefaultOnBackPressed/);
  // Opened again from the recent apps, the link Erevos first came with is not opened again.
  const icons = readFileSync(join(import.meta.dirname, '../modules/erevos-icons/android/src/main/java/expo/modules/erevosicons/ErevosIconsPackage.kt'), 'utf8');
  assert.match(icons, /FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY\) != 0\) forgetLink\(intent\)/);
});

test('an invite held through the first start\'s setup still opens after it, however long it took', () => {
  dropLink();
  holdLink('erevos://welcome?id=a', 1000);
  setupKeepsLink(1000 + 3 * KEEP_MS);
  assert.equal(takeLink(1000 + 3 * KEEP_MS + 10), '/welcome?id=a');
  setupKeepsLink(5000);
  assert.equal(takeLink(5000), null, 'nothing held, nothing made up');
});

test('Erevos\'s invite and contact pages open their screens in the app', () => {
  assert.equal(linkHref('https://erevos-web.lphl.nekten.eu/i#AQAbc-_9'), '/text-invite?d=AQAbc-_9');
  assert.equal(linkHref('https://erevos-web.lphl.nekten.eu/i/#AQAbc'), '/text-invite?d=AQAbc');
  assert.equal(linkHref('/i#AQAbc'), '/text-invite?d=AQAbc');
  assert.equal(linkHref('https://erevos-web.lphl.nekten.eu/c#id=ab&relay=wss%3A%2F%2Fr.example&key=Zz-_&n=Maria'), '/contact?id=ab&relay=wss%3A%2F%2Fr.example&key=Zz-_&n=Maria');
  // Other pages of the server, other servers, and odd data are no link.
  assert.equal(linkHref('https://erevos-web.lphl.nekten.eu/chat#x'), '');
  assert.equal(linkHref('https://evil.example/i#AQAbc'), '');
  assert.equal(linkHref('https://erevos-web.lphl.nekten.eu/i#a<b'), '');
  assert.equal(linkHref('https://erevos-web.lphl.nekten.eu/i'), '');
});

test('a bare web name with a known ending is a link too, as Telegram and Signal show it; e-mail and file names are not', () => {
  assert.deepEqual(urls('join t.me/erevos now'), ['https://t.me/erevos']);
  assert.deepEqual(urls('see example.org/page?x=1.'), ['https://example.org/page?x=1']);
  assert.deepEqual(urls('lphl.nekten.eu'), ['https://lphl.nekten.eu']);
  assert.deepEqual(urls('write to me@example.org'), []);
  assert.deepEqual(urls('photo.jpg and notes.txt, v1.2'), []);
  assert.deepEqual(urls('https://example.org/a.com'), ['https://example.org/a.com']);
});

test('a very long run of names, dots and dashes is read in one go, with no pattern inside a pattern (it closed the app on Hermes)', () => {
  const source = readFileSync(join(import.meta.dirname, '../lib/links.ts'), 'utf8');
  assert.ok(!/new RegExp|\)\+|\)\*/.test(source.replace(/\/\/.*$/gm, '')), 'no repeating group in lib/links.ts');
  const long = `${'a.'.repeat(100_000)}com ${'x-'.repeat(50_000)} https://${'y'.repeat(50_000)} ${'('.repeat(20_000)}`;
  const started = Date.now();
  const found = urls(long);
  assert.ok(Date.now() - started < 2000);
  assert.deepEqual(found, [`https://${'y'.repeat(50_000)}`]);
  assert.deepEqual(urls(`(${'ab-cd.'.repeat(30)}gr) and «t.me/x»`), [`https://${'ab-cd.'.repeat(30)}gr`, 'https://t.me/x']);
});
