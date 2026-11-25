// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The chats of the other networks Erevos speaks (Nostr, Matrix, XMPP) and the SMS conversation,
// where they are to be as an Erevos chat is: "+" opens Erevos's own panel under the message field
// (components/network-panel.tsx), not a sheet of plain buttons; and the message field with the
// buttons under it sits at the bottom of the screen in a chat with few messages, and on the
// keyboard while it is open, the few messages staying where they were
// (components/network-thread.tsx). No phone runs here, so what is held is what each screen is
// written to do: that all of them go the same way, and none goes back to the old one.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const ROOT = join(import.meta.dirname, '..');
const read = (...parts: string[]) => readFileSync(join(ROOT, ...parts), 'utf8');

// The chats that scroll their head, their thread and the message field together.
const SCROLLED = ['nostr-chat.tsx', 'matrix-chat.tsx', 'xmpp-chat.tsx'];
// And the SMS conversation, whose thread sits above a field of its own.
const ALL = [...SCROLLED, 'sms.tsx'];

test('"+" opens Erevos’s own panel under the field, in every one of them', () => {
  for (const name of ALL) {
    const screen = read('app', name);
    assert.match(screen, /<NetworkPanel\n/, name);
    // No sheet of plain buttons any more.
    assert.doesNotMatch(screen, /<Sheet[^>]*title=\{t\('Attach and more'\)\}/, name);
    // The keyboard goes before the panel opens, or it would open behind it; and the panel gives
    // way to the keyboard when the field is tapped.
    assert.match(screen, /beforePanel\(\);/, name);
    assert.match(screen, /onFocus=\{\(\) => setAttaching\(false\)\}/, name);
    // The button says what it does now: it opens the panel, or closes it.
    assert.match(screen, /label=\{attaching \? t\('Close'\) : t\('Attach and more'\)\}/, name);
    assert.match(screen, /state=\{\{ expanded: attaching \}\}/, name);
  }
});

test('the panel says «encrypted» only where what is sent is end-to-end encrypted', () => {
  // Nostr's private messages (NIP-17) always are.
  assert.match(read('app', 'nostr-chat.tsx'), /<NetworkPanel\n(?:.*\n){0,6}?\s+encrypted\n/);
  // A Matrix room only when it is an encrypted one; XMPP only with OMEMO, never a channel.
  assert.match(read('app', 'matrix-chat.tsx'), /encrypted=\{!!room\.encrypted\}/);
  assert.match(read('app', 'xmpp-chat.tsx'), /encrypted=\{!channel && !plain\}/);
  // An SMS never is.
  assert.match(read('app', 'sms.tsx'), /<NetworkPanel\n(?:.*\n){0,4}?\s+encrypted=\{false\}/);
  // And the panel passes it on as it was told, with no word of its own.
  const panel = read('components', 'network-panel.tsx');
  assert.match(panel, /<ComposerPanel [^>]*encrypted=\{encrypted\}/);
  assert.match(panel, /encrypted: boolean;/);
});

test('a tile closes the panel as it is chosen, and Android’s back closes it before it leaves the chat', () => {
  const panel = read('components', 'network-panel.tsx');
  assert.match(panel, /onPress: \(\) => \{\n\s+onClose\(\);\n\s+tile\.onPress\(\);\n\s+\}/);
  assert.match(panel, /usePanelBack\(open && shown, onClose\);/);
  const close = read('components', 'panel-close.ts');
  // Only on the screen in view, and only while the panel is open.
  assert.match(close, /if \(!open \|\| !focused\) return;/);
  assert.match(close, /BackHandler\.addEventListener\('hardwareBackPress', \(\) => \{\n\s+latest\.current\(\);\n\s+return true;/);
});

test('in a chat with few messages the field sits at the bottom of the screen', () => {
  const thread = read('components', 'network-thread.tsx');
  // The page is at least as tall as the screen, and the thread takes the room that is left.
  assert.match(thread, /export const THREAD_PAGE = \{ flexGrow: 1, /);
  assert.match(thread, /export const THREAD_GROWS = \{ flexGrow: 1, /);
  for (const name of SCROLLED) {
    const screen = read('app', name);
    assert.match(screen, /contentContainerStyle=\{\[THREAD_PAGE, \{ paddingBottom: panelOpen \? 0 : THREAD_FOOT \}\]\}/, name);
    assert.match(screen, /<View style=\{THREAD_GROWS\} \{\.\.\.threadProps\}>/, name);
  }
});

test('with the keyboard open the screen ends above it, as the Erevos chat’s does: the few messages stay in sight', () => {
  const thread = read('components', 'network-thread.tsx');
  // On such a screen all of the view shows: nothing is taken off for the keyboard a second time.
  assert.match(thread, /const shows = \(\) => view\.current\.height - \(!padded && Keyboard\.isVisible\(\) \? \(Keyboard\.metrics\(\)\?\.height \?\? 0\) : 0\);/);
  assert.match(thread, /padded = false,/);
  for (const name of SCROLLED) {
    const screen = read('app', name);
    assert.match(screen, /useNetworkThread\(\{\n(?:\s*\/\/.*\n)*\s+padded: true,/, name);
    assert.match(screen, /<KeyboardPaddedView bottom=\{insets\.bottom\} style=\{\{ flex: 1 \}\}>/, name);
    // A view that moved its content up for the keyboard took a short chat's messages out of sight.
    assert.doesNotMatch(screen, /KeyboardAwareScrollView/, name);
    assert.doesNotMatch(screen, /bottomOffset/, name);
  }
  // The Erevos chat, a group and SMS end above the keyboard the same way.
  assert.match(read('app', 'chat.tsx'), /<KeyboardPaddedView bottom=\{insets\.bottom\} style=\{layout\.screen\}>/);
  assert.match(read('app', 'sms.tsx'), /<KeyboardPaddedView bottom=\{insets\.bottom\} style=\{styles\.screen\}>/);
});
