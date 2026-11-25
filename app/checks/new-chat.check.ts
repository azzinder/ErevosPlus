// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// New chat's pages as they were drawn before they were built (the owner's word, 2026-11-25: the
// real ones had more text, the whole invite link as text, and a dense QR code in the middle of
// Near me). What can be held without a phone: how a long link reads on the screen while all of it
// still goes (lib/shown-link.ts), and that the pages are written the way that was asked: the
// question quiet over three doors with the first lit, the QR code on Near me a small tile that
// shows large when tapped, and the invite on Far away a message whose link is never shown whole.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { shownLink } from '../lib/shown-link';
import { TEXT_INVITE_PAGE } from '../lib/text-invite';

const ROOT = join(import.meta.dirname, '..');
const read = (...parts: string[]) => readFileSync(join(ROOT, ...parts), 'utf8');

test('a long link reads short on the screen: where it goes, and the two ends of what it carries', () => {
  const carried = 'AQFrD667prxhc0Jmf2NyGFN8yqIgHI1ECbIIcaHm08WxS47a4N-hmX6zK9x6mNMNyRImL8J2hS6npR5gJhvUG0_0ijRG36MKIssodb1p5texVGGh_bOmFmo2uFxXvFUFqmvygFLHLvig2Xe_H-sNXdPewVaoI6NTXQgcjRcaBk5Ia3RIbg';
  const link = `${TEXT_INVITE_PAGE}#${carried}`;
  const shown = shownLink(link);
  assert.equal(shown, 'erevos-web.lphl.nekten.eu/i#AQFr…RIbg');
  // Short enough for one line of a phone, and nothing of the middle in it.
  assert.ok(shown.length <= 40);
  assert.ok(!shown.includes(carried.slice(4, -4)));
  // An invite that opens only in Erevos, the same way.
  assert.equal(shownLink(`erevos://welcome?d=${carried}`), 'erevos://welcome?d=AQ…RIbg');
  // A link with nothing after a mark: its start and its end.
  assert.equal(shownLink(`https://example.org/${'a'.repeat(30)}${'b'.repeat(30)}`), `example.org/${'a'.repeat(12)}aaaa…bbbb`);
});

test('a link short enough to read is left whole, and reading it short changes nothing but how it reads', () => {
  assert.equal(shownLink('https://erevos.example/i#abcd1234'), 'erevos.example/i#abcd1234');
  assert.equal(shownLink('  https://erevos.example/i#abcdefghijkl  '), 'erevos.example/i#abcdefghijkl');
  assert.equal(shownLink('erevos.example'), 'erevos.example');
  assert.equal(shownLink(''), '');
  // One letter past what is left whole: cut.
  assert.equal(shownLink('https://erevos.example/i#abcdefghijklm'), 'erevos.example/i#abcd…jklm');
  // Whatever it is given, it gives no more than it was given.
  for (const link of ['https://a.b/c#' + 'x'.repeat(500), 'HTTPS://A.B/C?' + 'y'.repeat(500), 'z'.repeat(500)]) {
    assert.ok(shownLink(link).length < 60, link.slice(0, 20));
  }
});

test('Far away shows the invite as a message with its link read short; what is sent, copied or drawn is all of it', () => {
  const page = read('components', 'welcome-invite.tsx');
  // The link in the message is the short reading, and nowhere is the whole message put on the screen as text.
  assert.match(page, /<Text color=\{colors\.accentText\}>\{shownLink\(made\.link\)\}<\/Text>/);
  assert.doesNotMatch(page, /<Text[^>]*>\{message\(made\.link\)\}<\/Text>/);
  // Nothing that reads short can be selected and copied from the page: copying is the button's.
  assert.doesNotMatch(page, /<Text selectable/);
  // Sending and copying take the whole link, and so does the QR code.
  assert.match(page, /onPress=\{\(\) => void share\(made\.link\)\}/);
  assert.match(page, /\(\) => void share\(made\.link, true\)\)/);
  assert.match(page, /await Share\.share\(\{ message: message\(link\) \}\);/);
  assert.match(page, /copyText\(message\(link\)\)/);
  assert.match(page, /<QrCode text=\{made\.link\} size=\{260\} \/>/);
  // The names are behind their question until it is tapped, and the QR code is in a sheet.
  assert.match(page, /\{naming \? \(/);
  assert.match(page, /<Sheet visible=\{qrShown && visible\}/);
});

test('Near me has its QR code as a small tile that shows large when tapped, and the other’s code as two buttons side by side', () => {
  const page = read('components', 'near-me.tsx');
  // The page draws no QR code of its own: it is given the tile.
  assert.doesNotMatch(page, /<QrCode /);
  assert.match(page, /<View style=\{styles\.beside\}>\n\s+\{qr\}/);
  assert.match(page, /<Button title=\{t\('Scan theirs'\)\} kind="secondary" compact style=\{styles\.half\} onPress=\{onScan\} \/>\n\s+<Button title=\{t\('Type their code'\)\} kind="secondary" compact style=\{styles\.half\} onPress=\{onType\} \/>/);
  // Both QR codes it may be given are tiles: the invite's, and this phone's contact link's.
  assert.match(read('components', 'welcome-invite.tsx'), /<QrTile text=\{made\.link\} shown=\{visible\}>/);
  assert.match(read('app', 'chat.tsx'), /<QrTile text=\{ownLink\} shown=\{shown\}>/);
  // The tile: small on the page, large in a sheet that closes when its page does not show.
  const cards = read('components', 'connect-cards.tsx');
  assert.match(cards, /export const QR_TILE = 112;/);
  // Held to that size: a code of many modules would come out wider on a screen of few pixels,
  // and push what it is for out of the card.
  assert.match(cards, /<QrCode text=\{text\} size=\{QR_TILE\} fixed \/>/);
  assert.match(read('components', 'QrCode.tsx'), /side: fixed \? size : pixels \/ ratio/);
  assert.match(cards, /<Sheet visible=\{large && shown\}/);
  assert.match(cards, /if \(!shown\) setLarge\(false\);/);
});

test('New chat asks its question quietly over three doors, the first lit, with the rest as small buttons', () => {
  const doors = read('components', 'new-chat-doors.tsx');
  // The question is a line, not the page's title.
  assert.match(doors, /<Text variant="bodyStrong" tone="muted" accessibilityRole="header" style=\{styles\.question\}>\n\s+\{t\('Where is the other person\?'\)\}/);
  assert.doesNotMatch(doors, /<Text variant="title">\{t\('Where is the other person\?'\)\}/);
  // Three doors, and only Near me lit, drawn as the look draws its main button.
  assert.equal(doors.match(/<DoorCard\n/g)?.length, 3);
  assert.equal(doors.match(/^\s+lit$/gm)?.length, 1);
  assert.match(doors, /<DoorCard\n\s+lit\n\s+sign=\{[^\n]+\n\s+title=\{t\('Near me'\)\}/);
  assert.match(doors, /const main = buttonColors\('primary', colors\);/);
  // The rest: buttons side by side, not a list of rows.
  assert.match(doors, /rest: \{\n\s+flexDirection: 'row',\n\s+flexWrap: 'wrap',/);
});
