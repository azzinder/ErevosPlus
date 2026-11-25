// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The line under the top bar of home (lib/relay-line.ts, app/index.tsx, lib/ways-read.ts): it
// never says "No relay yet" before the space's own data says so. Home is drawn anew each time the
// space comes back from its password screen, and it said so for some seconds, until every chat was
// read, though the space had its relay all along. What is held here: what the line says of what
// was read, that nothing read says nothing, that what was read is remembered only while the space
// is open, and that home reads it alone and draws nothing it does not know.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { forgetRelayLine, keepRelayLine, knownRelayLine, relayLineOf } from '../lib/relay-line';

const ROOT = join(import.meta.dirname, '..');
const read = (...parts: string[]) => readFileSync(join(ROOT, ...parts), 'utf8');

test('the line says only what the space\'s data says, and nothing when it could not be read', () => {
  const queue = { recipientHex: 'aa', senderHex: 'bb' };
  assert.equal(relayLineOf({ url: 'https://relay.example', ownQueue: queue }), 'ready');
  assert.equal(relayLineOf({ url: 'https://relay.example', ownQueue: null }), 'no-queue');
  assert.equal(relayLineOf({ url: '', ownQueue: null }), 'none');
  assert.equal(relayLineOf({ url: '  ', ownQueue: queue }), 'none');
  // Not read: no word, so what was known stays, and "No relay yet" is never guessed.
  assert.equal(relayLineOf(null), null);
  assert.equal(relayLineOf(undefined), null);
});

test('what was read is known from the first drawing, for the open space only, until it closes', () => {
  forgetRelayLine();
  assert.equal(knownRelayLine(0), 'unknown');
  assert.equal(knownRelayLine(null), 'unknown');
  keepRelayLine(0, 'ready');
  assert.equal(knownRelayLine(0), 'ready');
  // Another space knows nothing of it.
  assert.equal(knownRelayLine(1), 'unknown');
  keepRelayLine(1, 'none');
  assert.equal(knownRelayLine(1), 'none');
  assert.equal(knownRelayLine(0), 'unknown');
  keepRelayLine(1, 'no-queue');
  assert.equal(knownRelayLine(1), 'no-queue');
  forgetRelayLine();
  assert.equal(knownRelayLine(1), 'unknown');
});

test('home starts from what is known, reads the relay alone, and draws nothing before it knows', () => {
  const home = read('app', 'index.tsx');
  // It starts from what was read while the space is open, never from "none".
  assert.match(home, /useState<Relay>\(\(\) => \{\s+try \{\s+return knownRelayLine\(currentSpace\(\)\.space\);\s+\} catch \{\s+return 'unknown';/);
  assert.doesNotMatch(home, /useState<Relay>\('none'\)/);
  // Read at once and alone, before the chats: data not read changes nothing.
  const load = home.slice(home.indexOf('const load = () => {'), home.indexOf('reload.current = load;'));
  const alone = load.indexOf('void quiet(loadCurrentSpaceData(), null).then((data) => {');
  assert.ok(alone > 0 && alone < load.indexOf('void Promise.all(['));
  assert.match(load.slice(alone, alone + 400), /const line = relayLineOf\(data\);\s+if \(!active \|\| !line\) return;\s+keepRelayLine\(current, line\);\s+setRelay\(line\);/);
  assert.equal(load.split('setRelay(').length - 1, 1);
  assert.equal(load.split('loadCurrentSpaceData()').length - 1, 1);
  // Unknown draws the line's place with no words; "No relay yet" only when the data said none.
  const row = home.slice(home.indexOf('<View style={styles.statusRow}>'), home.indexOf("{relay === 'ready' && linkedRole() !== 'linked' ? ("));
  assert.match(row, /\{relay === 'ready' \? \([\s\S]+\) : relay === 'unknown' \? \([\s\S]+?statusUnknown[\s\S]+?\) : \(\s+<Pressable\s+onPress=\{\(\) => router\.push\('\/chat\?setup=1'\)\}/);
  const unknown = row.slice(row.indexOf("relay === 'unknown' ? ("), row.indexOf("onPress={() => router.push('/chat?setup=1')}"));
  assert.doesNotMatch(unknown, /relayText|t\(/);
  // The ways' dots: none until they were read once, so no ring says the relay is off meanwhile.
  assert.match(home, /const shownWays = waysRead \? waysShown\.ways\.filter\(\(way\) => way\.id !== 'tor'\) : \[\];/);

  const ways = read('lib', 'ways-read.ts');
  assert.match(ways, /const \[read, setRead\] = useState<WaysRead \| null>\(knownWays\);/);
  assert.match(ways, /if \(space !== null && spaceNow\(\) === space\) lastRead = \{ space, read: next \};/);
  assert.match(ways, /export function forgetWays\(\): void \{\s+lastRead = null;\s+\}/);

  // Nothing of it stays as the space closes.
  const layout = read('app', '_layout.tsx');
  const close = layout.slice(layout.indexOf('function closeSpace(): void {'), layout.indexOf('function openKey()'));
  assert.match(close, /forgetRelayLine\(\);\s+forgetWays\(\);/);
});
