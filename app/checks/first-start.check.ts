// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The first start's screens as they are wired (components/setup.tsx, app/first-steps.tsx,
// components/first-home.tsx), read from their source: the mode step keeps the choice and takes
// the server, Done turns the lock on as Settings does and goes on to the backups, Allow all asks in
// the order lib/permission-groups.ts says, and the home screen's first card opens New chat near.
// The steps and colours themselves are checked in checks/first-start-logic.check.ts.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const read = (file: string) => readFileSync(join(import.meta.dirname, '..', file), 'utf8');
const steps = read('app/first-steps.tsx');
const setup = read('components/setup.tsx');

// The text of `source` from the first `from` up to the next `to`.
function between(source: string, from: string, to: string): string {
  const start = source.indexOf(from);
  assert.ok(start >= 0, from);
  const end = source.indexOf(to, start + from.length);
  assert.ok(end > start, to);
  return source.slice(start, end);
}

test('both halves of the first start count the same steps for their dots', () => {
  assert.ok(setup.includes("startSteps({ choice: !single, restored: false, checks: HAS_CHECKS })"));
  assert.ok(setup.includes("stepAt(steps, 'modules')"));
  assert.ok(steps.includes("startSteps({ choice: modulesHere().length > 1 && !after.restore, restored: after.restore === 'done', checks: HAS_CHECKS })"));
  assert.ok(steps.includes('stepAt(full, step)'));
  // The welcome has no dots; the modules step has.
  const welcome = between(setup, "if (step === 'welcome') {", 'const row = ');
  assert.ok(!welcome.includes('<Dots'));
  assert.ok(setup.includes('<Dots n={at.n} of={at.of} />'));
});

test('the modules step starts the four main ones on and the other networks off, and needs one with chats', () => {
  assert.ok(setup.includes("const MAIN: readonly Module[] = ['erevos', 'phone', 'sms', 'collection'];"));
  assert.ok(setup.includes('new Set(here.filter((m) => MAIN.includes(m)))'));
  assert.ok(setup.includes("t('Other networks')"));
  assert.ok(setup.includes('disabled={nothing}'));
  assert.ok(setup.includes('const single = here.length === 1;'));
});

test('Continue on the mode step keeps the choice, then takes the server without waiting for it', () => {
  const go = between(steps, 'async function continueMode()', '// A row not allowed');
  const asked = go.indexOf('askInvisible()');
  const chose = go.indexOf('await chooseMode(choice)');
  const took = go.indexOf('void takeFirstServer()');
  const onward = go.indexOf('next()');
  assert.ok(asked > 0 && chose > asked && took > chose && onward > took, `${asked} ${chose} ${took} ${onward}`);
  assert.ok(!go.includes('await takeFirstServer'));
  // A mode that could not be kept stays on the step with its error.
  assert.ok(go.includes('setModeNote(') && go.includes('return;'));
  // INVISIBLE is not chosen where there is no Tor.
  assert.ok(steps.includes('faint={each === \'invisible\' && !canTor()}'));
  assert.ok(steps.includes("router.push('/chat?setup=relay')"));
});

test('Done turns the lock on as Settings does, then the fingerprint, then goes to the backups with the choice', () => {
  const done = between(steps, 'async function done()', "if (step === 'mode')");
  const lock = done.indexOf('lockWithPassword(space, password, spaceKey)');
  const on = done.indexOf('setPasswordLock(true)');
  const prepared = done.indexOf('prepareSpaces(space + 1)');
  const finger = done.indexOf('turnOnBiometric(biometricSealer, space, password');
  const gone = done.indexOf("finish(backup ? `/backup?start=${backup}` : undefined)");
  assert.ok(lock > 0 && on > lock && prepared > on && finger > prepared && gone > finger, `${lock} ${on} ${prepared} ${finger} ${gone}`);
  assert.ok(done.includes('MIN_PASSWORD') && done.includes("t('The passwords do not match.')"));
  assert.ok(done.includes("e.reason === 'cancelled'"));
  // The same calls as Settings' last branch for a space not locked yet.
  const security = read('app/security.tsx');
  assert.ok(security.includes('const other = await lockWithPassword(space, password, key);') && security.includes('await prepareSpaces(space + 1);'));
  // Google Drive asks first, and Back from the warning leaves it unchosen.
  assert.ok(steps.includes("setSheet(each.id === 'drive')"));
  assert.ok(steps.includes('const goBackFromSheet = () => {'));
});

test('Allow all asks in Erevos first, then the default apps, then each screen of settings in turn', () => {
  const all = between(steps, 'async function allowAll()', '// Done: the password lock');
  const asked = all.indexOf('await askAll(asked.checks)');
  const phone = all.indexOf('requestDefaultPhone()');
  const sms = all.indexOf('requestDefaultSms()');
  const screens = all.indexOf('nextSettingsScreen(now, opened)');
  assert.ok(all.includes('askedInApp(now)'));
  assert.ok(asked > 0 && phone > asked && sms > phone && screens > sms, `${asked} ${phone} ${sms} ${screens}`);
  // Each next one when the app is back in the foreground, and the round ends when the step is left.
  assert.ok(all.includes('await comeBack(hold.current)') && all.includes('going()'));
  assert.ok(steps.includes('round.current++;'));
  // The roles are read as the default-apps cards read them.
  assert.ok(steps.includes('smsStatus() !== null && !smsMirrored()'));
});

test('the first home offers near and far, and the first card opens New chat on Near me', () => {
  const home = read('components/first-home.tsx');
  assert.ok(home.includes("router.push('/chat?setup=near')") && home.includes("router.push('/chat?setup=invite')"));
  assert.ok(home.includes("router.push('/chat?setup=relay')") && home.includes('void takeFirstServer()'));
  assert.ok(home.includes("router.push('/permissions')"));
  const index = read('app/index.tsx');
  assert.ok(index.includes("erevosOn && linkedRole() !== 'linked' ? ("));
  assert.ok(index.includes('<FirstHome />'));
  const chat = read('app/chat.tsx');
  assert.ok(chat.includes("nearNow={setup === 'near'}"));
  assert.ok(chat.includes("codeNow ? 'code' : nearNow ? 'near' : 'root'"));
  assert.ok(chat.includes('inviteNow || codeNow || nearNow)'));
});

test("LPHL's open server is wanted for a new start unless the invite brings a server, tried again once the steps are done, and offered on the first home", () => {
  const layout = read('app/_layout.tsx');
  assert.ok(layout.includes("if (modules.includes('erevos') && !restore && !linkPhone && !bringsServer(invite)) await wantFirstServer(0)"));
  // At each opening of a space, after the steps (lib/open-place.ts waits for them itself).
  const opened = between(layout, 'collectionServerOpened();', 'cameraFollows(passwordLock);');
  assert.ok(opened.includes('void retryFirstServer().catch(() => undefined);'));
  // Start without a backup, after choosing to move from another phone, is a new start too.
  const fresh = between(steps, "title={t('Start without a backup')}", 'setAfter(next);');
  assert.ok(fresh.includes("if (after.modules.includes('erevos') && !bringsServer(after.invite)) void wantFirstServer(currentSpace().space)"));
  // The first home: read again on each return, offered where a space has none, and its line on top follows.
  const home = read('components/first-home.tsx');
  assert.ok(home.includes('void readFirstServer().catch(() => undefined);'));
  assert.ok(home.includes("onPress={() => void askFirstServer().catch(() => undefined)}"));
  const index = read('app/index.tsx');
  assert.ok(index.includes('const stopServer = onFirstServer(() => {'));
  // The place's own queue is one that Forget me gathers (checks/forget-me.check.ts).
  assert.ok(read('lib/server-queues.ts').includes("'lib/open-place.ts': ['own'],"));
  // It is taken with the relay's OPEN (lib/relay.ts, checks/open-place.check.ts), its refusals told apart,
  // and a failure is said in plain words, with no error of the network's.
  const place = read('lib/open-place.ts');
  assert.ok(place.includes('({ token } = await takeOpenPlace(LPHL_RELAY));') && place.includes('const why = openPlaceRefusal(error);'));
  assert.ok(!place.includes('setOpenTaker'));
  assert.ok(home.includes("t('Erevos could not reach it now. It tries again by itself each time Erevos opens.')") && !home.includes('server.error'));
});

test("LPHL's place is promised only once taken, a home with no server warns first, and a free place says its day's limits", () => {
  // The mode step: ready only once it is; waiting until then, as the server may still give none.
  const mode = between(steps, "if (step === 'mode') {", 'return (');
  assert.ok(mode.includes("server.kind === 'ready'\n          ? t('Your server is ready · LPHL, free')"));
  assert.ok(mode.includes("server.kind === 'waiting' || server.kind === 'taking'") && mode.includes("t('LPHL’s server is waiting for you · free')"));
  // The first home: the dot warns with no server, and what to do about it comes above the two ways.
  const home = read('components/first-home.tsx');
  assert.ok(home.includes("const served = server.kind === 'ready' || server.kind === 'waiting' || server.kind === 'taking';"));
  assert.ok(home.includes('backgroundColor: served ? colors.success : colors.warning'));
  const doors = home.indexOf("title={t('They are beside me')}");
  assert.ok(home.indexOf("{server.kind === 'none' ? (") < doors && home.indexOf("{server.kind === 'refused' || server.kind === 'failed' ? (") < doors);
  // Under the two ways, a free place's limits for a day: LPHL's as they are set, another's in general.
  assert.ok(home.indexOf("{server.kind === 'ready' && server.open ? (") > doors);
  assert.ok(home.includes("t('Free on LPHL’s server: up to 20 new contacts, 50 MB of files and 30 calls through it each day.')"));
  // The place is kept as a free one, and known as such only for the token it was given with.
  const place = read('lib/open-place.ts');
  assert.ok(place.includes('ownToken: { ...ownToken(LPHL_RELAY, token), open: true }'));
  assert.ok(place.includes("if (!url || !data.token.trim() || data.ownToken.open !== true) return false;"));
  // A free place's day used is said in plain words, and what was sent goes again later.
  const relay = read('lib/relay.ts');
  assert.ok(relay.includes("if (reply[0] === DAY_FULL) throw new RelayError(t('{what}: your free place on this server has used all it may today. It goes on tomorrow.', { what }), DAY_FULL);"));
  assert.ok(relay.includes("if (reply[0] === DAY_FULL) throw new RelayError(t('{what}: your free place on this server has moved all the files it may today. Files go again tomorrow.', { what }), DAY_FULL);"));
  assert.ok(relay.includes('error.status === UNREACHABLE || error.status === DAY_FULL);'));
});

test('on the web, the icons in the tiles are drawn over their gradient and the highlighted words keep the title size', () => {
  const look = read('components/first-start-look.tsx');
  const tile = between(look, 'export function Tile(', '\n}\n');
  assert.ok(tile.indexOf('<Gradient') < tile.indexOf('<View>') && tile.indexOf('<View>') < tile.indexOf('<Icon'));
  const title = between(look, 'export function Highlighted(', '\n}\n');
  assert.ok(title.includes('style={own}'));
  const bold = between(look, 'export function Bolded(', '\n}\n');
  assert.ok(bold.includes("style={{ ...own, fontWeight: '700' }}"));
});

test('after a restore the lock the backup brought shows as on, and the fingerprint is set where Settings sets it', () => {
  assert.ok(steps.includes('const lockedBefore = passwordLock && !locked;'));
  const card = between(steps, '{lockedBefore ? (', ') : (');
  assert.ok(card.includes("t('On, as on the other phone')") && card.includes("router.push('/security?part=lock')"));
  assert.ok(!card.includes('<TextInput'));
  // Done sets a lock only from the fields, so one already on is left as it is.
  const done = between(steps, 'async function done()', "if (step === 'mode')");
  assert.ok(done.includes('if (passwordOn && !locked) {'));
});
