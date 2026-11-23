// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The parts of Erevos the owner uses (lib/modules.ts): what is kept, what each permission and
// screen belongs to, and the home screen's rows (lib/inbox.ts rowOn).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { rowOn } from '../lib/inbox';
import { afterSteps, checkOwner, checksAt, parseSetupAfter } from '../lib/setup-after';
import {
  checkWanted,
  editionModules,
  keptModules,
  loadModules,
  moduleList,
  moduleOn,
  modulesChosen,
  MODULES,
  modulesHere,
  modulesOn,
  onModulesChange,
  parseModules,
  screenModule,
  setModules,
  turnedOn,
  type Module,
} from '../lib/modules';

const ANDROID = modulesHere('android');
const ELSEWHERE = modulesHere('ios');

test('the phone and the SMS only on Android, the Collection on Android and in the web build; every other module everywhere', () => {
  assert.deepEqual(ANDROID, ['erevos', 'phone', 'sms', 'nostr', 'matrix', 'xmpp', 'collection']);
  assert.deepEqual(ELSEWHERE, ['erevos', 'nostr', 'matrix', 'xmpp']);
  // The desktop app and Sailfish OS keep the Collection's chunks in the shell's folder, a plain
  // browser (an iPhone's home-screen app too) in its own storage.
  const WEB = ['erevos', 'nostr', 'matrix', 'xmpp', 'collection'];
  assert.deepEqual(modulesHere('web', null), WEB);
  assert.deepEqual(modulesHere('web', 'electron'), WEB);
  assert.deepEqual(modulesHere('web', 'sailfish'), WEB);
  assert.deepEqual(modulesHere('android', 'electron'), ANDROID);
  // A backup made on Android, read in the desktop app, a browser or on Sailfish OS: the Collection stays on there.
  for (const shell of ['electron', 'sailfish', null] as const)
    assert.deepEqual([...(parseModules('["phone","collection","erevos"]', modulesHere('web', shell)) ?? [])], ['erevos', 'collection']);
});

test('Telegram only in the ErevosGram build for Android, before the Collection', () => {
  assert.deepEqual(modulesHere('android', null, true), ['erevos', 'phone', 'sms', 'nostr', 'matrix', 'xmpp', 'telegram', 'collection']);
  assert.deepEqual(modulesHere('android', null, false), ANDROID);
  assert.deepEqual(modulesHere('web', 'electron', true), ['erevos', 'nostr', 'matrix', 'xmpp', 'collection']);
  assert.equal(screenModule('telegram-chat'), 'telegram');
  // Telegram alone is a way to chat.
  assert.deepEqual([...(parseModules(JSON.stringify({ on: ['telegram'], known: MODULES }), modulesHere('android', null, true)) ?? [])], ['telegram']);
  // A choice from before Telegram came: Telegram is on in the ErevosGram build, as every newer module is.
  assert.deepEqual([...(parseModules(JSON.stringify({ on: ['erevos'], known: ['erevos', 'phone', 'sms', 'nostr', 'matrix', 'xmpp', 'collection'] }), modulesHere('android', null, true)) ?? [])], ['erevos', 'telegram']);
});

test('nothing kept, or nothing usable, is every module on', () => {
  assert.equal(parseModules(null, ANDROID), null);
  assert.equal(parseModules('', ANDROID), null);
  assert.equal(parseModules('not json', ANDROID), null);
  assert.equal(parseModules('{"erevos":true}', ANDROID), null);
  assert.equal(parseModules('[]', ANDROID), null);
  assert.equal(parseModules('["fax"]', ANDROID), null);
  // The Collection alone leaves no chat to open.
  assert.equal(parseModules('["collection"]', ANDROID), null);
  // The phone kept on Android, read on a computer from a backup: nothing this device runs.
  assert.equal(parseModules('["phone","sms"]', ELSEWHERE), null);
});

const KNOWN = JSON.stringify(MODULES);

test('what is kept is read back, in the modules order, only those this device runs', () => {
  assert.deepEqual([...(parseModules(`{"on":["xmpp","phone"],"known":${KNOWN}}`, ANDROID) ?? [])], ['phone', 'xmpp']);
  assert.deepEqual([...(parseModules(`{"on":["phone","nostr"],"known":${KNOWN}}`, ELSEWHERE) ?? [])], ['nostr']);
  assert.equal(keptModules(['xmpp', 'erevos'], ANDROID), `{"on":["erevos","xmpp"],"known":${KNOWN}}`);
  assert.equal(keptModules(['phone'], ELSEWHERE), null);
  assert.equal(keptModules([], ANDROID), null);
  assert.equal(keptModules(['collection'], ANDROID), null);
  assert.equal(keptModules(['collection', 'sms'], ANDROID), `{"on":["sms","collection"],"known":${KNOWN}}`);
  for (const chosen of [['erevos'], ['sms', 'collection'], ['nostr', 'matrix', 'xmpp']] as Module[][])
    assert.deepEqual([...(parseModules(keptModules(chosen, ANDROID), ANDROID) ?? [])], chosen);
});

test('a module newer than the choice is on, until it is turned off', () => {
  // Chosen before the Collection came (6.x kept a bare list): it is on after the update.
  assert.deepEqual([...(parseModules('["xmpp","phone"]', ANDROID) ?? [])], ['phone', 'xmpp', 'collection']);
  assert.deepEqual([...(parseModules('["erevos","sms"]', modulesHere('web', 'sailfish')) ?? [])], ['erevos', 'collection']);
  assert.deepEqual([...(parseModules('["phone","nostr"]', ELSEWHERE) ?? [])], ['nostr']);
  // Turned off since: it stays off.
  assert.deepEqual([...(parseModules(`{"on":["erevos","sms"],"known":${KNOWN}}`, ANDROID) ?? [])], ['erevos', 'sms']);
  // One that came after the choice.
  assert.deepEqual([...(parseModules('{"on":["erevos"],"known":["erevos","phone","sms","nostr","xmpp","collection"]}', ANDROID) ?? [])], ['erevos', 'matrix']);
  // What it was chosen among not said: none is newer.
  assert.deepEqual([...(parseModules('{"on":["erevos"]}', ANDROID) ?? [])], ['erevos']);
  // The Collection alone, even so, leaves no chat to open.
  assert.equal(parseModules('[]', modulesHere('web', null)), null);
});

test('Erevos itself can be off; at least one stays on', async () => {
  // As before the owner chose: every module this device runs is on.
  await loadModules(true);
  assert.equal(modulesChosen(), false);
  assert.deepEqual(modulesOn(), modulesHere());
  let told = 0;
  const stop = onModulesChange(() => told++);
  assert.equal(await setModules([]), false);
  assert.equal(told, 0);
  assert.equal(await setModules(['nostr']), true);
  assert.equal(modulesChosen(), true);
  assert.equal(moduleOn('erevos'), false);
  assert.equal(moduleOn('nostr'), true);
  assert.equal(told, 1);
  // The same again tells no one.
  assert.equal(await setModules(['nostr']), true);
  assert.equal(told, 1);
  // Read again as the next start reads it.
  await loadModules(true);
  assert.equal(modulesChosen(), true);
  assert.deepEqual(modulesOn(), ['nostr']);
  stop();
  assert.equal(await setModules(modulesHere()), true);
  assert.equal(told, 1);
});

test('turned on: only those that were off', () => {
  assert.deepEqual(turnedOn(['erevos', 'sms'], ['erevos', 'nostr', 'matrix']), ['nostr', 'matrix']);
  assert.deepEqual(turnedOn(['erevos'], ['erevos']), []);
});

test('a link names modules this device runs, in their order', () => {
  assert.deepEqual(moduleList('xmpp,phone,fax', ANDROID), ['phone', 'xmpp']);
  assert.deepEqual(moduleList('phone', ELSEWHERE), []);
  assert.deepEqual(moduleList(undefined, ANDROID), []);
});

test('each permission is asked for only by the modules that use it', () => {
  const only = (...m: Module[]) => m;
  // Every module needs the notices; only Erevos the phones nearby and the reminders.
  for (const module of ANDROID) assert.equal(checkWanted('notices', only(module)), true);
  assert.equal(checkWanted('nearby', only('erevos')), true);
  assert.equal(checkWanted('nearby', only('nostr', 'matrix', 'xmpp', 'phone', 'sms')), false);
  assert.equal(checkWanted('reminders', only('phone')), false);
  // Waiting for messages in the background: not for the Phone or the SMS, which Android brings.
  assert.equal(checkWanted('battery', only('phone', 'sms')), false);
  assert.equal(checkWanted('battery', only('matrix')), true);
  // Calls over the lock screen for the Phone too; the call notice for the chats' calls.
  assert.equal(checkWanted('fullScreen', only('phone')), true);
  assert.equal(checkWanted('calls', only('phone')), false);
  assert.equal(checkWanted('calls', only('xmpp')), true);
  assert.equal(checkWanted('contacts', only('sms')), true);
  assert.equal(checkWanted('contacts', only('nostr')), false);
  // The Collection takes photos with the camera and keeps files; it waits for nothing in the background.
  assert.equal(checkWanted('camera', only('collection')), true);
  assert.equal(checkWanted('storage', only('collection')), true);
  assert.equal(checkWanted('battery', only('collection')), false);
});

test('each screen belongs to its module; contacts, settings and the guide to none', () => {
  assert.equal(screenModule('phone'), 'phone');
  assert.equal(screenModule('sms-folder'), 'sms');
  assert.equal(screenModule('matrix-chat'), 'matrix');
  assert.equal(screenModule('xmpp'), 'xmpp');
  assert.equal(screenModule('collection'), 'collection');
  assert.equal(screenModule('nostr-chats'), 'nostr');
  assert.equal(screenModule('chat'), 'erevos');
  assert.equal(screenModule('group'), 'erevos');
  // Erevos's own way through Nostr, not the chats with other Nostr apps.
  assert.equal(screenModule('nostr'), 'erevos');
  for (const route of ['index', 'contacts', 'contact-card', 'settings/index', 'modules', 'permissions', 'guide/index', 'backup', 'security', 'appearance']) {
    assert.equal(screenModule(route), null, route);
  }
});

test('the home screen lists only the rows of modules on', () => {
  const on = new Set<Module>(['sms', 'matrix']);
  assert.equal(rowOn({ sms: '+30691', network: undefined }, on), true);
  assert.equal(rowOn({ sms: '', network: 'matrix' }, on), true);
  assert.equal(rowOn({ sms: '', network: 'nostr' }, on), false);
  // A contact's chat, a group or one brought in from another app: Erevos's own.
  assert.equal(rowOn({ sms: '', network: undefined }, on), false);
  assert.equal(rowOn({ sms: '', network: undefined }, new Set<Module>(['erevos'])), true);
});

test('the first start leaves its steps for once the space is open: kept as given, or nothing', () => {
  const kept = parseSetupAfter(JSON.stringify({ name: 'Anna', modules: ['xmpp', 'erevos', 'fax'], restore: 'wanted', invite: '/welcome?hi=00' }));
  // The modules in their order, only those there are; the invite only as a screen.
  assert.deepEqual(kept, { name: 'Anna', modules: ['erevos', 'xmpp'], restore: 'wanted', invite: '/welcome?hi=00' });
  assert.deepEqual(parseSetupAfter(JSON.stringify({ modules: ['sms'], restore: 'maybe', linkPhone: 'yes', invite: 'https://example.org' })), { name: '', modules: ['sms'] });
  assert.equal(parseSetupAfter(JSON.stringify({ name: '', modules: [], linkPhone: true }))?.linkPhone, true);
  for (const raw of [null, '', 'nope', '[]', '3', 'null']) assert.equal(parseSetupAfter(raw), null, String(raw));
});

test('a screen for each module chosen, in their order, then the lock and the backups, then what is done', () => {
  assert.deepEqual(afterSteps(['collection', 'erevos', 'sms']), [
    { kind: 'module', module: 'erevos' },
    { kind: 'module', module: 'sms' },
    { kind: 'module', module: 'collection' },
    { kind: 'lock' },
    { kind: 'done' },
  ]);
  assert.deepEqual(afterSteps([]), [{ kind: 'lock' }, { kind: 'done' }]);
});

test('each permission is asked on the first screen whose module needs it; later ones show it as given', () => {
  const chosen: Module[] = ['erevos', 'phone', 'matrix', 'collection'];
  // Every module's (notices): on the first. The calls' on Erevos's, not again on Matrix's.
  assert.equal(checkOwner('notices', chosen), 'erevos');
  assert.equal(checkOwner('calls', chosen), 'erevos');
  assert.equal(checkOwner('calls', ['phone', 'matrix']), 'matrix');
  assert.equal(checkOwner('fullScreen', ['phone', 'matrix']), 'phone');
  assert.equal(checkOwner('camera', ['sms', 'collection']), 'collection');
  assert.equal(checkOwner('nearby', ['phone', 'matrix']), null);
  const checks = (['notices', 'calls', 'fullScreen', 'camera', 'contacts', 'nearby'] as const).map((id) => ({ id }));
  const ids = (list: { id: string }[]) => list.map((check) => check.id);
  const erevos = checksAt('erevos', chosen, checks);
  assert.deepEqual(ids(erevos.own), ['notices', 'calls', 'fullScreen', 'camera', 'contacts', 'nearby']);
  assert.deepEqual(erevos.earlier, []);
  const matrix = checksAt('matrix', chosen, checks);
  assert.deepEqual(matrix.own, []);
  // What Matrix needs too, asked before; not Erevos's alone (nearby, contacts).
  assert.deepEqual(ids(matrix.earlier), ['notices', 'calls', 'fullScreen', 'camera']);
  const phone = checksAt('phone', ['phone', 'collection'], checks);
  assert.deepEqual(ids(phone.own), ['notices', 'fullScreen', 'contacts']);
  assert.deepEqual(ids(checksAt('collection', ['phone', 'collection'], checks).own), ['camera']);
  assert.deepEqual(ids(checksAt('collection', ['phone', 'collection'], checks).earlier), ['notices']);
});

test('the plain Erevos has only Erevos, the Phone, the SMS and the Collection; moving to Erevos+ turns the others on', () => {
  assert.deepEqual(editionModules('erevos'), ['erevos', 'phone', 'sms', 'collection']);
  assert.deepEqual(editionModules('plus'), MODULES);
  assert.deepEqual(modulesHere('android', null, false, 'erevos'), ['erevos', 'phone', 'sms', 'collection']);
  assert.deepEqual(modulesHere('web', null, false, 'erevos'), ['erevos', 'collection']);
  assert.deepEqual(modulesHere('ios', null, false, 'erevos'), ['erevos']);
  // A choice made in Erevos+ read in the plain Erevos: only its own modules.
  const LITE_HERE = modulesHere('android', null, false, 'erevos');
  assert.deepEqual([...(parseModules('{"on":["erevos","sms","matrix"],"known":["erevos","phone","sms","nostr","matrix","xmpp","collection"]}', LITE_HERE) ?? [])], ['erevos', 'sms']);
  // A choice made in the plain Erevos (SMS off) read in Erevos+: SMS stays off, the networks it
  // did not have are on.
  const kept = keptModules(['erevos', 'phone', 'collection'], LITE_HERE, 'erevos');
  assert.ok(kept);
  assert.deepEqual([...(parseModules(kept, ANDROID) ?? [])], ['erevos', 'phone', 'nostr', 'matrix', 'xmpp', 'collection']);
  // Only Matrix-like modules chosen in Erevos+ leave nothing usable in the plain Erevos: every one of its own is on.
  assert.equal(parseModules('{"on":["matrix"],"known":["erevos","phone","sms","nostr","matrix","xmpp","collection"]}', LITE_HERE), null);
});
