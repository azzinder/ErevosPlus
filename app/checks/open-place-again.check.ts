// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A free place the server let go (crates/erevos-relay/src/open.rs takes its line out once its phone
// did not connect for long) is asked for again by itself, with the same token (lib/open-place.ts
// reopenPlace), against a real relay with a file of phones' tokens: a channel ended at a token the
// relay no longer has reads as unreachable, as before, and says so (lib/relay.ts RelayTokenError,
// sure over a WebSocket); the same token is given a place again, and the space keeps its queue,
// which the relay still holds. One that may have been the way (through Tor) is tried once more
// first, and the token of another, or a server that gives no place now, changes nothing of the
// space. In a channel, as on a phone: with the real core built to WebAssembly by
// checks/build-core.mjs, and the relay's key pinned. Skipped, with a note, when the relay or the
// core is not built.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';

import { setCore, type Core } from '../lib/core';
import { newSpaceKey, setCurrentSpace } from '../lock/keys';
import { EMPTY_SPACE, loadSpaceData, saveSpaceData } from '../lock/space-data';
import { firstServer, heardRefusal, readFirstServer, takeFirstServer } from '../lib/open-place';
import {
  canTryLater,
  createQueue,
  newPhoneToken,
  onTokenRefused,
  openPlaceRefusal,
  receiveMessage,
  relayKey,
  RelayError,
  RelayTokenError,
  sendMessage,
  takeOpenPlace,
  toHex,
  tokenTaken,
  type Relay,
} from '../lib/relay';
import { ownToken } from '../lib/relay-signin';

import { ready, relayNote, startRelay } from './real-relay';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const go = ready && existsSync(built);
relayNote('the checks of a free place asked for again');
if (ready && !go) console.log('Skipping the checks of a free place asked for again: build the core first (node checks/build-core.mjs)');

const sha = (token: string) => createHash('sha256').update(token).digest('hex');
const text = (bytes: Uint8Array | null) => new TextDecoder().decode(bytes ?? new Uint8Array());
const words = (said: string) => new TextEncoder().encode(said);
const alicesToken = newPhoneToken();

let folder = '';

before(() => {
  folder = mkdtempSync(join(tmpdir(), 'erevos-relay-again-'));
  if (!go) return;
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, call]) => [name, async (...args: never[]) => call(...args)])) as unknown as Core);
});

after(() => {
  setCurrentSpace(null);
  if (folder) rmSync(folder, { recursive: true, force: true });
});

// A file of phones' tokens in the folder, with Alice's line in it.
function tokens(name: string): string {
  const file = join(folder, name);
  writeFileSync(file, `${sha(alicesToken)} alice\n`);
  return file;
}

// The relay takes the line of `token` out, as its hourly look does for a place unused for long.
function letGo(file: string, token: string): void {
  writeFileSync(
    file,
    readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => !line.startsWith(sha(token)))
      .join('\n'),
  );
}

// A relay that gives open places, its key pinned as a phone's is, so requests go in a channel.
async function relayWith(file: string, more: Record<string, string> = {}): Promise<string> {
  const url = await startRelay(true, '', false, { EREVOS_RELAY_TOKENS: file, EREVOS_RELAY_OPEN: 'on', ...more });
  assert.ok(await relayKey({ url, token: alicesToken }), 'the relay says its key');
  return url;
}

const hasLine = (file: string, token: string) => readFileSync(file, 'utf8').includes(`${sha(token)} open-`);

// Until `done` holds, or a few seconds went.
async function until(done: () => boolean): Promise<void> {
  for (let i = 0; i < 100 && !done(); i++) await new Promise((r) => setTimeout(r, 50));
}

test('a channel the relay ends at a token it no longer has says so, and the same token is given a place again with its queues', { skip: !go }, async () => {
  const file = tokens('gone.tokens');
  const url = await relayWith(file);
  const alice: Relay = { url, token: alicesToken };
  const own = await takeOpenPlace(url);
  const mine: Relay = { url, token: own.token };
  const queue = await createQueue(mine);
  assert.equal(await tokenTaken(mine), true);

  const heard: boolean[] = [];
  const stop = onTokenRefused((relay, sure) => {
    if (relay.token === own.token) heard.push(sure);
  });
  try {
    letGo(file, own.token);
    // Unreachable as before, to try again later, with the same words, but told apart.
    await assert.rejects(
      createQueue(mine),
      (error) => error instanceof RelayTokenError && error.sure && canTryLater(error) && (error as Error).message.includes('or the token is wrong'),
    );
    assert.deepEqual(heard, [true]);
    assert.equal(await tokenTaken(mine), false);
  } finally {
    stop();
  }

  // Asked for again with the same token: a line for it again, and its queue is its own still.
  const again = await takeOpenPlace(url, own.token);
  assert.equal(again.token, own.token);
  assert.match(again.name, /^open-[0-9a-f]{8}$/);
  assert.ok(hasLine(file, own.token));
  assert.equal(await tokenTaken(mine), true);
  await sendMessage(alice, queue.senderId, words('still here'));
  assert.equal(text(await receiveMessage(mine, queue.recipientId)), 'still here');

  // While its line is there, it is not given twice: FAILED, no refusal of the server's.
  const twice = await takeOpenPlace(url, own.token).then(
    () => assert.fail('given twice'),
    (error: unknown) => error,
  );
  assert.ok(twice instanceof RelayError && openPlaceRefusal(twice) === null);
  // A token the relay never had ends the channel the same way.
  assert.equal(await tokenTaken({ url, token: newPhoneToken() }), false);
});

test('with a space open on a free place the server let go, Erevos asks for it again by itself, with the same token', { skip: !go }, async () => {
  const file = tokens('space.tokens');
  const url = await relayWith(file);
  const alice: Relay = { url, token: alicesToken };
  const own = await takeOpenPlace(url);
  const mine: Relay = { url, token: own.token };
  const queue = await createQueue(mine);
  const ownQueue = { recipientHex: toHex(queue.recipientId), senderHex: toHex(queue.senderId) };
  const key = newSpaceKey();
  await saveSpaceData(0, key, { ...EMPTY_SPACE, url, token: own.token, ownToken: { ...ownToken(url, own.token), open: true }, ownQueue });
  setCurrentSpace(0, key);
  try {
    assert.equal((await readFirstServer()).kind, 'ready');

    // A refusal through Tor, which may have been the way: the token alone, tried again, is taken.
    await heardRefusal(mine, false);
    assert.equal(firstServer().kind, 'ready');
    assert.ok(hasLine(file, own.token));

    // Let go: the next request is refused, and the place is asked for again at once.
    letGo(file, own.token);
    await createQueue(mine).catch(() => undefined);
    await until(() => hasLine(file, own.token) && firstServer().kind === 'ready');
    assert.ok(hasLine(file, own.token), 'its line again');
    assert.equal(firstServer().kind, 'ready');
    const data = await loadSpaceData(0, key);
    assert.equal(data.token, own.token, 'the same token');
    assert.deepEqual(data.ownQueue, ownQueue, 'the same queue');
    await sendMessage(alice, queue.senderId, words('back'));
    assert.equal(text(await receiveMessage(mine, queue.recipientId)), 'back');

    // The token of another, or another server's, changes nothing of the space.
    const lines = readFileSync(file, 'utf8');
    await heardRefusal({ url, token: newPhoneToken() }, true);
    await heardRefusal({ url: 'ws://127.0.0.1:9', token: own.token }, true);
    assert.equal(readFileSync(file, 'utf8'), lines);
    assert.equal(firstServer().kind, 'ready');
  } finally {
    setCurrentSpace(null);
  }
});

test('a free place the server let go and cannot give again now says why, and is asked for again with Try again', { skip: !go }, async () => {
  const file = tokens('none.tokens');
  // One place a day to one address: this phone's took it.
  const url = await relayWith(file, { EREVOS_RELAY_OPEN_PER_ADDRESS: '1' });
  const own = await takeOpenPlace(url);
  const mine: Relay = { url, token: own.token };
  const queue = await createQueue(mine);
  const key = newSpaceKey();
  await saveSpaceData(0, key, {
    ...EMPTY_SPACE,
    url,
    token: own.token,
    ownToken: { ...ownToken(url, own.token), open: true },
    ownQueue: { recipientHex: toHex(queue.recipientId), senderHex: toHex(queue.senderId) },
  });
  setCurrentSpace(0, key);
  try {
    letGo(file, own.token);
    await heardRefusal(mine, true);
    const said = firstServer();
    assert.ok(said.kind === 'refused' && said.why === 'address', JSON.stringify(said));
    assert.ok(!hasLine(file, own.token));
    // Read again, as the home screen does on coming back: still not ready.
    assert.equal((await readFirstServer()).kind, 'refused');
    // Try again asks again, with the same token, and is told the same.
    const tried = await takeFirstServer();
    assert.ok(tried.kind === 'refused' && tried.why === 'address');
    assert.equal((await loadSpaceData(0, key)).token, own.token, 'the token stays the space’s');
  } finally {
    setCurrentSpace(null);
  }
});
