// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The three modes (lib/modes.ts): SPEED, ANONYMOUS and INVISIBLE, read from what a space keeps and
// written by choosing one; the first start's words for them, at the top of Settings; and INVISIBLE's
// calls: none starts, none rings, not even one chosen while the call relay is asked, and one going
// on ends (lib/calls.ts, lib/group-calls.ts, lib/matrix-calls.ts; XMPP's go through the first two),
// with a line in the chat that says why; a closed hidden place's does not ring with no name either,
// and one that rings so stops as INVISIBLE is chosen (lib/hidden-ring-notices.ts here; what held
// it, in checks/place-receiver.check.ts, xmpp-calls.check.ts and matrix-calls.check.ts).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';

import './secure-memory';
import type { CallSignal } from '../lib/call-signal';
import { shownLine } from '../lib/call-lines';
import { callSignal, closeCall, shownCall, startCall, type CallPlace } from '../lib/calls';
import { directNow, setDirect } from '../lib/direct';
import { closeGroupCall, endGroupCall, groupCallGoingOn, groupCallSignal, joinGroupCall, shownGroupCall, startGroupCall, type GroupCallPlace } from '../lib/group-calls';
import { setLang, t } from '../lib/i18n';
import { EL } from '../i18n/el/index';
import { hiddenRinging, setHiddenRinging } from '../lib/hidden-ring';
import { startHiddenRinging } from '../lib/hidden-ring-notices';
import { matrixCallLine, startMatrixCall } from '../lib/matrix-calls';
import { callsOff, callsOffNote, MODE_NAMES, MODES, modeChange, modeNow, modeOf, modeSaid, type Mode } from '../lib/modes';
import { setNostr } from '../lib/nostr';
import { setThroughTor, type TorWay } from '../lib/relay';
import { searchSettings, type SettingsPlace } from '../lib/settings';
import { newSpaceKey, setCurrentSpace } from '../lock/keys';
import { fakeRtc } from './fake-rtc';

const APP = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(APP, path), 'utf8');

afterEach(() => {
  setThroughTor('off');
  setDirect(false);
  setNostr(null, false);
  const call = shownCall();
  call?.call.hangUp();
  if (call) closeCall(call.call);
  const group = shownGroupCall();
  endGroupCall();
  if (group) closeGroupCall(group.call);
});

const WAYS: TorWay[] = ['off', 'messages', 'all'];
// Every way a space can be kept: Direct connections, the Tor way, Nostr's own Tor switch.
const KEPT = WAYS.flatMap((tor) => [false, true].flatMap((direct) => [false, true].map((own) => ({ direct, tor, nostr: { on: true, relays: ['wss://n.example'], tor: own } }))));

test('a space is INVISIBLE with everything through Tor, SPEED with Direct connections and nothing through Tor, else ANONYMOUS', () => {
  for (const data of KEPT) {
    const mode = modeOf(data);
    if (data.tor === 'all') assert.equal(mode, 'invisible');
    else if (data.direct && data.tor === 'off' && !data.nostr.tor) assert.equal(mode, 'speed');
    else assert.equal(mode, 'anonymous', JSON.stringify(data));
  }
  // A new space, as it starts: SPEED.
  assert.equal(modeOf({ direct: true, tor: 'off', nostr: {} }), 'speed');
});

test('choosing a mode keeps what it says, from whatever the space kept, and touches nothing else', () => {
  for (const data of KEPT) {
    for (const mode of MODES) {
      const next = modeChange(data, mode);
      assert.equal(modeOf(next), mode, `${JSON.stringify(data)} → ${mode}`);
      // Nostr's own setting is changed only as SPEED turns its Tor switch off, and keeps its relays.
      if (mode === 'speed' && data.nostr.tor) assert.deepEqual(next.nostr, { ...data.nostr, tor: false });
      else assert.equal(next.nostr, data.nostr);
    }
  }
  // ANONYMOUS turns off a Tor that went for everything, and keeps one for messages only.
  assert.equal(modeChange({ direct: false, tor: 'all', nostr: {} }, 'anonymous').tor, 'off');
  assert.equal(modeChange({ direct: true, tor: 'messages', nostr: {} }, 'anonymous').tor, 'messages');
  assert.deepEqual(modeChange({ direct: true, tor: 'off', nostr: {} }, 'invisible'), { direct: false, tor: 'all', nostr: {} });
});

test('the mode now follows the space: Direct connections, its Tor way and Nostr through Tor', () => {
  assert.equal(modeNow(), 'anonymous', 'with no space open, nothing is direct');
  setDirect(true);
  assert.equal(modeNow(), 'speed');
  setNostr(['wss://n.example'], true);
  assert.equal(modeNow(), 'anonymous');
  setNostr(['wss://n.example'], false);
  setThroughTor('messages');
  assert.equal(modeNow(), 'anonymous');
  assert.equal(callsOff(), false);
  setThroughTor('all');
  assert.equal(modeNow(), 'invisible');
  assert.equal(callsOff(), true);
  assert.equal(directNow(), false);
});

test("Settings shows the first start's three, in his words, at its top, and the search finds them", async () => {
  // The words of the first start's third screen (mock-v4), as Greek has them.
  const greek: Record<string, string> = {
    'How visible are you?': 'Πόσο φαίνεσαι;',
    'The servers and your contacts see your address.': 'Βλέπουν τη διεύθυνσή σου οι servers και οι επαφές σου.',
    'Calls go straight · the fastest': 'Κλήσεις κατευθείαν · οι πιο γρήγορες',
    'Only the server sees it, never your contacts.': 'Τη βλέπει μόνο ο server, ποτέ οι επαφές σου.',
    'Calls through a server': 'Κλήσεις μέσω server',
    'No one sees it. Everything goes through Tor.': 'Δεν τη βλέπει κανείς. Όλα μέσω Tor.',
    'No voice or video calls': 'Χωρίς κλήσεις ήχου και βίντεο',
  };
  for (const [english, words] of Object.entries(greek)) assert.equal(EL[english], words, english);
  const picker = read('components/mode-picker.tsx');
  for (const english of Object.keys(greek).slice(1)) assert.ok(picker.includes(`mark('${english}')`), english);
  // Their names are the same in every language.
  assert.deepEqual(Object.values(MODE_NAMES), ['SPEED', 'ANONYMOUS', 'INVISIBLE']);
  // At the top of Settings, before the language; and in the search, by each name.
  const settings = read('app/settings/index.tsx');
  assert.ok(settings.indexOf('<ModePicker') > 0 && settings.indexOf('<ModePicker') < settings.indexOf('key="language"'));
  await setLang('en');
  const phone: SettingsPlace = { web: false, webApp: false, push: false, background: true, checks: true, launcher: true, widget: true, sims: true };
  for (const word of ['speed', 'anonymous', 'invisible', 'visible']) assert.ok(searchSettings(word, phone, (english) => english).some((hit) => hit.leaf.href === '/direct'), word);
});

test('choosing writes only what the mode says, then sets it going, Tor last; INVISIBLE, and SPEED over a Tor, are asked first', () => {
  const picker = read('components/mode-picker.tsx');
  assert.match(
    picker,
    /const next = modeChange\(data, mode\);\s+await updateCurrentSpaceData\(next\);\s+setDirect\(directOf\(next\)\);\s+if \(next\.nostr !== data\.nostr\) setNostr\(nostrOf\(next\.nostr\), next\.nostr\.tor === true\);\s+if \(next\.tor !== data\.tor\) await applyTor\(next\.tor, data\.bridges\);/,
  );
  assert.match(picker, /if \(mode === 'invisible'\) return askInvisible\(\);/);
  // Never everything through a Tor the build does not have: nothing would go at all.
  assert.match(picker, /if \(next === 'invisible' && !canTor\(\)\) \{\s+setNote\(t\('INVISIBLE needs Tor, which this device does not have\.'\)\);\s+return;/);
  assert.match(picker, /if \(data\.tor === 'off' && data\.nostr\.tor !== true\) return true;\s+return confirm\(t\('Choose SPEED\?'\)/);
  // Everything through Tor on the Tor screen is INVISIBLE, asked as here; it and the Nostr screen say the mode they leave.
  const tor = read('app/tor.tsx');
  assert.match(tor, /if \(next === 'all'\) \{\s+if \(!\(await askInvisible\(\)\)\) return;/);
  assert.match(tor, /if \(now !== was\) setNote\(modeSaid\(now\)\);/);
  assert.match(read('app/nostr.tsx'), /setNote\(direct \? modeSaid\('anonymous'\)/);
});

function place(more: Partial<CallPlace> = {}) {
  const sent: { identity: string; signal: CallSignal }[] = [];
  const lines: { peer: string; mine: boolean; text: string }[] = [];
  const calls: CallPlace = {
    send: async (identity, signal) => void sent.push({ identity, signal }),
    callRelay: async () => null,
    line: (peer, mine, text) => void lines.push({ peer, mine, text }),
    name: () => 'Anna',
    ...more,
  };
  return { calls, sent, lines };
}

const offer = (id = '0123456789abcdef'): Extract<CallSignal, { kind: 'offer' }> => ({ id, kind: 'offer', video: false, sdp: 'v=0\r\na=candidate:1 1 udp 2122260223 192.168.1.20 50000 typ host', at: Date.now() });

test('in INVISIBLE no call starts, and a call says why before anything is asked', async () => {
  await setLang('en');
  setThroughTor('all');
  const { rtc, connections } = fakeRtc();
  assert.throws(() => startCall(place().calls, 'contact:a', false, null, rtc), { message: callsOffNote() });
  assert.match(callsOffNote(), /^No calls in INVISIBLE: a call would show your internet address\. To call, choose ANONYMOUS or SPEED at the top of Settings\.$/);
  const group: GroupCallPlace = { send: async () => undefined, callRelay: async () => null, me: async () => '11'.repeat(32), line: () => undefined };
  await assert.rejects(startGroupCall(group, 'ab'.repeat(16), false, null, rtc), { message: callsOffNote() });
  await assert.rejects(joinGroupCall(group, 'ab'.repeat(16), null, rtc), { message: callsOffNote() });
  assert.throws(() => startMatrixCall('!room:example.org', false), { message: callsOffNote() });
  assert.equal(connections.length, 0);
  // Each call button says it first: before the microphone, the camera or a question.
  const guard = /if \(callsOff\(\)\) \{\s+setNote\(callsOffNote\(\)\);\s+return;\s+\}/;
  for (const [file, start] of [
    ['app/chat.tsx', 'async function startCall(video: boolean) {'],
    ['components/group-chat.tsx', 'async function call(asked: boolean) {'],
    ['app/xmpp-chat.tsx', 'async function call(video: boolean) {'],
    ['app/xmpp-chat.tsx', 'async function callGroup(asked: boolean) {'],
    ['app/matrix-chat.tsx', 'async function call(video: boolean) {'],
  ]) {
    const source = read(file);
    const body = source.slice(source.indexOf(start), source.indexOf(start) + 5000);
    const found = guard.exec(body);
    assert.ok(source.includes(start) && found, `${file}: ${start}`);
    assert.ok(found.index < body.indexOf('callPermissions('), `${file}: before the microphone is asked`);
  }
});

test("in INVISIBLE a contact's call does not ring: one line, once, that says why, and nothing goes back", async () => {
  await setLang('en');
  setThroughTor('all');
  const { rtc, connections } = fakeRtc();
  const here = place();
  const said = await callSignal(here.calls, 'contact:a', offer(), false, rtc);
  assert.equal(said, 'Anna tried to call. In INVISIBLE no call rings, as a call would show your internet address. To take calls, choose ANONYMOUS or SPEED at the top of Settings.');
  assert.equal(shownCall(), null, 'nothing rings');
  assert.equal(connections.length, 0);
  assert.deepEqual(here.lines, [{ peer: 'contact:a', mine: false, text: 'Missed voice call, in INVISIBLE' }]);
  assert.deepEqual(here.sent, [], 'the caller is told nothing');
  // The same offer again, through another way: no second line.
  assert.equal(await callSignal(here.calls, 'contact:a', offer(), false, rtc), null);
  assert.equal(here.lines.length, 1);
  // The chat shows the line in its language.
  assert.equal(shownLine('📞 Missed voice call, in INVISIBLE'), '📞 Missed voice call, in INVISIBLE');
  await setLang('el');
  assert.equal(shownLine('📞 Missed video call, in INVISIBLE'), `📞 ${t('{missed}, in INVISIBLE', { missed: EL['Missed video call'] })}`);
  assert.doesNotMatch(shownLine('📞 Missed video call, in INVISIBLE'), /Missed|, in INVISIBLE$/);
  await setLang('en');
  assert.equal(matrixCallLine({ id: 'x', roomId: '!r', video: false, outgoing: false, state: 'ended', end: 'off' }), 'Missed voice call, in INVISIBLE');
  // Out of INVISIBLE it rings as ever.
  setThroughTor('off');
  assert.equal(await callSignal(here.calls, 'contact:a', offer('fedcba9876543210'), false, rtc), null);
  assert.equal(shownCall()?.call.state, 'incoming');
});

test("in INVISIBLE a group's call does not ring, keeps one line, and still shows as going on", async () => {
  setThroughTor('all');
  const lines: string[] = [];
  const group: GroupCallPlace = { send: async () => undefined, callRelay: async () => null, me: async () => '11'.repeat(32), line: (_group, text) => void lines.push(text) };
  const { rtc } = fakeRtc();
  const GROUP = 'ab'.repeat(16);
  const start = { id: 'cd'.repeat(8), kind: 'start' as const, at: Date.now(), video: true };
  await groupCallSignal(group, GROUP, '22'.repeat(32), start, rtc);
  await groupCallSignal(group, GROUP, '22'.repeat(32), start, rtc);
  assert.equal(shownGroupCall(), null, 'nothing rings');
  assert.deepEqual(lines, ['📞 Missed group video call, in INVISIBLE']);
  assert.equal(groupCallGoingOn(GROUP)?.id, start.id, 'its screen still shows the call, and joining says why not');
});

test('INVISIBLE chosen while the call relay is asked: the call does not ring either, one line says why', async () => {
  await setLang('en');
  const { rtc, connections } = fakeRtc();
  // A contact's call.
  const here = place({ callRelay: async () => (setThroughTor('all'), null) });
  const said = await callSignal(here.calls, 'contact:a', offer('aaaabbbbccccdddd'), false, rtc);
  assert.match(said ?? '', /^Anna tried to call\. In INVISIBLE no call rings/);
  assert.equal(shownCall(), null, 'nothing rings');
  assert.equal(connections.length, 0);
  assert.deepEqual(here.lines, [{ peer: 'contact:a', mine: false, text: 'Missed voice call, in INVISIBLE' }]);
  assert.deepEqual(here.sent, [], 'the caller is told nothing');
  // A group's call.
  setThroughTor('off');
  let flip = false;
  const lines: string[] = [];
  const group: GroupCallPlace = { send: async () => undefined, callRelay: async () => (flip && setThroughTor('all'), null), me: async () => '11'.repeat(32), line: (_group, text) => void lines.push(text) };
  const GROUP = 'ef'.repeat(16);
  flip = true;
  await groupCallSignal(group, GROUP, '22'.repeat(32), { id: 'ab'.repeat(8), kind: 'start', at: Date.now(), video: false }, rtc);
  assert.equal(shownGroupCall(), null, 'nothing rings');
  assert.deepEqual(lines, ['📞 Missed group call, in INVISIBLE']);
  // Two started one at once, and this phone would join the other's: it does not either.
  setThroughTor('off');
  flip = false;
  const ours = await startGroupCall(group, GROUP, false, null, rtc);
  flip = true;
  await groupCallSignal(group, GROUP, '33'.repeat(32), { id: '00'.repeat(8), kind: 'start', at: Date.now(), video: false }, rtc);
  assert.equal(ours.state, 'ended');
  assert.equal(shownGroupCall(), null, 'not joined');
  assert.equal(lines.at(-1), '📞 Missed group call, in INVISIBLE');
});

test("in INVISIBLE a closed hidden place's call rings not even with no name: kept at once as missed, saying why", () => {
  // Erevos's own (lib/place-receiver.ts), read here: in INVISIBLE its relay is read only through Tor.
  const receiver = read('lib/place-receiver.ts');
  const offer = receiver.slice(receiver.indexOf("if (call.kind === 'offer') {"));
  const off = offer.indexOf('} else if (callsOff()) {');
  assert.ok(off > 0 && off < offer.indexOf('ringListeners.forEach('), 'asked before it rings');
  assert.match(offer.slice(off, off + 300), /missed\(received, CALLS_OFF_LINE\);/);
  // Matrix's alike (lib/matrix-calls.ts), before the place rings.
  const matrix = read('lib/matrix-calls.ts');
  const closed = matrix.slice(matrix.indexOf('function onClosedEvent('));
  const at = closed.indexOf('if (callsOff()) return rangOff(rung, ring.until, state);');
  assert.ok(at > 0 && at < closed.indexOf('placeNetworkRang('), 'Matrix: before it rings');
  // A place's ring queue (lib/hidden-ring-notices.ts) is drained, not rung: its offer, read as the
  // place opens, is kept as missed there.
  assert.match(read('lib/hidden-ring-notices.ts'), /if \(mayRing\(pocket\) && !receivesPocket\(space, pocket\) && !callsOff\(\)\) ring\(space, pocket, cameAt\);/);
});

test('a hidden call that rings with no name stops as INVISIBLE is chosen, whatever brought it', () => {
  setCurrentSpace(0, newSpaceKey());
  const stop = startHiddenRinging(() => assert.fail('nothing rings here'));
  try {
    setHiddenRinging({ space: 0, pocket: 1, at: Date.now() });
    setThroughTor('messages');
    assert.ok(hiddenRinging(), 'Tor for messages only leaves it be');
    setThroughTor('all');
    assert.equal(hiddenRinging(), null);
  } finally {
    stop();
    setHiddenRinging(null);
    setCurrentSpace(null);
  }
});

test('choosing INVISIBLE ends a call going on, and a group call, as no call goes through Tor', async () => {
  const { rtc } = fakeRtc();
  const call = startCall(place().calls, 'contact:a', false, null, rtc);
  assert.notEqual(call.state, 'ended');
  setThroughTor('messages');
  assert.notEqual(call.state, 'ended', 'Tor for messages only leaves calls be');
  setThroughTor('all');
  assert.equal(call.state, 'ended');
  closeCall(call);

  setThroughTor('off');
  const group: GroupCallPlace = { send: async () => undefined, callRelay: async () => null, me: async () => '11'.repeat(32), line: () => undefined };
  const ours = await startGroupCall(group, 'ab'.repeat(16), false, null, rtc);
  assert.equal(ours.state, 'in');
  setThroughTor('all');
  assert.equal(ours.state, 'ended');
});

test('a screen that changes the mode by the way says which it is now, and what it means', async () => {
  await setLang('en');
  const said: Record<Mode, RegExp> = {
    speed: /^This space is now SPEED: the servers and your contacts see your address\.$/,
    anonymous: /^This space is now ANONYMOUS: only the server sees your address\. SPEED comes back only when you choose it at the top of Settings\.$/,
    invisible: /^This space is now INVISIBLE: everything goes through Tor, and there are no calls\.$/,
  };
  for (const mode of MODES) assert.match(modeSaid(mode), said[mode]);
  await setLang('el');
  for (const mode of MODES) assert.ok(modeSaid(mode).includes(MODE_NAMES[mode]) && !/This space/.test(modeSaid(mode)), mode);
  await setLang('en');
});
