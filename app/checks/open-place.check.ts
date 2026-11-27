// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Open places (lib/relay.ts takeOpenPlace, crates/erevos-relay/src/open.rs), against a real relay
// with a file of phones' tokens: one that gives them gives a new phone a place by itself, which
// makes queues, sends and takes with it, and hands out no access; it refuses one past each of its
// limits, in all, a day and a day to one address, each refusal told apart by openPlaceRefusal; one
// that does not give them says so; and what the relay counts, `erevos-relay open-places` tells
// without naming any place; and the guide says how many LPHL's server gives and for how long it
// keeps one, and another server, in every language, as What's new does of LPHL's. The relay part is
// skipped, with a note, when the relay is not built.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

import { freePort, ready, relayNote, startRelay } from './real-relay';
import {
  canTryLater,
  createQueue,
  getChunk,
  isDayFull,
  isQueueFull,
  lendTicket,
  listInvites,
  makeInvite,
  newPhoneToken,
  OpenPlaceRefusedError,
  openPlaceRefusal,
  putChunk,
  receiveMessage,
  RelayError,
  RelaySession,
  RelayUnreachableError,
  sendMessage,
  takeOpenPlace,
  takeOwnLine,
  type OpenPlaceRefusal,
  type Relay,
} from '../lib/relay';

const binary = new URL('../../target/debug/erevos-relay', import.meta.url).pathname;
relayNote('the open place checks');

const sha = (token: string) => createHash('sha256').update(token).digest('hex');
const today = () => new Date().toISOString().slice(0, 10);
const alicesToken = newPhoneToken();

let folder = '';

before(() => {
  folder = mkdtempSync(join(tmpdir(), 'erevos-relay-places-'));
});

after(() => {
  if (folder) rmSync(folder, { recursive: true, force: true });
});

// A file of phones' tokens in the folder, with Alice's line and `more` in it.
function tokens(name: string, more = ''): string {
  const file = join(folder, name);
  writeFileSync(file, `${sha(alicesToken)} alice\n${more}`);
  return file;
}

// Why the relay at `url` gave no open place; it must give none.
async function refused(url: string): Promise<OpenPlaceRefusal | null> {
  const error = await takeOpenPlace(url).then(
    () => assert.fail('it gave a place'),
    (error: unknown) => error,
  );
  assert.ok(error instanceof RelayError, 'a RelayError');
  return openPlaceRefusal(error);
}

test('only what takeOpenPlace throws for a place not given reads as a refusal', () => {
  assert.equal(openPlaceRefusal(new OpenPlaceRefusedError('day', 7)), 'day');
  assert.equal(openPlaceRefusal(new OpenPlaceRefusedError('address', 8)), 'address');
  assert.equal(openPlaceRefusal(new RelayError('create: queue is full', 2)), null);
  assert.equal(openPlaceRefusal(new RelayUnreachableError('no connection')), null);
  assert.equal(openPlaceRefusal(new Error('something else')), null);
  assert.equal(openPlaceRefusal(null), null);
});

// LPHL's server is set to give 3000 open places, 300 a day and 5 a day to one address, and to take
// one out after 100 days without its phone, or 30 when it never came back after its first day
// (EREVOS_RELAY_OPEN_PLACES, _DAY, _PER_ADDRESS, _UNUSED_DAYS, _FIRST_DAYS); another server gives
// and takes out what the relay does unless set otherwise (crates/erevos-relay/src/open.rs).
test("the guide says how many open places LPHL's server gives and how long it keeps them, and another server, in every language", () => {
  const open = readFileSync(new URL('../../crates/erevos-relay/src/open.rs', import.meta.url), 'utf8');
  const given = ['PLACES', 'DAY', 'PER_ADDRESS', 'UNUSED_DAYS', 'FIRST_DAYS'].map(
    (name) => open.match(new RegExp(`pub const DEFAULT_${name}: u64 = (\\d+);`))?.[1],
  );
  assert.deepEqual(given, ['1000', '100', '3', '60', '7']);
  for (const lang of ['en', 'de', 'el', 'es', 'fr', 'it', 'pt', 'sh']) {
    const text = readFileSync(new URL(`../guide/${lang}.ts`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
    assert.match(
      text,
      /\bLPHL\b[^.]*?\b3000\b[^.]*?\b300\b[^.]*?\b5\b[^.]*?\b100\b[^.]*?\b30\b[^.]*?\b1000, 100 \S+ 3\b[^.]*?\b60\b[^.]*?\b7\b/,
      lang,
    );
  }
  // What's new says LPHL's days too, in English and in each translation.
  for (const lang of ['de', 'el', 'es', 'fr', 'it', 'pt', 'sh']) {
    const lines = readFileSync(new URL(`../i18n/${lang}/whats-new.ts`, import.meta.url), 'utf8').split('\n');
    const at = lines.findIndex((line) => line.includes("**LPHL's server, by itself**"));
    assert.ok(at >= 0, lang);
    for (const line of lines.slice(at, at + 2)) assert.match(line, /\b100\b[^.]*\b30\b/, lang);
  }
});

// A relay that gives open places, invites and lends: Alice has a line of her own on it, and a new
// phone takes a place.
let file = '';
let url = '';
let alice: Relay = { url: '' };
let place = { token: '', name: '' };
let phone: Relay = { url: '' };

test('a relay that gives open places gives a new phone one, which makes queues, sends and takes with it', { skip: !ready }, async () => {
  file = tokens('given.tokens');
  url = await startRelay(true, '', false, {
    EREVOS_RELAY_TOKENS: file,
    EREVOS_RELAY_INVITES: 'on',
    EREVOS_RELAY_OPEN: 'on',
    EREVOS_RELAY_OPEN_QUEUES: '2',
  });
  alice = { url, token: alicesToken };

  place = await takeOpenPlace(url);
  assert.match(place.name, /^open-[0-9a-f]{8}$/);
  assert.match(place.token, /^[0-9a-f]{64}$/);
  const text = readFileSync(file, 'utf8');
  assert.ok(text.includes(`${sha(place.token)} ${place.name} # open place on ${today()}\n`), 'its line, saying it is an open place and when it was made');
  assert.ok(text.startsWith(`${sha(alicesToken)} alice\n`), 'the rest of the file as it was');
  assert.ok(!text.includes(place.token), 'the relay holds no token');

  phone = { url, token: place.token };
  const theirs = await createQueue(phone);
  const hers = await createQueue(alice);
  await sendMessage(alice, theirs.senderId, new TextEncoder().encode('welcome'));
  assert.equal(new TextDecoder().decode((await receiveMessage(phone, theirs.recipientId))!), 'welcome');
  await sendMessage(phone, hers.senderId, new TextEncoder().encode('thanks'));
  assert.equal(new TextDecoder().decode((await receiveMessage(alice, hers.recipientId))!), 'thanks');

  // Another phone takes a place of its own, with its own token.
  const other = await takeOpenPlace(url);
  assert.notEqual(other.token, place.token);
  assert.notEqual(other.name, place.name);
  assert.ok(readFileSync(file, 'utf8').includes(`${sha(other.token)} ${other.name} # open place on ${today()}\n`));
});

test('an open place makes only so many queues a day, and is told it is its day that is used', { skip: !ready }, async () => {
  // One made above, and EREVOS_RELAY_OPEN_QUEUES is 2.
  await createQueue(phone);
  await assert.rejects(createQueue(phone), (error) => isDayFull(error) && !isQueueFull(error) && canTryLater(error) && (error as Error).message.includes('It goes on tomorrow'));
  assert.ok(await createQueue(alice), 'a phone with a line of its own has no such limit');
});

test("an open place moves only so many megabytes of files a day, and is told so in plain words", { skip: !ready }, async () => {
  const relay = await startRelay(false, '', false, {
    EREVOS_RELAY_TOKENS: tokens('files.tokens'),
    EREVOS_RELAY_OPEN: 'on',
    EREVOS_RELAY_OPEN_FILES_MB: '1',
  });
  const own = { url: relay, token: (await takeOpenPlace(relay)).token };
  const session = await RelaySession.open(own);
  try {
    const half = new Uint8Array(512 * 1024);
    const id = await putChunk(session, half);
    // Taking it back counts too: 1 MB in all.
    assert.equal((await getChunk(session, id))?.length, half.length);
    await assert.rejects(putChunk(session, half), (error) => isDayFull(error) && (error as Error).message.includes('Files go again tomorrow'));
  } finally {
    session.close();
  }
});

test('an open place invites no one, lends no place and takes no line of its own', { skip: !ready }, async () => {
  assert.equal(await makeInvite(phone, 'Maria'), null);
  assert.equal(await listInvites(phone), null);
  assert.equal(await lendTicket(phone), null);
  assert.equal(await takeOwnLine(phone, 'mine'), null);
  // While Alice, with a line of her own, does.
  assert.ok(await makeInvite(alice, 'Maria'));
  assert.ok(await lendTicket(alice));
});

test('erevos-relay open-places counts them from the files alone, naming none', { skip: !ready }, () => {
  const said = execFileSync(binary, ['open-places'], { env: { ...process.env, EREVOS_RELAY_TOKENS: file }, encoding: 'utf8' });
  assert.ok(said.includes(`Open places in ${file}: 2\n`), said);
  assert.ok(said.includes('Made today: 2; in the last 7 days: 2\n'), said);
  assert.ok(said.includes('Used today: 2; in the last 7 days: 2; in the last 30 days: 2\n'), said);
  assert.ok(!said.includes(place.name) && !said.includes(sha(place.token)) && !said.includes('alice'), said);
});

test('a relay gives so many open places a day to phones from one address', { skip: !ready }, async () => {
  const relay = await startRelay(false, '', false, { EREVOS_RELAY_TOKENS: tokens('address.tokens'), EREVOS_RELAY_OPEN: 'on', EREVOS_RELAY_OPEN_PER_ADDRESS: '2' });
  await takeOpenPlace(relay);
  await takeOpenPlace(relay);
  // Every phone here comes from 127.0.0.1.
  assert.equal(await refused(relay), 'address');
});

test('a relay gives so many open places a day', { skip: !ready }, async () => {
  const relay = await startRelay(false, '', false, { EREVOS_RELAY_TOKENS: tokens('day.tokens'), EREVOS_RELAY_OPEN: 'on', EREVOS_RELAY_OPEN_DAY: '2', EREVOS_RELAY_OPEN_PER_ADDRESS: '5' });
  await takeOpenPlace(relay);
  await takeOpenPlace(relay);
  assert.equal(await refused(relay), 'day');
});

test('a relay gives so many open places in all, a line named open-… counting whoever wrote it', { skip: !ready }, async () => {
  const written = `${sha(newPhoneToken())} open-cafe0001 # open place on ${today()}\n`;
  const capped = tokens('full.tokens', written);
  const relay = await startRelay(false, '', false, { EREVOS_RELAY_TOKENS: capped, EREVOS_RELAY_OPEN: 'on', EREVOS_RELAY_OPEN_PLACES: '2' });
  await takeOpenPlace(relay);
  assert.equal(await refused(relay), 'full');
  // One taken out of the file makes room for one more.
  writeFileSync(capped, readFileSync(capped, 'utf8').replace(written, ''));
  assert.match((await takeOpenPlace(relay)).name, /^open-/);
});

test('a relay that does not give open places says so, and adds no line', { skip: !ready }, async () => {
  const settings: Record<string, string>[] = [{}, { EREVOS_RELAY_OPEN: 'off' }, { EREVOS_RELAY_OPEN: 'yes' }];
  for (const [i, setting] of settings.entries()) {
    const quiet = tokens(`quiet-${i}.tokens`);
    const relay = await startRelay(false, '', false, { EREVOS_RELAY_TOKENS: quiet, ...setting });
    assert.equal(await refused(relay), 'off', JSON.stringify(setting));
    assert.equal(readFileSync(quiet, 'utf8'), `${sha(alicesToken)} alice\n`);
  }
  // Nor does one with no file of phones' tokens.
  assert.equal(await refused(await startRelay()), 'off');
});

test('a relay that cannot be reached gives no refusal: it may give a place later', { skip: !ready }, async () => {
  const error = await takeOpenPlace(`ws://127.0.0.1:${await freePort()}`).then(
    () => assert.fail('it gave a place'),
    (error: unknown) => error,
  );
  assert.ok(error instanceof RelayUnreachableError);
  assert.equal(openPlaceRefusal(error), null);
});

test('a relay set to give open places with no file of tokens, or a limit that is no number, does not start', { skip: !ready }, async () => {
  const [tcp, ws] = [await freePort(), await freePort()];
  const phones = tokens('start.tokens');
  const settings: [Record<string, string>, RegExp][] = [
    [{ EREVOS_RELAY_OPEN: 'on' }, /EREVOS_RELAY_TOKENS/],
    [{ EREVOS_RELAY_OPEN: 'on', EREVOS_RELAY_TOKENS: phones, EREVOS_RELAY_OPEN_PLACES: '0' }, /EREVOS_RELAY_OPEN_PLACES/],
    [{ EREVOS_RELAY_OPEN: 'on', EREVOS_RELAY_TOKENS: phones, EREVOS_RELAY_OPEN_DAY: 'many' }, /EREVOS_RELAY_OPEN_DAY/],
  ];
  for (const [more, says] of settings) {
    const run = spawnSync(binary, [`127.0.0.1:${tcp}`, `127.0.0.1:${ws}`], {
      env: { ...process.env, EREVOS_RELAY_TOKEN: '', EREVOS_RELAY_TOKENS: '', ...more },
      timeout: 10_000,
      encoding: 'utf8',
    });
    assert.equal(run.status, 1, JSON.stringify(more));
    assert.match(run.stderr, says);
  }
});
