// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The servers a build names by itself (lib/servers.ts): LPHL's unless the build names a
// community's own (app.config.js, EREVOS_WEB_ORIGIN and EREVOS_START_RELAY); what stays LPHL's in
// every build (an invite by SMS with no relay in it, the release notices); and that contact pages
// and invites by SMS on any web server are read when pasted or scanned, while only the build's own
// server and LPHL's open a screen by themselves. And what the owner types in the app for servers
// of their own: a relay's address in plain words (lib/own-server.ts) and a web folder for the
// models (lib/models-server.ts). And that the screens offer them where the words say they do
// (app/chat.tsx, app/first-steps.tsx, components/own-server.tsx, the models' sheets).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';

import { CONTACT_PAGE, contactLink, contactPageLink, parseContact, type ContactCode } from '../lib/contact-code';
import { randomBytes, toHex } from '../lib/crypto';
import { toBase64Url } from '../lib/e2e';
import { MODELS_DEFAULT, modelsFolder } from '../lib/models-server';
import { linkHref } from '../lib/open-link';
import { ownServerAddress } from '../lib/own-server';
import { mayAsk, NOTICE_SERVER } from '../lib/release-notice';
import { LPHL_RELAY, LPHL_WEB, pageLink, START_RELAY, startRelayOf, WEB_ORIGIN, webOriginOf } from '../lib/servers';
import { parseTextInvite, TEXT_INVITE_PAGE, textInviteLink, type TextInvite } from '../lib/text-invite';
import { STATEMENT_URL } from '../lib/update-signature';

const require = createRequire(import.meta.url);
const appConfig = require('../app.config.js') as (input: { config: Record<string, unknown> }) => {
  extra: Record<string, unknown>;
  android: { intentFilters: { data: { host?: string }[] }[] };
};
const APP_JSON = JSON.parse(readFileSync(join(import.meta.dirname, '../app.json'), 'utf8')).expo;

const COMMUNITY = 'https://erevos.community.example';

test('a build that names nothing uses LPHL', () => {
  assert.equal(WEB_ORIGIN, LPHL_WEB);
  assert.equal(START_RELAY, LPHL_RELAY);
  assert.equal(CONTACT_PAGE, `${LPHL_WEB}/c`);
  assert.equal(TEXT_INVITE_PAGE, `${LPHL_WEB}/i`);
});

test('what the build names is taken only when shaped as an origin or a relay', () => {
  assert.equal(webOriginOf(COMMUNITY), COMMUNITY);
  assert.equal(webOriginOf('https://erevos.community.example:8443'), 'https://erevos.community.example:8443');
  for (const wrong of ['', 'http://erevos.community.example', 'https://erevos.community.example/', 'https://erevos.community.example/c', 'https://localhost', 'javascript:alert(1)', 'https://a b.example'])
    assert.equal(webOriginOf(wrong), LPHL_WEB, wrong);
  assert.equal(startRelayOf('wss://relay.community.example'), 'wss://relay.community.example');
  for (const wrong of ['', 'ws://relay.community.example', 'wss://relay.community.example/x', 'https://relay.community.example'])
    assert.equal(startRelayOf(wrong), LPHL_RELAY, wrong);
});

test('the build settings name the pages, the relay and the server Android opens in Erevos', () => {
  const was = { web: process.env.EREVOS_WEB_ORIGIN, relay: process.env.EREVOS_START_RELAY };
  try {
    delete process.env.EREVOS_WEB_ORIGIN;
    delete process.env.EREVOS_START_RELAY;
    const plain = appConfig({ config: APP_JSON });
    assert.equal(plain.extra.webOrigin, undefined);
    assert.equal(plain.extra.startRelay, undefined);
    assert.deepEqual(plain.android.intentFilters, APP_JSON.android.intentFilters);
    process.env.EREVOS_WEB_ORIGIN = COMMUNITY;
    process.env.EREVOS_START_RELAY = 'wss://relay.community.example';
    const own = appConfig({ config: APP_JSON });
    assert.equal(own.extra.webOrigin, COMMUNITY);
    assert.equal(own.extra.startRelay, 'wss://relay.community.example');
    const hosts = own.android.intentFilters.flatMap((filter) => filter.data.map((data) => data.host));
    assert.ok(hosts.length >= 4);
    assert.ok(hosts.every((host) => host === 'erevos.community.example'), hosts.join());
    process.env.EREVOS_WEB_ORIGIN = 'https://erevos.community.example/c';
    assert.throws(() => appConfig({ config: APP_JSON }), /EREVOS_WEB_ORIGIN/);
    process.env.EREVOS_WEB_ORIGIN = COMMUNITY;
    process.env.EREVOS_START_RELAY = 'ws://relay.community.example';
    assert.throws(() => appConfig({ config: APP_JSON }), /EREVOS_START_RELAY/);
  } finally {
    if (was.web === undefined) delete process.env.EREVOS_WEB_ORIGIN;
    else process.env.EREVOS_WEB_ORIGIN = was.web;
    if (was.relay === undefined) delete process.env.EREVOS_START_RELAY;
    else process.env.EREVOS_START_RELAY = was.relay;
  }
});

test("Erevos's own releases are told of by LPHL in every build, and only to phones on LPHL's relay", () => {
  assert.equal(NOTICE_SERVER, `${LPHL_WEB}/`);
  assert.equal(STATEMENT_URL, `${LPHL_WEB}/android-update.json`);
  assert.equal(mayAsk({ url: LPHL_RELAY, tor: 'off' }), true);
  assert.equal(mayAsk({ url: 'wss://relay.community.example', tor: 'off' }), false);
});

test('a page link on any server gives what follows #, for its own page only', () => {
  assert.equal(pageLink(`${COMMUNITY}/c#id=ab`, 'c'), 'id=ab');
  assert.equal(pageLink(`${COMMUNITY}/c/#id=ab`, 'c'), 'id=ab');
  assert.equal(pageLink('HTTPS://Erevos.Community.Example:8443/C#id=ab', 'c'), 'id=ab');
  assert.equal(pageLink(`${COMMUNITY}/i#AQ`, 'c'), null);
  assert.equal(pageLink(`${COMMUNITY}/x/c#id=ab`, 'c'), null);
  assert.equal(pageLink('http://erevos.community.example/c#id=ab', 'c'), null);
  assert.equal(pageLink('erevos://contact?id=ab', 'c'), null);
});

test("a contact page and an invite by SMS on a community's server are read as LPHL's are", () => {
  const code: ContactCode = { senderHex: 'ab'.repeat(24), relayUrl: 'wss://relay.community.example', key: 'Ab_-'.repeat(450) };
  const page = contactPageLink(contactLink(code), 'Μαρία')!;
  const moved = page.replace(LPHL_WEB, COMMUNITY);
  assert.notEqual(moved, page);
  assert.deepEqual(parseContact(moved), parseContact(page));
  const invite: TextInvite = {
    sender: toHex(randomBytes(24)),
    key: randomBytes(32),
    code: toHex(randomBytes(32)),
    relay: LPHL_RELAY,
    relayKey: toBase64Url(randomBytes(32)),
    name: 'Νίκος',
    expires: 1_800_000_000_000,
  };
  const link = textInviteLink(invite);
  assert.deepEqual(parseTextInvite(link.replace(LPHL_WEB, COMMUNITY)), invite);
  assert.deepEqual(parseTextInvite(link.replace(LPHL_WEB, COMMUNITY).replace('/i#', '/i/#')), invite);
});

test("only the build's own server and LPHL's open a screen by themselves", () => {
  assert.equal(linkHref(`${LPHL_WEB}/i#AQAbc`), '/text-invite?d=AQAbc');
  assert.equal(linkHref(`${COMMUNITY}/i#AQAbc`), '');
  assert.equal(linkHref(`${COMMUNITY}/c#id=ab`), '');
  assert.equal(linkHref('https://erevos-web.lphl.nekten.eu.evil.example/c#id=ab'), '');
});

test("the web pages link to themselves on the server that serves them", () => {
  for (const [file, name, page] of [
    ['../../pwa/c/contact.js', 'erevosContactPage', 'c'],
    ['../../pwa/i/invite.js', 'erevosInvitePage', 'i'],
  ] as const) {
    const code = readFileSync(join(import.meta.dirname, file), 'utf8');
    const there: Record<string, unknown> = { location: { origin: COMMUNITY } };
    vm.runInNewContext(code, there);
    assert.equal(there[name], `${COMMUNITY}/${page}`);
    // Opened from a file, or where there is no https origin: LPHL's, as before.
    const none: Record<string, unknown> = { location: { origin: 'null' } };
    vm.runInNewContext(code, none);
    assert.equal(none[name], `${LPHL_WEB}/${page}`);
  }
});

test('a server of one\'s own is typed as it was given, with no need to know what wss:// is', () => {
  assert.equal(ownServerAddress(' relay.example.org '), 'wss://relay.example.org');
  assert.equal(ownServerAddress('relay.example.org:8443/erevos/'), 'wss://relay.example.org:8443/erevos');
  assert.equal(ownServerAddress('https://relay.example.org/'), 'wss://relay.example.org');
  assert.equal(ownServerAddress('WSS://relay.example.org'), 'wss://relay.example.org');
  // Without TLS only at home or on this computer: anywhere else the code would cross the internet in the open.
  assert.equal(ownServerAddress('ws://192.168.178.29:7879'), 'ws://192.168.178.29:7879');
  assert.equal(ownServerAddress('http://localhost:7879'), 'ws://localhost:7879');
  assert.equal(ownServerAddress('ws://relay.example.org'), null);
  assert.equal(ownServerAddress('http://relay.example.org'), null);
  for (const wrong of ['', '   ', 'relay example org', 'ftp://relay.example.org', 'wss://', 'wss://user@relay.example.org', 'relay.example.org?x=1', 'relay.example.org#x'])
    assert.equal(ownServerAddress(wrong), null, wrong);
});

test('a web folder for the models is https, with one slash at its end', () => {
  assert.equal(MODELS_DEFAULT, `${LPHL_WEB}/models/`);
  assert.equal(modelsFolder('cloud.example.org/erevos-models'), 'https://cloud.example.org/erevos-models/');
  assert.equal(modelsFolder(' https://cloud.example.org:8443/a/b// '), 'https://cloud.example.org:8443/a/b/');
  assert.equal(modelsFolder('https://cloud.example.org'), 'https://cloud.example.org/');
  for (const wrong of ['', 'http://cloud.example.org/models', 'ftp://cloud.example.org', 'https://user:pass@cloud.example.org/models', 'cloud.example.org/models?x=1', 'cloud.example.org/models#x', 'cloud example.org', 'localhost/models'])
    assert.equal(modelsFolder(wrong), null, wrong);
});

test('a phone with no relay yet is offered every way to begin on one page, in plain words', () => {
  const read = (file: string) => readFileSync(join(import.meta.dirname, file), 'utf8');
  const chat = read('../app/chat.tsx');
  // New chat, for a phone with no relay yet: I have no invite opens the page For advanced users opens.
  assert.ok(chat.includes("...(newcomer ? [{ title: t('I have no invite'), onPress: () => openDoor('advanced') }] : []),"));
  // That page, in order: what a server is, an account at a server, a server of one's own, none.
  const order = [
    '<ServerChoice none={!!ownLink} />',
    '<RelaySignIn url={signInAt}',
    "t('My account is at another server…')",
    "<OwnServerCard open={way === 'server'}",
    "title={t('Start without a server')}",
  ];
  const at = order.map((piece) => chat.indexOf(piece));
  assert.ok(at.every((place) => place > 0), `${at}`);
  assert.deepEqual([...at].sort((a, b) => a - b), at);
  assert.ok(chat.includes('onUse={joinOwnServer} />'));
  // A server of one's own is tried before anything is kept: a mistyped one leaves the phone as it was.
  const joining = chat.slice(chat.indexOf('async function joinOwnServer('), chat.indexOf('async function ownLine('));
  assert.ok(joining.includes('const url = ownServerAddress(typed);'));
  const tried = joining.indexOf('await createQueue({ url, token: token || undefined })');
  assert.ok(tried > 0);
  for (const kept of ['setRelayUrl(url)', 'setRelayToken(token)', 'setOwnQueue(']) assert.ok(joining.indexOf(kept) > tried, kept);
  // The first start names both ways in, and the one with no invite opens that page (setup=relay).
  const first = read('../app/first-steps.tsx');
  assert.ok(first.includes("{t('I have an invite')}") && first.includes("{t('I have no invite')}"));
  assert.ok(first.includes("router.push('/chat?setup=relay')"));
  assert.ok(chat.includes("relaySettings={setup === 'relay'}") && chat.includes("useState<Door>(relaySettings || nearbyOpen ? 'advanced'"));
  // Whoever has neither an account nor a server is told which way is theirs, where that way is offered.
  const own = read('../components/own-server.tsx');
  assert.ok(own.includes('{none ? ('));
  assert.ok(own.includes("t('If you have neither an account nor a server, start without a server: it needs nothing, and you can add one later.')"));
});

test('the sheets that download a model say from where, and take a web folder of one\'s own', () => {
  const read = (file: string) => readFileSync(join(import.meta.dirname, file), 'utf8');
  for (const sheet of ['dictate-sheet', 'translate-sheet', 'speech-sheet']) {
    const code = read(`../components/${sheet}.tsx`);
    assert.ok(code.includes('<ModelsServer />'), sheet);
    assert.ok(code.includes('useModelsHost()'), sheet);
  }
  // Each download asks where the models come from as it starts.
  for (const lib of ['speech', 'translate']) assert.ok(read(`../lib/${lib}.ts`).includes('(await loadModelsServer()) + '), lib);
});
