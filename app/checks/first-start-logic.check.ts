// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The first start's steps and colours (lib/first-start.ts), its permissions in five groups and the
// order Allow all goes in (lib/permission-groups.ts), and when an invite Erevos was first opened
// with brings the first space's server instead of LPHL's open one (lib/invite-server.ts).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { contactLink } from '../lib/contact-code';
import { randomBytes, toHex } from '../lib/crypto';
import { toBase64Url } from '../lib/e2e';
import { startLook, startSteps, stepAt, TILES } from '../lib/first-start';
import { bringsServer } from '../lib/invite-server';
import { linkHref } from '../lib/open-link';
import type { Check, CheckId } from '../lib/permission-checks';
import { allAllowed, askedInApp, countAllowed, nextSettingsScreen, permissionGroups, type RowId } from '../lib/permission-groups';
import { textInviteLink, type TextInvite } from '../lib/text-invite';
import { welcomeLink } from '../lib/welcome';

test('five steps, four without modules to choose, the mode left out after a restore, the permissions where they are looked at', () => {
  assert.deepEqual(startSteps({ choice: true, checks: true }), ['welcome', 'modules', 'mode', 'permissions', 'keep']);
  // Erevos Lite, or a device with Erevos's own chats alone.
  assert.deepEqual(startSteps({ choice: false, checks: true }), ['welcome', 'mode', 'permissions', 'keep']);
  // Moving from another phone: the backup brought the mode.
  assert.deepEqual(startSteps({ choice: true, restored: true, checks: true }), ['welcome', 'modules', 'permissions', 'keep']);
  // The computer app has no permissions to look at.
  assert.deepEqual(startSteps({ choice: true, checks: false }), ['welcome', 'modules', 'mode', 'keep']);
  const steps = startSteps({ choice: false, checks: true });
  assert.deepEqual(stepAt(steps, 'welcome'), { n: 1, of: 4 });
  assert.deepEqual(stepAt(steps, 'mode'), { n: 2, of: 4 });
  assert.deepEqual(stepAt(steps, 'keep'), { n: 4, of: 4 });
});

test("each edition in its own colours, Erevos and Erevos Lite alike, over a ground dark or light", () => {
  const erevos = startLook(true, 'erevos');
  const lite = startLook(true, 'lite');
  const plus = startLook(true, 'plus');
  assert.deepEqual(erevos, lite);
  assert.equal(erevos.primary, '#F0472A');
  assert.deepEqual(plus.button, ['#8B6CF0', '#3450D7']);
  assert.notEqual(plus.primary, erevos.primary);
  const light = startLook(false, 'erevos');
  assert.equal(light.dark, false);
  assert.notEqual(light.text, erevos.text);
  // The edition's colours stay the same, dark or light.
  assert.equal(light.primary, erevos.primary);
  for (const look of [erevos, light, plus]) {
    for (const colour of [look.text, look.muted, look.ok, look.warn, look.primary, ...look.ground, ...look.button]) assert.match(colour, /^#[0-9A-F]{6}$/, colour);
  }
  for (const [from, to] of Object.values(TILES)) {
    assert.match(from, /^#[0-9A-F]{6}$/);
    assert.match(to, /^#[0-9A-F]{6}$/);
  }
});

const check = (id: CheckId, state: Check['state'], needed = false): Check => ({ id, state, needed });

test('the permissions show in five groups by what they are for, leaving out what the device cannot do', () => {
  const checks = [
    check('battery', 'missing', true),
    check('notices', 'ok', true),
    check('microphone', 'missing', true),
    check('alarms', 'ok'),
    check('nearby', 'missing'),
    check('push', 'none'),
    check('maker', 'yours', true),
  ];
  const groups = permissionGroups(checks, { phoneApp: false, smsApp: null });
  assert.deepEqual(
    groups.map((group) => [group.id, group.rows.map((row) => row.id)]),
    [
      ['notices', ['notices']],
      ['calls', ['microphone', 'phoneApp']],
      ['messages', ['nearby']],
      ['background', ['battery', 'maker']],
      ['reminders', ['alarms']],
    ],
  );
  assert.deepEqual(countAllowed(groups), { ok: 2, all: 7 });
  assert.equal(allAllowed(groups), false);
  // No phone app row where the Phone is off, and no group with nothing in it.
  const fewer = permissionGroups([check('notices', 'ok', true)], { phoneApp: null, smsApp: null });
  assert.deepEqual(
    fewer.map((group) => group.id),
    ['notices'],
  );
  assert.equal(allAllowed(fewer), true);
});

test("Allow all asks Android's own questions first, then the default apps, then one settings screen at a time", () => {
  const checks = [
    check('notices', 'missing', true),
    check('calls', 'missing', true),
    check('microphone', 'ok', true),
    check('contacts', 'missing'),
    check('battery', 'missing', true),
    check('unused', 'missing', true),
    check('restricted', 'ok', true),
    check('ringer', 'missing'),
    check('alarms', 'missing'),
  ];
  const groups = permissionGroups(checks, { phoneApp: false, smsApp: true });
  assert.deepEqual(askedInApp(groups), { checks: ['notices', 'contacts', 'battery'], phoneApp: true, smsApp: false });
  // Only what calls and messages need, and only what a question in Erevos cannot change.
  const opened = new Set<RowId>();
  const order: CheckId[] = [];
  for (let next = nextSettingsScreen(groups, opened); next; next = nextSettingsScreen(groups, opened)) {
    order.push(next);
    opened.add(next);
  }
  assert.deepEqual(order, ['calls', 'unused']);
  // Once allowed, a screen is not opened again.
  const later = permissionGroups(
    checks.map((one) => (one.id === 'calls' ? { ...one, state: 'ok' as const } : one)),
    { phoneApp: true, smsApp: true },
  );
  assert.equal(nextSettingsScreen(later, new Set()), 'unused');
  assert.deepEqual(askedInApp(later).phoneApp, false);
});

// As a link opens its screen (lib/open-link.ts), the way the first start keeps it.
const screen = (link: string) => linkHref(link);

test("an invite that brings a place on someone's server is the first space's server; a contact link or an invite with no place is not", () => {
  const contact = { senderHex: '12'.repeat(24), relayUrl: 'wss://home.example.org/erevos', key: 'abc-DEF_123', relayKey: 'k'.repeat(43) };
  const link = contactLink(contact);
  const hi = 'ab'.repeat(16);
  assert.equal(bringsServer(screen(welcomeLink(link, { code: 'cd'.repeat(32), hi, name: 'Νίκος' }))), true);
  // An inviting phone whose server does not let it invite (an open place on LPHL's) gives no place.
  assert.equal(bringsServer(screen(welcomeLink(link, { hi }))), false);
  assert.equal(bringsServer(screen(`erevos://relay-invite?relay=${encodeURIComponent('wss://home.example.org/erevos')}&code=${'ef'.repeat(32)}`)), true);
  assert.equal(bringsServer(screen(`erevos://relay-invite?relay=nowhere&code=${'ef'.repeat(32)}`)), false);
  assert.equal(bringsServer(screen(link)), false);
  assert.equal(bringsServer(undefined), false);
  assert.equal(bringsServer(''), false);
  assert.equal(bringsServer('/'), false);

  const invite: TextInvite = {
    sender: toHex(randomBytes(24)),
    key: randomBytes(32),
    code: toHex(randomBytes(32)),
    relay: 'wss://home.example.org/erevos',
    relayKey: toBase64Url(randomBytes(32)),
    name: 'Νίκος',
    expires: 1_800_000_000_000,
  };
  const sms = screen(textInviteLink(invite));
  assert.match(sms, /^\/text-invite\?d=/);
  assert.equal(bringsServer(sms, 1_700_000_000_000), true);
  // One that is over brings nothing, nor does a contact card, which has no invite to the server.
  assert.equal(bringsServer(sms, 1_900_000_000_000), false);
  assert.equal(bringsServer(screen(textInviteLink({ ...invite, code: '', expires: 0, card: true })), 1_700_000_000_000), false);
});
