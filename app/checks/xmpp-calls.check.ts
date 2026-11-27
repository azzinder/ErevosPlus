// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Calls with people on XMPP (lib/xmpp-calls.ts) through the checks' XMPP server, the other side
// played here as Conversations plays it, stanza by stanza (XEP-0353, XEP-0166, XEP-0167): a call
// of ours rings their devices, goes to the one that answers, through the server's TURN server
// (XEP-0215) only, takes their addresses as they come, and ends when they hang up; theirs rings
// here, is answered with proceed and accept, and its end is told with Jingle and XEP-0353 both;
// turned down, taken back, answered on another device of ours, rung while in another call, from
// someone not in the contacts, or from an older app that starts with Jingle at once; and a Jingle
// question about a session nobody knows is said no to. Each call leaves one line in its chat.
// In INVISIBLE (lib/modes.ts) none rings, in the space or a closed hidden place: its line says why.
// Video is added to a voice call both ways, as Conversations adds it (content-add): said no to,
// the call goes on as it was; said yes to, each side's description is the call's as it is now.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { after, before, test } from 'node:test';

import type { ConnectionConfig, Rtc } from '../lib/call';
import { closeCall, shownCall } from '../lib/calls';
import { setCore, type Core } from '../lib/core';
import { hiddenRinging, setHiddenRinging } from '../lib/hidden-ring';
import { onPlaceNetworkRing } from '../lib/network-notices';
import { ICE, JINGLE, jingleToSdp, RTP, sdpToJingle } from '../lib/jingle-sdp';
import { setThroughTor } from '../lib/relay';
import { addCallLine, addXmppContact, NS, takeStanza, XmppError, type Taken, type XmppConnection, type XmppState } from '../lib/xmpp';
import { startXmppCall, takeHeldXmppCall, watchXmppCalls, xmppCallSessions, xmppPlaceCalls, type XmppCallsSpace } from '../lib/xmpp-calls';
import { child, children, el, type XmlElement } from '../lib/xmpp-xml';
import { FakeConnection, FakeStream, FakeTrack } from './fake-rtc';
import { DOMAIN, person, Server, settle } from './xmpp-server';

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built) && typeof (createRequire(import.meta.url)(built.pathname) as Record<string, unknown>).xmpp === 'function';
if (!coreReady) console.log('Skipping the XMPP call checks: build the core first with node checks/build-core.mjs');

before(() => {
  if (!coreReady) return;
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, fn]) => [name, async (...args: never[]) => fn(...args)])) as unknown as Core);
});
after(() => setCore(null));

const ANN = `ann@${DOMAIN}`;
const BOB = `bob@${DOMAIN}`;
const JMI = NS.jmi;
const FINGERPRINT = new Array(32).fill('AB').join(':');

// ---- WebRTC, with descriptions as a browser writes them ----

/** A description with sound, and a picture when `video`, with one address. */
function description(type: 'offer' | 'answer', video: boolean, ufrag: string): string {
  const section = (kind: string, mid: string, pt: string, map: string) => [
    `m=${kind} 9 UDP/TLS/RTP/SAVPF ${pt}`,
    'c=IN IP4 0.0.0.0',
    `a=candidate:1 1 udp 2122260223 192.0.2.${type === 'offer' ? 1 : 2} 5000${mid} typ host generation 0`,
    `a=ice-ufrag:${ufrag}`,
    'a=ice-pwd:0123456789abcdefghijklmn',
    `a=fingerprint:sha-256 ${FINGERPRINT}`,
    `a=setup:${type === 'offer' ? 'actpass' : 'active'}`,
    `a=mid:${mid}`,
    'a=sendrecv',
    `a=msid:s-${ufrag} ${kind}-${ufrag}`,
    'a=rtcp-mux',
    `a=rtpmap:${pt} ${map}`,
  ];
  return [
    'v=0',
    'o=- 1 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    `a=group:BUNDLE 0${video ? ' 1' : ''}`,
    ...section('audio', '0', '111', 'opus/48000/2'),
    ...(video ? section('video', '1', '96', 'VP8/90000') : []),
    '',
  ].join('\r\n');
}

class SdpConnection extends FakeConnection {
  /** Their addresses that came one at a time. */
  ice: { candidate: string; sdpMid: string }[] = [];
  /** Offers of ours taken back. */
  rolledBack = 0;
  private video = () => this.added.some((track) => (track as FakeTrack).kind === 'video');
  async createOffer() {
    return { type: 'offer' as const, sdp: description('offer', this.video(), 'annu') };
  }
  async createAnswer() {
    return { type: 'answer' as const, sdp: description('answer', this.video(), 'annu') };
  }
  async setLocalDescription(given: { type?: string; sdp: string }) {
    if (given.type === 'rollback') {
      this.rolledBack++;
      return;
    }
    this.localDescription = { sdp: given.sdp };
    setTimeout(() => {
      this.iceGatheringState = 'complete';
      this.emit('icegatheringstatechange');
    }, 5);
  }
  async addIceCandidate(candidate: { candidate: string; sdpMid: string }) {
    this.ice.push(candidate);
  }
}

function sdpRtc() {
  const connections: SdpConnection[] = [];
  const rtc: Rtc = {
    connect(config: ConnectionConfig) {
      const connection = new SdpConnection(config);
      connections.push(connection);
      return connection;
    },
    async media({ video }) {
      return new FakeStream([new FakeTrack('audio'), ...(video ? [new FakeTrack('video')] : [])]);
    },
  };
  return { rtc, connections };
}

// ---- the people ----

type Device = { state: XmppState; connection: XmppConnection };
/** A device played here as another app: what came to it is kept as it came, and nothing is answered by itself. */
type Played = Device & { got: XmlElement[] };

/** Ann, on Erevos, and Bob, in each other's contacts; Bob's device is played. */
async function pair(server: Server): Promise<{ ann: Device; bob: Played }> {
  const ann = await person(server, 'ann');
  const bob = await person(server, 'bob');
  await addXmppContact(ann.state, ann.connection, BOB, 'Bob');
  await settle([ann, bob]);
  await addXmppContact(bob.state, bob.connection, ANN);
  await settle([ann, bob]);
  assert.equal(ann.state.roster[BOB].subscription, 'both');
  return { ann, bob: { ...bob, got: [] } };
}

/** Ann's space, as lib/xmpp-calls.ts needs it: her account, where her chats keep call lines, and no call relay of our own. */
function spaceOf(ann: Device): XmppCallsSpace {
  return {
    link: () => ({ state: ann.state, connection: ann.connection }),
    line: async (jid, mine, text, id, at) => addCallLine(ann.state, jid, mine, text, id, at),
    callRelay: async () => null,
  };
}

/** A while of Ann's app taking what comes, as lib/xmpp-store.ts does, and the played devices keeping theirs. */
async function run(ann: Device, played: Played[], rounds = 12): Promise<void> {
  for (let i = 0; i < rounds; i++) {
    await new Promise((resolve) => setTimeout(resolve, 8));
    const taken: Taken = { chats: [], republish: false };
    for (const stanza of ann.connection.take()) await takeStanza(ann.state, ann.connection, stanza, taken);
    for (const device of played) device.got.push(...device.connection.take());
  }
}

const jmi = (to: string, name: string, id: string, ...inner: XmlElement[]) =>
  el('message', { to, type: 'chat', id: `${name}-${id}` }, el(name, { xmlns: JMI, id }, ...inner));
const reason = (name: string) => el('reason', { xmlns: JINGLE }, el(name));
const jingle = (action: string, sid: string, ...inner: (XmlElement | null)[]) => el('jingle', { xmlns: JINGLE, action, sid }, ...inner);

/** The call message `name` that came to a played device, the last one. */
function cameJmi(device: Played, name: string): XmlElement {
  const found = device.got.filter((s) => s.name === 'message' && child(s, name, JMI));
  assert.ok(found.length, `no ${name} came`);
  return found[found.length - 1];
}

/** The Jingle question `action` that came to a played device. */
function cameIq(device: Played, action: string): XmlElement {
  const found = device.got.find((s) => s.name === 'iq' && child(s, 'jingle', JINGLE)?.attrs.action === action);
  assert.ok(found, `no ${action} came`);
  return found;
}

const answer = (device: Played, iq: XmlElement) => device.connection.send(el('iq', { type: 'result', id: iq.attrs.id, to: iq.attrs.from }));

const calls = (ann: Device, jid: string) => (ann.state.chats[jid]?.messages ?? []).filter((m) => m.call).map((m) => [m.id, m.mine, m.text]);

test('a call of ours rings their devices, goes to the one that answers, through the server\'s TURN only', { skip: !coreReady }, async () => {
  const server = new Server();
  server.turn = { host: 'turn.example.org', port: '3478', username: 'user', password: 'secret' };
  const { ann, bob } = await pair(server);
  const { rtc, connections } = sdpRtc();
  const stop = watchXmppCalls(rtc, spaceOf(ann));
  try {
    const call = await startXmppCall(BOB, true, rtc);
    await run(ann, [bob]);
    assert.deepEqual(connections[0].config, {
      iceServers: [{ urls: ['turn:turn.example.org:3478?transport=udp', 'turns:turn.example.org:5349?transport=tcp'], username: 'user', credential: 'secret' }],
      iceTransportPolicy: 'relay',
    });
    // To all of Bob's devices: his bare address.
    const propose = cameJmi(bob, 'propose');
    assert.equal(propose.attrs.from, ann.connection.fullJid);
    assert.equal(child(propose, 'propose', JMI)!.attrs.id, call.id);
    assert.deepEqual(children(child(propose, 'propose', JMI)!, 'description').map((d) => [d.ns, d.attrs.media]), [
      [RTP, 'audio'],
      [RTP, 'video'],
    ]);
    // The description is not in the ring: it goes only to the device that answers.
    assert.ok(!server.seen.some((s) => s.includes('fingerprint')));

    await bob.connection.send(jmi(ann.connection.fullJid, 'ringing', call.id));
    await run(ann, [bob]);
    assert.equal(call.state, 'ringing');

    await bob.connection.send(jmi(ann.connection.fullJid, 'proceed', call.id));
    await run(ann, [bob]);
    const initiate = cameIq(bob, 'session-initiate');
    const offered = child(initiate, 'jingle', JINGLE)!;
    assert.deepEqual([initiate.attrs.from, offered.attrs.sid, offered.attrs.initiator], [ann.connection.fullJid, call.id, ann.connection.fullJid]);
    const offer = jingleToSdp(offered, 'initiator', call.id);
    assert.match(offer, /m=audio 9 UDP\/TLS\/RTP\/SAVPF 111/);
    assert.match(offer, /m=video 9 UDP\/TLS\/RTP\/SAVPF 96/);
    assert.match(offer, /a=setup:actpass/);
    await answer(bob, initiate);

    // Bob's app answers, and then tells one more address.
    const accepted = bob.connection.iq('set', ann.connection.fullJid, el('jingle', { xmlns: JINGLE, action: 'session-accept', sid: call.id, responder: bob.connection.fullJid }, ...sdpToJingle(description('answer', true, 'bobu'), 'responder')));
    await run(ann, [bob]);
    await accepted;
    assert.equal(call.state, 'connecting');
    assert.match(connections[0].remote!.sdp, /a=ice-ufrag:bobu/);
    assert.match(connections[0].remote!.sdp, /a=setup:active/);
    const trickled = bob.connection.iq(
      'set',
      ann.connection.fullJid,
      jingle(
        'transport-info',
        call.id,
        el(
          'content',
          { creator: 'initiator', name: '1' },
          el('transport', { xmlns: ICE, ufrag: 'bobu', pwd: '0123456789abcdefghijklmn' }, el('candidate', { component: '1', foundation: '5', generation: '0', id: 'x', ip: '198.51.100.9', network: '0', port: '3478', priority: '1', protocol: 'udp', type: 'relay', 'rel-addr': '0.0.0.0', 'rel-port': '0' })),
        ),
      ),
    );
    await run(ann, [bob]);
    await trickled;
    assert.deepEqual(connections[0].ice, [{ candidate: 'candidate:5 1 udp 1 198.51.100.9 3478 typ relay raddr 0.0.0.0 rport 0 generation 0 ufrag bobu network-id 0', sdpMid: '1' }]);
    connections[0].connect(new FakeStream([new FakeTrack('audio')]));
    assert.equal(call.state, 'connected');

    // Bob hangs up.
    const terminated = bob.connection.iq('set', ann.connection.fullJid, jingle('session-terminate', call.id, reason('success')));
    await run(ann, [bob]);
    await terminated;
    assert.deepEqual([call.state, call.ended?.reason], ['ended', 'hangup']);
    assert.deepEqual(calls(ann, BOB), [[`call-${call.id}`, true, '📞 Video call, 0:00']]);
    assert.equal(xmppCallSessions(), 0);
    closeCall(call);
  } finally {
    stop();
    ann.connection.close();
    bob.connection.close();
  }
});

test('their call rings here, is answered with proceed and accept, and its end is told both ways', { skip: !coreReady }, async () => {
  const server = new Server();
  const { ann, bob } = await pair(server);
  const { rtc, connections } = sdpRtc();
  const stop = watchXmppCalls(rtc, spaceOf(ann));
  try {
    await bob.connection.send(jmi(ANN, 'propose', 'b1', el('description', { xmlns: RTP, media: 'audio' })));
    await run(ann, [bob]);
    const call = shownCall()!.call;
    assert.deepEqual([call.id, call.peer, call.state, call.video], ['b1', `xmpp:${BOB}`, 'incoming', false]);
    assert.equal(cameJmi(bob, 'ringing').attrs.to, bob.connection.fullJid);

    const answering = call.answer();
    await run(ann, [bob]);
    assert.equal(cameJmi(bob, 'proceed').attrs.to, bob.connection.fullJid);
    // Ann's other devices are told to stop ringing.
    assert.ok(server.seen.some((s) => s.includes(`to='${ANN}'`) && s.includes('<accept')));

    const initiated = bob.connection.iq('set', ann.connection.fullJid, el('jingle', { xmlns: JINGLE, action: 'session-initiate', sid: 'b1', initiator: bob.connection.fullJid }, ...sdpToJingle(description('offer', false, 'bobu'), 'initiator')));
    await run(ann, [bob]);
    await initiated;
    await run(ann, [bob]);
    assert.match(connections[0].remote!.sdp, /a=ice-ufrag:bobu/);
    const accept = cameIq(bob, 'session-accept');
    const answered = child(accept, 'jingle', JINGLE)!;
    assert.equal(answered.attrs.responder, ann.connection.fullJid);
    const sdp = jingleToSdp(answered, 'responder', 'b1');
    assert.match(sdp, /a=setup:active/);
    assert.match(sdp, /a=ice-ufrag:annu/);
    await answer(bob, accept);
    await run(ann, [bob]);
    await answering;
    connections[0].connect(new FakeStream([new FakeTrack('audio')]));
    assert.equal(call.state, 'connected');

    call.hangUp();
    await run(ann, [bob]);
    const terminate = cameIq(bob, 'session-terminate');
    assert.ok(child(child(terminate, 'jingle', JINGLE), 'reason', JINGLE)?.children.some((c) => typeof c !== 'string' && c.name === 'success'));
    await answer(bob, terminate);
    await run(ann, [bob]);
    assert.equal(cameJmi(bob, 'finish').attrs.to, BOB);
    assert.deepEqual(calls(ann, BOB), [['call-b1', false, '📞 Voice call, 0:00']]);
    assert.equal(xmppCallSessions(), 0);
    closeCall(call);
  } finally {
    stop();
    ann.connection.close();
    bob.connection.close();
  }
});

test('turned down, taken back, answered on another device, or rung during another call', { skip: !coreReady }, async () => {
  const server = new Server();
  const { ann, bob } = await pair(server);
  const { rtc } = sdpRtc();
  const stop = watchXmppCalls(rtc, spaceOf(ann));
  const ann2 = { ...(await person(server, 'ann')), got: [] as XmlElement[] };
  const reasonOf = (message: XmlElement, name: string) => children(child(child(message, name, JMI), 'reason', JINGLE)).map((c) => c.name);
  try {
    // Turned down here: Bob's phone stops ringing, with the reason.
    await bob.connection.send(jmi(ANN, 'propose', 'd1', el('description', { xmlns: RTP, media: 'audio' })));
    await run(ann, [bob, ann2]);
    shownCall()!.call.decline();
    await run(ann, [bob, ann2]);
    const reject = cameJmi(bob, 'reject');
    assert.equal(reject.attrs.to, bob.connection.fullJid);
    assert.deepEqual(reasonOf(reject, 'reject'), ['decline']);
    closeCall(shownCall()!.call);

    // Taken back before it was answered: a missed call, not read.
    await bob.connection.send(jmi(ANN, 'propose', 'r1', el('description', { xmlns: RTP, media: 'video' })));
    await run(ann, [bob, ann2]);
    assert.equal(shownCall()!.call.state, 'incoming');
    await bob.connection.send(jmi(ANN, 'retract', 'r1', reason('cancel')));
    await run(ann, [bob, ann2]);
    assert.deepEqual([shownCall()!.call.state, shownCall()!.call.ended?.reason], ['ended', 'missed']);
    closeCall(shownCall()!.call);

    // Answered on Ann's other device: it stops ringing here, and Bob hears nothing from this one.
    await bob.connection.send(jmi(ANN, 'propose', 'e1', el('description', { xmlns: RTP, media: 'audio' })));
    await run(ann, [bob, ann2]);
    const ringing = shownCall()!.call;
    bob.got.length = 0;
    await ann2.connection.send(jmi(bob.connection.fullJid, 'proceed', 'e1'));
    await ann2.connection.send(jmi(ANN, 'accept', 'e1'));
    await run(ann, [bob, ann2]);
    assert.deepEqual([ringing.state, ringing.ended?.elsewhere], ['ended', true]);
    assert.deepEqual(bob.got.filter((s) => s.attrs.from === ann.connection.fullJid).map((s) => s.children.find((c) => typeof c !== 'string')?.name), []);
    closeCall(ringing);

    // Rung while Ann calls Bob: busy, and her own call goes on until she hangs up.
    const mine = await startXmppCall(BOB, false, rtc);
    await run(ann, [bob, ann2]);
    await bob.connection.send(jmi(ANN, 'propose', 'x1', el('description', { xmlns: RTP, media: 'audio' })));
    await run(ann, [bob, ann2]);
    assert.deepEqual(reasonOf(cameJmi(bob, 'reject'), 'reject'), ['busy']);
    assert.equal(shownCall()!.call, mine);
    mine.hangUp();
    await run(ann, [bob, ann2]);
    const retract = cameJmi(bob, 'retract');
    assert.equal(retract.attrs.to, BOB);
    assert.deepEqual(reasonOf(retract, 'retract'), ['cancel']);
    closeCall(mine);

    assert.deepEqual(calls(ann, BOB), [
      ['call-d1', false, '📞 Voice call, turned down'],
      ['call-r1', false, '📞 Missed video call'],
      ['call-e1', false, '📞 Voice call, answered on another device'],
      ['call-x1', false, '📞 Missed voice call, while in another call'],
      [`call-${mine.id}`, true, '📞 Voice call, not answered'],
    ]);
    // The missed ones wait to be seen: the one taken back, and the one during the other call.
    assert.equal(ann.state.chats[BOB].unread, 2);
    assert.equal(xmppCallSessions(), 0);
  } finally {
    stop();
    for (const device of [ann, bob, ann2]) device.connection.close();
  }
});

test('someone not in the contacts, an older app, and a session nobody knows', { skip: !coreReady }, async () => {
  const server = new Server();
  const { ann, bob } = await pair(server);
  const carol = { ...(await person(server, 'carol')), got: [] as XmlElement[] };
  const { rtc, connections } = sdpRtc();
  const stop = watchXmppCalls(rtc, spaceOf(ann));
  try {
    // Not in Ann's contacts: told as missed, never rung.
    await carol.connection.send(jmi(ANN, 'propose', 'c1', el('description', { xmlns: RTP, media: 'audio' })));
    await run(ann, [bob, carol]);
    assert.equal(shownCall(), null);
    assert.deepEqual(calls(ann, `carol@${DOMAIN}`), [['call-c1', false, '📞 Missed voice call']]);

    // An older app starts with Jingle at once: it rings, and the answer goes back the same way.
    const initiated = bob.connection.iq('set', ann.connection.fullJid, el('jingle', { xmlns: JINGLE, action: 'session-initiate', sid: 'o1', initiator: bob.connection.fullJid }, ...sdpToJingle(description('offer', true, 'bobu'), 'initiator')));
    await run(ann, [bob, carol]);
    await initiated;
    const call = shownCall()!.call;
    assert.deepEqual([call.id, call.state, call.video], ['o1', 'incoming', true]);
    // It rings there with Jingle's own word, as no XEP-0353 ring came.
    const info = cameIq(bob, 'session-info');
    assert.ok(child(child(info, 'jingle', JINGLE), 'ringing'));
    await answer(bob, info);
    const answering = call.answer();
    await run(ann, [bob, carol]);
    assert.ok(!bob.got.some((s) => child(s, 'proceed', JMI)));
    assert.match(connections[0].remote!.sdp, /m=video/);
    await answer(bob, cameIq(bob, 'session-accept'));
    await run(ann, [bob, carol]);
    await answering;
    // Bob hangs up before it connected: their end of a call that never connected.
    const terminated = bob.connection.iq('set', ann.connection.fullJid, jingle('session-terminate', 'o1', reason('cancel')));
    await run(ann, [bob, carol]);
    await terminated;
    assert.equal(call.state, 'ended');
    closeCall(call);

    // A Jingle question about a session nobody knows here.
    const said = (condition: string) => (error: unknown) => error instanceof XmppError && error.condition === condition;
    const unknown = assert.rejects(bob.connection.iq('set', ann.connection.fullJid, jingle('transport-info', 'nope')), said('item-not-found'));
    await run(ann, [bob, carol]);
    await unknown;
    // And a description that cannot be a call.
    const odd = assert.rejects(
      bob.connection.iq('set', ann.connection.fullJid, jingle('session-initiate', 'f1', el('content', { creator: 'initiator', name: 'a' }, el('description', { xmlns: 'urn:xmpp:jingle:apps:file-transfer:5' })))),
      said('feature-not-implemented'),
    );
    await run(ann, [bob, carol]);
    await odd;
    assert.equal(shownCall(), null);
    assert.equal(xmppCallSessions(), 0);
  } finally {
    stop();
    for (const device of [ann, bob, carol]) device.connection.close();
  }
});

test('video is added to a voice call both ways, said no to and yes to', { skip: !coreReady }, async () => {
  const server = new Server();
  const { ann, bob } = await pair(server);
  const { rtc, connections } = sdpRtc();
  const stop = watchXmppCalls(rtc, spaceOf(ann));
  const contentOf = (iq: XmlElement) => children(child(iq, 'jingle', JINGLE), 'content');
  const lastIq = (action: string) => {
    const found = bob.got.filter((s) => s.name === 'iq' && child(s, 'jingle', JINGLE)?.attrs.action === action);
    assert.ok(found.length, `no ${action} came`);
    return found[found.length - 1];
  };
  try {
    // Bob calls, with sound only; Ann answers.
    await bob.connection.send(jmi(ANN, 'propose', 'v1', el('description', { xmlns: RTP, media: 'audio' })));
    await run(ann, [bob]);
    let call = shownCall()!.call;
    const answering = call.answer();
    await run(ann, [bob]);
    const initiated = bob.connection.iq('set', ann.connection.fullJid, el('jingle', { xmlns: JINGLE, action: 'session-initiate', sid: 'v1', initiator: bob.connection.fullJid }, ...sdpToJingle(description('offer', false, 'bobu'), 'initiator')));
    await run(ann, [bob]);
    await initiated;
    await run(ann, [bob]);
    await answer(bob, cameIq(bob, 'session-accept'));
    await run(ann, [bob]);
    await answering;
    assert.equal(call.canAddVideo, false);
    connections[0].connect(new FakeStream([new FakeTrack('audio')]));
    assert.deepEqual([call.state, call.video, call.canAddVideo], ['connected', false, true]);

    // Ann turns her camera on: Bob's app is asked to take its content, and says no.
    let adding = call.addVideo();
    await run(ann, [bob]);
    assert.equal(call.addingVideo, true);
    let add = lastIq('content-add');
    assert.deepEqual(contentOf(add).map((c) => [c.attrs.creator, c.attrs.name, c.attrs.senders, child(c, 'description', RTP)?.attrs.media]), [['responder', '1', 'both', 'video']]);
    await answer(bob, add);
    const rejected = bob.connection.iq('set', ann.connection.fullJid, jingle('content-reject', 'v1', el('content', { creator: 'responder', name: '1' }), reason('decline')));
    await run(ann, [bob]);
    await rejected;
    await adding;
    // Her offer is taken back and her camera off: the call goes on with sound, and video can be asked again.
    assert.equal(connections[0].rolledBack, 1);
    assert.deepEqual(connections[0].added.map((t) => (t as FakeTrack).kind), ['audio']);
    assert.deepEqual(call.local!.getVideoTracks(), []);
    assert.deepEqual([call.state, call.video, call.addingVideo, call.canAddVideo], ['connected', false, false, true]);

    // Again, and he says yes: her side has his description of the call as it is now.
    adding = call.addVideo();
    await run(ann, [bob]);
    add = lastIq('content-add');
    await answer(bob, add);
    const accept = description('answer', true, 'bobu');
    const acceptedIq = bob.connection.iq('set', ann.connection.fullJid, jingle('content-accept', 'v1', ...sdpToJingle(accept, 'initiator').filter((c) => c.name === 'content' && c.attrs.name === '1').map((c) => ((c.attrs.creator = 'responder'), c))));
    await run(ann, [bob]);
    await acceptedIq;
    await adding;
    const whole = connections[0].remote!;
    assert.equal(whole.type, 'answer');
    assert.match(whole.sdp, /a=group:BUNDLE 0 1/);
    assert.match(whole.sdp, /m=audio 9 [^]*m=video 9 UDP\/TLS\/RTP\/SAVPF 96/);
    // His first offer said actpass; as the call is now, he is the one that waits (Ann answered active).
    assert.deepEqual(whole.sdp.match(/a=setup:\w+/g), ['a=setup:passive', 'a=setup:passive']);
    assert.deepEqual([call.video, call.cameraOff, call.local!.getVideoTracks().length], [true, false, 1]);
    assert.equal(call.canAddVideo, false);
    call.hangUp();
    await run(ann, [bob]);
    closeCall(call);
    bob.got.length = 0;

    // Ann calls Bob, with sound only; he answers.
    call = await startXmppCall(BOB, false, rtc);
    await run(ann, [bob]);
    await bob.connection.send(jmi(ann.connection.fullJid, 'proceed', call.id));
    await run(ann, [bob]);
    await answer(bob, cameIq(bob, 'session-initiate'));
    const accepted = bob.connection.iq('set', ann.connection.fullJid, el('jingle', { xmlns: JINGLE, action: 'session-accept', sid: call.id, responder: bob.connection.fullJid }, ...sdpToJingle(description('answer', false, 'bobu'), 'responder')));
    await run(ann, [bob]);
    await accepted;
    connections[1].connect(new FakeStream([new FakeTrack('audio')]));
    assert.equal(call.state, 'connected');

    // Bob turns his camera on: Ann's screen asks, and she says no.
    const bobVideo = () =>
      sdpToJingle(description('offer', true, 'bobu'), 'responder')
        .filter((c) => c.name === 'content' && c.attrs.name === '1')
        .map((c) => ((c.attrs.creator = 'responder'), c));
    let asked = bob.connection.iq('set', ann.connection.fullJid, jingle('content-add', call.id, ...bobVideo()));
    await run(ann, [bob]);
    await asked;
    assert.deepEqual([call.askingVideo, call.canAddVideo], [true, false]);
    call.declineVideo();
    await run(ann, [bob]);
    const no = lastIq('content-reject');
    assert.deepEqual(contentOf(no).map((c) => [c.attrs.creator, c.attrs.name]), [['responder', '1']]);
    await answer(bob, no);
    assert.deepEqual([call.askingVideo, call.video, connections[1].added.length], [false, false, 1]);

    // He asks again, and she says yes: her camera goes on, and he gets her answer for it.
    asked = bob.connection.iq('set', ann.connection.fullJid, jingle('content-add', call.id, ...bobVideo()));
    await run(ann, [bob]);
    await asked;
    const yes = call.acceptVideo();
    await run(ann, [bob]);
    const ok = lastIq('content-accept');
    assert.deepEqual(contentOf(ok).map((c) => [c.attrs.creator, c.attrs.name, child(c, 'description', RTP)?.attrs.media]), [['responder', '1', 'video']]);
    await answer(bob, ok);
    await run(ann, [bob]);
    await yes;
    const theirs = connections[1].remote!;
    assert.equal(theirs.type, 'offer');
    assert.match(theirs.sdp, /a=group:BUNDLE 0 1/);
    // As the call is now, he took the active part with his first answer.
    assert.deepEqual(theirs.sdp.match(/a=setup:\w+/g), ['a=setup:active', 'a=setup:active']);
    assert.deepEqual([call.video, call.askingVideo, connections[1].added.map((t) => (t as FakeTrack).kind)], [true, false, ['audio', 'video']]);
    call.hangUp();
    await run(ann, [bob]);
    closeCall(call);
  } finally {
    stop();
    ann.connection.close();
    bob.connection.close();
  }
});

test("a hidden place's own account rings and calls as itself, and its call ends as its hidden chats close", { skip: !coreReady }, async () => {
  const server = new Server();
  const { ann, bob } = await pair(server);
  // The phone's open hidden place has an account of its own, cat, in Bob's contacts too.
  const CAT = `cat@${DOMAIN}`;
  const cat = await person(server, 'cat');
  await addXmppContact(cat.state, cat.connection, BOB, 'Bob of the place');
  await settle([cat, bob]);
  await addXmppContact(bob.state, bob.connection, CAT);
  await settle([cat, bob]);
  const { rtc } = sdpRtc();
  let open = true;
  const watching = new Set<() => void>();
  const stop = watchXmppCalls(rtc, {
    ...spaceOf(ann),
    place: { ...spaceOf(cat), open: () => open, now: () => (open ? cat.state : null) },
    watch: (listener) => {
      watching.add(listener);
      return () => watching.delete(listener);
    },
  });
  const both = async () => {
    await run(ann, [bob]);
    await run(cat, [bob]);
  };
  try {
    // Bob calls the place's account: it rings as the place's, named as its contacts name him.
    await bob.connection.send(jmi(CAT, 'propose', 'p1', el('description', { xmlns: RTP, media: 'audio' })));
    await both();
    const shown = shownCall()!;
    assert.equal(shown.place, xmppPlaceCalls);
    assert.deepEqual([shown.call.id, shown.call.peer, shown.call.state], ['p1', `xmpp:${BOB}`, 'incoming']);
    assert.equal(shown.place.name(shown.call.peer), 'Bob of the place');
    assert.equal(cameJmi(bob, 'ringing').attrs.to, bob.connection.fullJid);
    assert.ok(bob.got.filter((s) => s.attrs.from === ann.connection.fullJid).length === 0);

    // The hidden chats close: it stops ringing, and Bob's phone is told, by the place's account.
    open = false;
    watching.forEach((listener) => listener());
    await both();
    const reject = cameJmi(bob, 'reject');
    assert.equal(reject.attrs.from, cat.connection.fullJid);
    closeCall(shown.call);

    // Open again, a call from the place's chat goes from its account, and only from it.
    open = true;
    bob.got.length = 0;
    const mine = await startXmppCall(BOB, true, rtc, true);
    await both();
    assert.equal(shownCall()!.place, xmppPlaceCalls);
    assert.equal(cameJmi(bob, 'propose').attrs.from, cat.connection.fullJid);
    mine.hangUp();
    await both();
    assert.equal(cameJmi(bob, 'retract').attrs.from, cat.connection.fullJid);
    closeCall(mine);

    // Its lines are in the place's chats, none in the space's.
    assert.deepEqual(calls(cat, BOB), [
      ['call-p1', false, '📞 Voice call, turned down'],
      [`call-${mine.id}`, true, '📞 Video call, not answered'],
    ]);
    assert.deepEqual(calls(ann, BOB), []);
    assert.equal(xmppCallSessions(), 0);
  } finally {
    stop();
    for (const device of [ann, bob, cat]) device.connection.close();
  }
});

test("a call to a closed hidden place's own account that receives rings with no name, and rings in it once the PIN opens it; in INVISIBLE, nowhere", { skip: !coreReady }, async () => {
  const server = new Server();
  const { ann, bob } = await pair(server);
  const CAT = `cat@${DOMAIN}`;
  const cat = await person(server, 'cat');
  await addXmppContact(cat.state, cat.connection, BOB, 'Bob of the place');
  await settle([cat, bob]);
  await addXmppContact(bob.state, bob.connection, CAT);
  await settle([cat, bob]);
  const { rtc } = sdpRtc();
  // The place's hidden chats are closed, and receive: its account is connected all the same.
  let open = false;
  const watching = new Set<() => void>();
  const rang: [number, number][] = [];
  const stopRang = onPlaceNetworkRing((space, pocket) => rang.push([space, pocket]));
  const stop = watchXmppCalls(rtc, {
    ...spaceOf(ann),
    place: { ...spaceOf(cat), open: () => open, link: () => (open ? spaceOf(cat).link() : null), now: () => (open ? cat.state : null) },
    closed: (state) => (!open && state === cat.state ? { space: 5, pocket: 2, line: async (jid, mine, text, id, at) => addCallLine(cat.state, jid, mine, text, id, at) } : null),
    watch: (listener) => {
      watching.add(listener);
      return () => watching.delete(listener);
    },
  });
  const both = async () => {
    await run(ann, [bob]);
    await run(cat, [bob]);
  };
  try {
    // Bob calls: nothing shows, nothing tells Bob it rings; the place rings with no name.
    await bob.connection.send(jmi(CAT, 'propose', 'p2', el('description', { xmlns: RTP, media: 'audio' })));
    await both();
    assert.equal(shownCall(), null);
    assert.deepEqual(rang, [[5, 2]]);
    assert.equal(bob.got.filter((s) => s.name === 'message' && child(s, 'ringing', JMI)).length, 0);
    assert.equal(xmppCallSessions(), 0);
    // He takes it back before the PIN: it is missed, and the ring stops.
    setHiddenRinging({ space: 5, pocket: 2, at: Date.now() });
    await bob.connection.send(jmi(CAT, 'retract', 'p2', reason('cancel')));
    await both();
    assert.equal(hiddenRinging(), null);
    assert.deepEqual(calls(cat, BOB), [['call-p2', false, '📞 Missed voice call']]);

    // Again, with video: the PIN opens the place, and it rings there, as the place's call.
    await bob.connection.send(jmi(CAT, 'propose', 'p3', el('description', { xmlns: RTP, media: 'audio' }), el('description', { xmlns: RTP, media: 'video' })));
    await both();
    assert.equal(shownCall(), null);
    assert.equal(rang.length, 2);
    open = true;
    watching.forEach((listener) => listener());
    await both();
    const shown = shownCall()!;
    assert.equal(shown.place, xmppPlaceCalls);
    assert.deepEqual([shown.call.id, shown.call.peer, shown.call.state, shown.call.video], ['p3', `xmpp:${BOB}`, 'incoming', true]);
    assert.equal(cameJmi(bob, 'ringing').attrs.from, cat.connection.fullJid);
    // The PIN on the ring screen answers it: this one, once.
    assert.equal(takeHeldXmppCall('p3'), true);
    assert.equal(takeHeldXmppCall('p3'), false);
    shown.call.decline();
    await both();
    assert.equal(cameJmi(bob, 'reject').attrs.from, cat.connection.fullJid);
    closeCall(shown.call);

    // Answered on another of the place's devices while closed: no ring left, the line says so.
    open = false;
    watching.forEach((listener) => listener());
    await bob.connection.send(jmi(CAT, 'propose', 'p4', el('description', { xmlns: RTP, media: 'audio' })));
    await both();
    assert.equal(rang.length, 3);
    const other = await person(server, 'cat');
    await other.connection.send(el('message', { to: bob.connection.fullJid, type: 'chat' }, el('proceed', { xmlns: JMI, id: 'p4' })));
    await other.connection.send(el('message', { to: CAT, type: 'chat' }, el('accept', { xmlns: JMI, id: 'p4' })));
    await both();
    assert.equal(shownCall(), null);
    assert.deepEqual(calls(cat, BOB), [
      ['call-p2', false, '📞 Missed voice call'],
      ['call-p3', false, '📞 Video call, turned down'],
      ['call-p4', true, '📞 Voice call, answered on another device'],
    ]);
    assert.deepEqual(calls(ann, BOB), []);
    assert.equal(xmppCallSessions(), 0);
    other.connection.close();

    // In INVISIBLE (lib/modes.ts) no call rings, here or in the closed place, not even with no
    // name: each is kept at once as missed, its line saying why, and Bob is told nothing. One that
    // rings with no name as it is chosen rings no more, kept so too.
    const ringings = () => bob.got.filter((s) => s.name === 'message' && child(s, 'ringing', JMI)).length;
    await bob.connection.send(jmi(CAT, 'propose', 'p5', el('description', { xmlns: RTP, media: 'audio' })));
    await both();
    assert.equal(rang.length, 4);
    setHiddenRinging({ space: 5, pocket: 2, at: Date.now() });
    const before = ringings();
    setThroughTor('all');
    assert.equal(hiddenRinging(), null);
    assert.deepEqual(calls(cat, BOB).at(-1), ['call-p5', false, '📞 Missed voice call, in INVISIBLE']);
    await bob.connection.send(jmi(CAT, 'propose', 'p6', el('description', { xmlns: RTP, media: 'audio' })));
    await bob.connection.send(jmi(ANN, 'propose', 'p7', el('description', { xmlns: RTP, media: 'audio' }), el('description', { xmlns: RTP, media: 'video' })));
    await both();
    assert.equal(shownCall(), null);
    assert.equal(rang.length, 4);
    assert.equal(ringings(), before);
    assert.deepEqual(calls(cat, BOB).at(-1), ['call-p6', false, '📞 Missed voice call, in INVISIBLE']);
    assert.deepEqual(calls(ann, BOB), [['call-p7', false, '📞 Missed video call, in INVISIBLE']]);
    assert.equal(xmppCallSessions(), 0);
  } finally {
    setThroughTor('off');
    stop();
    stopRang();
    for (const device of [ann, bob, cat]) device.connection.close();
  }
});
