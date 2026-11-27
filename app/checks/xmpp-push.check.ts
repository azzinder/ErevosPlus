// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// A closed space's XMPP account says a message came (lib/xmpp-push.ts): the space makes a queue at
// its relay and asks its server to push to the relay's name with that queue as the node; the door
// names the queue; each push the server makes, over a server-to-server stream with STARTTLS to the
// relay (crates/erevos-relay xmpp_push.rs), tells of one message, and nothing is kept; it is kept
// as it is while all holds, made anew when the queue or the relay changed, and let go of when
// turned off; a relay or a server that takes no pushes is told. Runs with a real relay, and the
// real core built to WebAssembly for signing in; skipped, with a note, without them.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { connect as tcpConnect, type Socket } from 'node:net';
import { after, before, test } from 'node:test';
import { connect as tlsConnect } from 'node:tls';

import { doorOf, keepDoor, startClosedNotices, XMPP_PUSH_GROUP } from '../lib/closed-notices';
import { setCore, type Core } from '../lib/core';
import { createQueue, deleteQueue, fromHex, receiveMessage, toHex } from '../lib/relay';
import { keepXmppPush, startXmppPush, stopXmppPush } from '../lib/xmpp-push';
import { prepareDoors, saveDoor } from '../lock/doors';
import { newSpaceKey, setCurrentSpace } from '../lock/keys';
import { EMPTY_SPACE, saveSpaceData } from '../lock/space-data';
import { saveXmpp } from '../lock/xmpp-data';
import { freePort, ready as relayReady, relayNote, startRelay } from './real-relay';
import { store } from './secure-memory';
import { person, Server } from './xmpp-server';

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built) && typeof (createRequire(import.meta.url)(built.pathname) as Record<string, unknown>).xmpp === 'function';
const ready = relayReady && coreReady;
relayNote('the XMPP notice checks through a relay');

before(() => {
  if (!coreReady) return;
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, fn]) => [name, async (...args: never[]) => fn(...args)])) as unknown as Core);
});
after(() => setCore(null));

const NAME = 'push.test';
const certs = new URL('../../crates/erevos-relay/testdata/', import.meta.url).pathname;

/** A relay that takes XMPP pushes as push.test on a port of its own: its address and that port. */
async function pushRelay(): Promise<{ url: string; port: number }> {
  const port = await freePort();
  const url = await startRelay(false, '', false, {
    EREVOS_RELAY_XMPP_PUSH: NAME,
    EREVOS_RELAY_XMPP_PUSH_CERT: `${certs}xmpp-test-cert.pem`,
    EREVOS_RELAY_XMPP_PUSH_KEY: `${certs}xmpp-test-key.pem`,
    EREVOS_RELAY_XMPP_PUSH_ADDR: `127.0.0.1:${port}`,
  });
  return { url, port };
}

/** What comes on `socket` until `until` is in it. */
function upto(socket: Socket, until: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let seen = '';
    const data = (chunk: Buffer) => {
      seen += chunk.toString('utf8');
      if (seen.includes(until)) {
        socket.off('data', data);
        socket.off('close', closed);
        resolve(seen);
      }
    };
    const closed = () => reject(new Error(`closed before ${until}: ${seen}`));
    socket.on('data', data);
    socket.once('close', closed);
  });
}

const HEAD = `<?xml version='1.0'?><stream:stream xmlns='jabber:server' xmlns:stream='http://etherx.jabber.org/streams' from='example.org' to='${NAME}' version='1.0'>`;

/**
 * Publishes to each node `jid` asked its server to push to, as an XMPP server does it (XEP-0357):
 * a server-to-server stream to the relay, STARTTLS with its certificate, SASL EXTERNAL, then a
 * publish for each; what the relay answered each.
 */
async function serverPushes(server: Server, jid: string, port: number): Promise<string[]> {
  const nodes = (server.pushTo.get(jid) ?? []).filter((p) => p.jid === NAME).map((p) => p.node);
  if (nodes.length === 0) return [];
  const plain = tcpConnect(port, '127.0.0.1');
  await new Promise((resolve) => plain.once('connect', resolve));
  plain.write(HEAD);
  await upto(plain, '</stream:features>');
  plain.write("<starttls xmlns='urn:ietf:params:xml:ns:xmpp-tls'/>");
  await upto(plain, '<proceed');
  const tls = tlsConnect({ socket: plain, servername: NAME, ca: readFileSync(`${certs}xmpp-test-ca.pem`) });
  await new Promise((resolve) => tls.once('secureConnect', resolve));
  tls.write(HEAD);
  await upto(tls, '</stream:features>');
  tls.write("<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='EXTERNAL'>ZXhhbXBsZS5vcmc=</auth>");
  await upto(tls, '<success');
  tls.write(HEAD);
  await upto(tls, '<stream:features/>');
  const answers: string[] = [];
  for (const [i, node] of nodes.entries()) {
    const reading = upto(tls, `id='p${i}'`);
    tls.write(
      `<iq type='set' id='p${i}' from='${jid}' to='${NAME}'><pubsub xmlns='http://jabber.org/protocol/pubsub'><publish node='${node}'><item><notification xmlns='urn:xmpp:push:0'><x xmlns='jabber:x:data' type='form'><field var='FORM_TYPE'><value>urn:xmpp:push:summary</value></field><field var='message-count'><value>1</value></field></x></notification></item></publish></pubsub></iq>`,
    );
    const seen = await reading;
    answers.push(/<item-not-found/.test(seen) ? 'gone' : 'ok');
  }
  // The relay may reset the stream as it closes, once the check has gone on: that tells nothing,
  // and must not end the check's file with an error of no one's.
  tls.on('error', () => undefined);
  plain.on('error', () => undefined);
  tls.end('</stream:stream>');
  return answers;
}

test("a closed space's XMPP account is pushed through its relay to a queue its door names, which tells of each message", { skip: !ready }, async () => {
  store.clear();
  await prepareDoors();
  const { url, port } = await pushRelay();
  const [open, closed] = [newSpaceKey(), newSpaceKey()];
  const ids = await createQueue({ url });
  await saveSpaceData(1, closed, { ...EMPTY_SPACE, url, tor: 'off', ownQueue: { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) } });
  const server = new Server();
  const ann = await person(server, 'ann');
  const asked = () => server.pushTo.get(ann.state.jid) ?? [];

  const push = await startXmppPush(ann.state, ann.connection, { url });
  // The server pushes to the relay's name, the queue's sender id as the node; no form asks for more.
  assert.equal(push.jid, NAME);
  assert.deepEqual(asked(), [{ jid: NAME, node: push.senderHex }]);
  ann.state.push = push;
  await saveXmpp(1, closed, ann.state);
  const door = (await doorOf(1, closed))!;
  assert.deepEqual(door.contacts, { url, queues: [{ r: push.recipientHex, g: XMPP_PUSH_GROUP }] });
  await saveDoor(1, door);
  await keepDoor(1, closed, true);

  setCurrentSpace(0, open);
  let told: number[] = [];
  const stop = startClosedNotices((count, space) => (told = [...told, ...Array<number>(count).fill(space)]));
  try {
    await pause(400);
    assert.deepEqual(told, []);
    assert.deepEqual(await serverPushes(server, ann.state.jid, port), ['ok']);
    const end = Date.now() + 5_000;
    while (told.length < 1 && Date.now() < end) await pause(20);
    assert.deepEqual(told, [1]);
    assert.deepEqual(await serverPushes(server, ann.state.jid, port), ['ok']);
    while (told.length < 2 && Date.now() < end + 5_000) await pause(20);
    assert.deepEqual(told, [1, 1]);
  } finally {
    stop();
    setCurrentSpace(null);
  }
  // The queue stays empty: the relay keeps nothing of a push.
  assert.equal(await receiveMessage({ url }, fromHex(push.recipientHex)), null);

  // Kept as it is while all holds, asked of the server again; a server that let go of it is asked anew.
  server.pushTo.set(ann.state.jid, []);
  assert.equal(await keepXmppPush(ann.state, ann.connection, push, { url }), push);
  assert.deepEqual(asked(), [{ jid: NAME, node: push.senderHex }]);
  // The relay lost the queue: it refuses the push; a new queue takes its place, the old node let go of.
  await deleteQueue({ url }, fromHex(push.recipientHex));
  assert.deepEqual(await serverPushes(server, ann.state.jid, port), ['gone']);
  const next = await keepXmppPush(ann.state, ann.connection, push, { url });
  assert.notEqual(next.senderHex, push.senderHex);
  assert.deepEqual(asked(), [{ jid: NAME, node: next.senderHex }]);

  // Turned off: the server pushes there no more, and the queue goes.
  await stopXmppPush(next, ann.connection, { url });
  assert.deepEqual(asked(), []);
  await assert.rejects(receiveMessage({ url }, fromHex(next.recipientHex)));

  // A relay that takes no XMPP pushes, or a server that does not push: refused, nothing left behind.
  const plain = await startRelay();
  await assert.rejects(startXmppPush(ann.state, ann.connection, { url: plain }), /does not take XMPP notices/);
  server.pushes = false;
  await assert.rejects(startXmppPush(ann.state, ann.connection, { url }), /does not send notices/);
  assert.deepEqual(asked(), []);
  ann.connection.close();
});
