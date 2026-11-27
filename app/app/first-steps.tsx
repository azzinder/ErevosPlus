// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, BackHandler, Platform, Pressable, TextInput, View } from 'react-native';

import { checkTitle } from '../components/check-card';
import {
  Bolded,
  Dots,
  Emblem,
  FooterLink,
  Glass,
  Gradient,
  Highlighted,
  Icon,
  L,
  MainButton,
  NavRow,
  noOutline,
  Radio,
  Ring,
  StartScreen,
  StartSheet,
  StartToggle,
  GhostButton,
  StatusPill,
  Tile,
  tint,
  useStartLook,
  type IconName,
} from '../components/first-start-look';
import { askInvisible, chooseMode, modeSays, useMode } from '../components/mode-picker';
import { MIN_PASSWORD } from '../components/PasswordSheet';
import { CAN_AUTO_BACKUP } from '../lib/backup-place';
import { canTor } from '../lib/core';
import { findMoves, moveErrorText, takeMove, type FoundMove } from '../lib/edition-move';
import { startSteps, stepAt, TILES, type StartStep, type Tile as TileColour } from '../lib/first-start';
import { CAN_DRIVE } from '../lib/google-drive-ids';
import { t } from '../lib/i18n';
import { MODE_NAMES, MODES, type Mode } from '../lib/modes';
import { modulesHere, type Module } from '../lib/modules';
import { setMyNameAt } from '../lib/my-name';
import { hrefLink, holdLink } from '../lib/open-link';
import { bringsServer } from '../lib/invite-server';
import { takeFirstServer, useFirstServer, wantFirstServer } from '../lib/open-place';
import { allAllowed, askedInApp, countAllowed, nextSettingsScreen, permissionGroups, type GroupId, type PermissionGroup, type RowId } from '../lib/permission-groups';
import type { CheckId } from '../lib/permission-checks';
import { askAll, checksOffered, fix, HAS_CHECKS, makerDone, readChecks } from '../lib/permissions';
import { strengthOf } from '../lib/password-strength';
import { keepSetupAfter, loadSetupAfter, setupAfterDone, type SetupAfter } from '../lib/setup-after';
import { holdReceiver } from '../lib/receiver';
import { spaceGroupsAt } from '../lib/space-groups';
import { updateEditionName } from '../lib/update-channel';
import { BiometricError, turnOnBiometric } from '../lock/biometric';
import { lockWithPassword } from '../lock/config';
import { useLock } from '../lock/context';
import { currentSpace } from '../lock/keys';
import { prepareSpaces } from '../lock/space-data';
import { biometricSealer } from '../modules/erevos-biometric';
import { phoneStatus, requestDefaultPhone } from '../modules/erevos-phone';
import { requestDefaultSms, smsMirrored, smsStatus } from '../modules/erevos-sms';

// The first start's setup, once the first space is open (components/setup.tsx, lib/setup-after.ts,
// lib/first-start.ts), in the first start's look (components/first-start-look.tsx): the name typed
// goes to the space; moving from another phone, the backup is restored first; then How visible are
// you? (the three modes, with the server LPHL gives by itself), every permission in five groups,
// and Keep it safe, the password and the automatic backups. Then Erevos opens on its first home
// (app/index.tsx). On a computer or in a browser linked to the phone, Linked devices opens instead.
// Until done, it shows again at the next start (app/index.tsx).

const WEB = Platform.OS === 'web';

type Roles = { phoneApp: boolean | null; smsApp: boolean | null };

/** Which backup the Keep it safe step chose, for the backups screen to start from. */
type BackupChoice = 'device' | 'webdav' | 'drive';

// The tiles of the groups of permissions.
const GROUP_TILES: Record<GroupId, { tile: TileColour; icon: IconName }> = {
  notices: { tile: 'rose', icon: 'bell' },
  calls: { tile: 'teal', icon: 'phone' },
  messages: { tile: 'blue', icon: 'sms' },
  background: { tile: 'gold', icon: 'bolt' },
  reminders: { tile: 'violet', icon: 'clock' },
};

function groupTitle(id: GroupId): string {
  switch (id) {
    case 'notices':
      return t('Notices');
    case 'calls':
      return t('Calls');
    case 'messages':
      return t('Messages');
    case 'background':
      return t('In the background');
    case 'reminders':
      return t('Reminders');
  }
}

function rowTitle(id: RowId): string {
  return id === 'phoneApp' ? t('Phone app') : id === 'smsApp' ? t('SMS app') : checkTitle(id);
}

// The tile and the colour of each mode.
const MODE_LOOKS: Record<Mode, { tile: TileColour; icon: IconName }> = {
  speed: { tile: 'gold', icon: 'bolt' },
  anonymous: { tile: 'blue', icon: 'mask' },
  invisible: { tile: 'violet', icon: 'ghost' },
};

// `a` with `share` of `b` mixed in, both as #rrggbb.
function mix(a: string, b: string, share: number): string {
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const channel = (shift: number) => Math.round(((x >> shift) & 255) * share + ((y >> shift) & 255) * (1 - share));
  return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, '0')).join('')}`;
}

// A server's host, as the status pill says it.
function hostOf(url: string): string {
  try {
    return new URL(url).host || url;
  } catch {
    return url;
  }
}

// What the roles of Erevos as the phone app and the SMS app are now.
function readRoles(modules: readonly Module[]): Roles {
  const android = Platform.OS === 'android';
  return {
    phoneApp: modules.includes('phone') && android && phoneStatus() !== null ? !!phoneStatus()?.isDefault : null,
    smsApp: modules.includes('sms') && android && smsStatus() !== null && !smsMirrored() ? !!smsStatus()?.isDefault : null,
  };
}

// Resolves when the app is back in the foreground after Android's screen or question that was
// opened: once it left, as it comes back; or after a moment, when nothing took it away.
function comeBack(hold: { release: (() => void) | null }): Promise<void> {
  return new Promise((resolve) => {
    let left = AppState.currentState !== 'active';
    let timer: ReturnType<typeof setTimeout> | null = null;
    const done = () => {
      if (timer) clearTimeout(timer);
      subscription.remove();
      hold.release = null;
      resolve();
    };
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        left = true;
        if (timer) clearTimeout(timer);
      } else if (left) done();
    });
    if (!left) timer = setTimeout(done, 2500);
    hold.release = done;
  });
}

export default function FirstSteps() {
  const look = useStartLook();
  const [after, setAfter] = useState<SetupAfter | null>(null);
  const [at, setAt] = useState(0);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [noBackup, setNoBackup] = useState(false);
  // Another edition on this phone that made a move for this one (lib/edition-move.ts), and how far
  // taking it is, in percent (null while not taking it), or what went wrong.
  const [move, setMove] = useState<FoundMove | null>(null);
  const [taking, setTaking] = useState<number | null>(null);
  const [moveError, setMoveError] = useState('');
  const { closeNow, space, setPasswordLock, passwordLock } = useLock();
  const modules = after?.modules ?? [];
  const key = modules.join(',');
  // How visible: the mode now, the one chosen, and what went wrong choosing it.
  const mode = useMode();
  const [choice, setChoice] = useState<Mode>(mode);
  const [modeNote, setModeNote] = useState('');
  const [busy, setBusy] = useState(false);
  const server = useFirstServer();
  // Allow all: the round it is on (a new one, or leaving, ends it), and what it waits on.
  const round = useRef(0);
  const hold = useRef<{ release: (() => void) | null }>({ release: null });
  const [allowing, setAllowing] = useState(false);
  // Keep it safe.
  const [passwordOn, setPasswordOn] = useState(false);
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [fingerprint, setFingerprint] = useState(true);
  const [locked, setLocked] = useState(false);
  const [backup, setBackup] = useState<BackupChoice | null>(null);
  // Google Drive's warning, over the choice of it.
  const [sheet, setSheet] = useState(false);
  const [warning, setWarning] = useState(false);
  const [error, setError] = useState('');

  // What waits, with the name typed given to the space now that it is open.
  useEffect(() => {
    let active = true;
    void (async () => {
      let found = await loadSetupAfter();
      if (found?.name) {
        await setMyNameAt(spaceGroupsAt, found.name).catch(() => undefined);
        found = { ...found, name: '' };
        await keepSetupAfter(found).catch(() => undefined);
      }
      if (!active) return;
      // These steps ask for what the modules need: the check after a new version need not (lib/permissions.ts).
      if (found) void checksOffered();
      if (!found) {
        router.replace('/');
        return;
      }
      if (found.linkPhone) {
        await setupAfterDone();
        router.replace('/devices');
        return;
      }
      setAfter(found);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (after?.restore !== 'wanted') return;
    let active = true;
    void findMoves().then((found) => active && setMove(found[0] ?? null), () => undefined);
    return () => {
      active = false;
    };
  }, [after?.restore]);

  // The permissions and the roles now, in their groups.
  const load = useCallback(async (): Promise<PermissionGroup[]> => {
    const list = key ? (key.split(',') as Module[]) : [];
    const checks = await readChecks(list).catch(() => []);
    const next = permissionGroups(checks, readRoles(list));
    setGroups(next);
    return next;
  }, [key]);
  const read = useCallback(() => {
    if (key) void load();
  }, [key, load]);

  useEffect(() => {
    read();
    // Back from Android's question or settings, or the browser's: what it allows now.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') read();
    });
    return () => subscription.remove();
  }, [read]);

  // Back from a screen these steps opened: what is allowed now.
  useFocusEffect(read);

  // Leaving the screen ends Allow all.
  useEffect(
    () => () => {
      round.current++;
      hold.current.release?.();
    },
    [],
  );

  // Android's back key goes back a step; on the first, it leaves, and the steps show again at the next start.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (at === 0) return false;
        setAt(at - 1);
        return true;
      });
      return () => subscription.remove();
    }, [at]),
  );

  // Done: Erevos opens, and an invite it was opened with opens over it.
  async function finish(then?: string) {
    const invite = after?.invite;
    await setupAfterDone();
    if (then) router.replace(then as never);
    else if (router.canGoBack()) router.back();
    else router.replace('/');
    if (invite) setTimeout(() => holdLink(hrefLink(invite)), 400);
  }

  // Takes the move: what this space has now (only what these steps made) gives way to it, and
  // Erevos opens again as the other edition was, with its passwords; these steps then go on.
  async function bring(found: FoundMove) {
    setMoveError('');
    setTaking(0);
    const release = await holdReceiver();
    try {
      await takeMove(found, (done, all) => setTaking(Math.floor((done * 100) / Math.max(1, all))));
    } catch (error) {
      setMoveError(moveErrorText(error, updateEditionName(found.from)));
      return;
    } finally {
      setTaking(null);
      release();
    }
    closeNow();
  }

  if (!after) return <StartScreen>{null}</StartScreen>;

  if (after.restore === 'wanted') {
    return (
      <StartScreen
        footer={
          noBackup ? undefined : <FooterLink link={t('I have no backup yet')} onPress={() => setNoBackup(true)} />
        }
      >
        <View style={{ paddingTop: 10, gap: 8 }}>
          <L size={12} weight="800" tone="muted" style={{ letterSpacing: 0.6, textTransform: 'uppercase' }}>
            {t('Moving from another phone')}
          </L>
          <Highlighted text={t('Bring your Erevos here')} size={27} align="left" />
          <L size={14.5} tone="muted" line={21}>
            {t('A backup brings everything over: every space, with its contacts, messages and hidden chats, your name, the modules, and the settings that go with you.')}
          </L>
        </View>
        {move ? (
          <Glass style={{ padding: 14, gap: 8 }}>
            <L size={15} weight="700">
              {t('From {edition} on this phone', { edition: updateEditionName(move.from) })}
            </L>
            <L size={12.5} tone="muted" line={17}>
              {t('{edition} made everything ready for this app, here on the phone. Bring it: Erevos then opens as {edition} was, with its passwords, and these steps go on.', { edition: updateEditionName(move.from) })}
            </L>
            {taking !== null ? (
              <L size={12.5} tone="muted" line={17}>
                {t('Bringing everything here… {percent}%', { percent: taking })}
              </L>
            ) : (
              <MainButton title={t('Bring everything here')} onPress={() => void bring(move)} />
            )}
            {moveError ? (
              <L size={12.5} tone="warn" line={17}>
                {moveError}
              </L>
            ) : null}
          </Glass>
        ) : null}
        <Glass style={{ padding: 14, gap: 8 }}>
          <L size={15} weight="700">
            {t('Restore a backup')}
          </L>
          <L size={12.5} tone="muted" line={17}>
            {t('Under Restore, choose the backup on this phone or on your server, and type its password. Erevos then opens as the old phone was, with its passwords, and these steps go on.')}
          </L>
          <MainButton title={t('Open Backups')} onPress={() => router.push('/backup')} />
        </Glass>
        <L size={12.5} tone="muted" line={17} align="center">
          {t('One phone at a time: after the backup, do not open Erevos on the old phone, and delete it there once new messages come here.')}
        </L>
        {noBackup ? (
          <Glass style={{ padding: 14, gap: 8 }}>
            <L size={13.5} line={19}>
              {t('On the old phone: Settings → Data and devices → Backups → Make a backup. Copy it here with every file whose name starts as its name, all in one folder, then restore it. A backup on your server needs no copying.')}
            </L>
            <MainButton
              title={t('Start without a backup')}
              onPress={() => {
                const next: SetupAfter = { ...after, restore: undefined };
                void keepSetupAfter(next).catch(() => undefined);
                // A new start after all: with Erevos's own chats, the place on LPHL's open server
                // is taken once the mode is chosen, as for anyone new (lib/open-place.ts).
                if (after.modules.includes('erevos') && !bringsServer(after.invite)) void wantFirstServer(currentSpace().space).catch(() => undefined);
                setAfter(next);
              }}
            />
          </Glass>
        ) : null}
      </StartScreen>
    );
  }

  // The steps as the dots count them, the same list components/setup.tsx counts from: the welcome
  // and the modules came before the space opened; those left are here.
  const full = startSteps({ choice: modulesHere().length > 1 && !after.restore, restored: after.restore === 'done', checks: HAS_CHECKS });
  const steps = full.filter((s): s is Exclude<StartStep, 'welcome' | 'modules'> => s !== 'welcome' && s !== 'modules');
  const step = steps[Math.min(at, steps.length - 1)];
  const dots = stepAt(full, step);
  const next = () => setAt(Math.min(at + 1, steps.length - 1));
  const back = at > 0 ? () => setAt(at - 1) : undefined;

  // How visible: INVISIBLE asks first; a choice that is not the space's is kept; then the server
  // LPHL gives is taken, with no waiting for it.
  async function continueMode() {
    if (busy) return;
    setModeNote('');
    if (choice === 'invisible' && mode !== 'invisible' && !(await askInvisible())) return;
    setBusy(true);
    try {
      if (choice !== mode) await chooseMode(choice);
    } catch (error) {
      setModeNote(error instanceof Error ? error.message : String(error));
      setBusy(false);
      return;
    }
    setBusy(false);
    void takeFirstServer();
    next();
  }

  // A row not allowed: Android's question or screen for it.
  function fixRow(id: RowId) {
    if (id === 'phoneApp') return requestDefaultPhone();
    if (id === 'smsApp') return requestDefaultSms();
    void fix(id).then(() => (id === 'maker' ? makerDone(true) : undefined));
  }

  // Allow all, one thing at a time, each next one when the app is back in the foreground: what
  // Android asks in Erevos itself, Erevos as the phone app and the SMS app, then each screen of
  // Android's settings that calls and messages need. It stops when the step is left.
  async function allowAll() {
    if (allowing) return;
    const mine = ++round.current;
    const going = () => round.current === mine;
    setAllowing(true);
    try {
      let now = await load();
      const asked = askedInApp(now);
      await askAll(asked.checks);
      if (!going()) return;
      if (asked.phoneApp) {
        requestDefaultPhone();
        await comeBack(hold.current);
        if (!going()) return;
      }
      if (asked.smsApp) {
        requestDefaultSms();
        await comeBack(hold.current);
        if (!going()) return;
      }
      const opened = new Set<RowId>();
      for (;;) {
        now = await load();
        if (!going()) return;
        const id: CheckId | null = nextSettingsScreen(now, opened);
        if (id === null) break;
        opened.add(id);
        await fix(id);
        if (id === 'maker') await makerDone(true);
        await comeBack(hold.current);
        if (!going()) return;
      }
      await load();
    } finally {
      if (going()) setAllowing(false);
    }
  }

  // Back from Google Drive's warning: it is not chosen any more.
  const goBackFromSheet = () => {
    setSheet(false);
    setBackup(null);
  };

  // Done: the password lock, as Settings turns it on, with the fingerprint or face; then the
  // backups screen, which starts from the choice.
  async function done() {
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      if (passwordOn && !locked) {
        if ([...password].length < MIN_PASSWORD) return setError(t('Use at least {n} characters.', { n: MIN_PASSWORD }));
        if (password !== again) return setError(t('The passwords do not match.'));
        const { key: spaceKey } = currentSpace();
        const other = await lockWithPassword(space, password, spaceKey);
        if (other) return setError(t('Use a different password.'));
        setLocked(true);
        setPasswordLock(true);
        // The spaces second passwords open exist from now on, used or not.
        await prepareSpaces(space + 1);
      }
      if (passwordOn && fingerprint && biometricSealer.available() && !warning) {
        try {
          await turnOnBiometric(biometricSealer, space, password, { title: t('Fingerprint or face for Erevos'), cancel: t('Cancel') });
        } catch (e) {
          if (!(e instanceof BiometricError && e.reason === 'cancelled')) {
            // The lock stays on: the error is shown, and Done goes on from here.
            setWarning(true);
            return setError(e instanceof Error ? e.message : String(e));
          }
        }
      }
      await finish(backup ? `/backup?start=${backup}` : undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (step === 'mode') {
    const status =
      server.kind === 'ready' && !server.lphl
        ? t('Your server is ready · {server}', { server: hostOf(server.url) })
        : server.kind === 'ready'
          ? t('Your server is ready · LPHL, free')
          : server.kind === 'waiting' || server.kind === 'taking'
            ? // Not taken yet: it is once the mode is chosen, and the server may still give none.
              t('LPHL’s server is waiting for you · free')
            : null;
    return (
      <StartScreen
        footer={
          <>
            <NavRow onBack={back}>
              <MainButton title={t('Continue')} disabled={busy} onPress={() => void continueMode()} />
            </NavRow>
            <FooterLink link={t('Another server (for advanced users)')} onPress={() => router.push('/chat?setup=relay')} />
          </>
        }
      >
        <Dots n={dots.n} of={dots.of} />
        <View style={{ alignItems: 'center', gap: 8, paddingTop: 6 }}>
          <Highlighted text={t('How *visible* are you?')} />
          {status ? <StatusPill text={status} /> : null}
        </View>
        <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
          {MODES.map((each) => (
            <ModeCard
              key={each}
              mode={each}
              chosen={choice === each}
              faint={each === 'invisible' && !canTor()}
              onPress={() => {
                setModeNote(each === 'invisible' && !canTor() ? t('INVISIBLE needs Tor, which this device does not have.') : '');
                if (each === 'invisible' && !canTor()) return;
                setChoice(each);
              }}
            />
          ))}
        </View>
        <L size={12.5} tone="muted" line={17} align="center">
          {t('Messages are always encrypted · change it in Settings')}
        </L>
        {modeNote ? (
          <L size={12.5} tone="warn" line={17} align="center">
            {modeNote}
          </L>
        ) : null}
      </StartScreen>
    );
  }

  if (step === 'permissions') {
    const { ok, all: count } = countAllowed(groups);
    return (
      <StartScreen
        footer={
          <>
            <MainButton title={t('Allow all')} disabled={allowing} onPress={() => void allowAll()} />
            <FooterLink link={allAllowed(groups) ? t('Continue') : t('Continue without them')} onPress={next} />
          </>
        }
      >
        <Dots n={dots.n} of={dots.of} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Highlighted text={t('Miss *nothing*')} size={24} align="left" />
            <L size={12.5} tone="muted" line={17}>
              {WEB ? t('Tap “Allow all”. The browser asks for each one.') : t('Tap “Allow all”. Android asks for each one.')}
            </L>
          </View>
          <Ring ok={ok} all={count} />
        </View>
        {groups.map((group) => (
          <PermissionCard key={group.id} group={group} onFix={fixRow} />
        ))}
        <L size={12.5} tone="muted" line={17} align="center" style={{ paddingHorizontal: 10 }}>
          {t('Without them, a call may not ring while Erevos is closed. You will find them in Settings → General → Permissions too.')}
        </L>
      </StartScreen>
    );
  }

  // Keep it safe.
  // A lock this screen did not turn on was there before it: a backup restored brings its own. Then
  // the card only says so, and the fingerprint, which stays with each phone, is set where Settings sets it.
  const lockedBefore = passwordLock && !locked;
  const strength = passwordOn ? strengthOf(password) : null;
  const strengthLook = strength === 'strong' ? { share: 1, color: look.ok, text: t('Strong') } : strength === 'fair' ? { share: 0.66, color: TILES.gold[0], text: t('Fair') } : { share: 0.33, color: look.warn, text: t('Weak') };
  const field = {
    height: 44,
    borderRadius: 16,
    backgroundColor: look.glass,
    borderWidth: 1,
    borderColor: look.line,
    paddingHorizontal: 16,
    fontSize: 15,
    color: look.text,
    paddingVertical: 0,
  } as const;
  const backups: { id: BackupChoice; tile: TileColour; icon: IconName; title: string; line: string; badge?: boolean }[] = [
    { id: 'device', tile: 'teal', icon: 'phoneD', title: t('On this device'), line: t('In a folder you choose') },
    { id: 'webdav', tile: 'blue', icon: 'srv', title: 'WebDAV', line: t('Nextcloud, ownCloud and others') },
    // Only where this app has its client ID of Google's (lib/google-drive-ids.ts): on Android, once given.
    ...(CAN_DRIVE ? [{ id: 'drive' as const, tile: 'green' as const, icon: 'drive' as const, title: 'Google Drive', line: t('Handy, but tied to your account'), badge: true }] : []),
  ];
  return (
    <>
      <StartScreen
        footer={
          <NavRow onBack={back}>
            <MainButton title={t('Done')} disabled={busy} onPress={() => void done()} />
          </NavRow>
        }
      >
        <Dots n={dots.n} of={dots.of} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 }}>
          <Emblem tile="teal" icon="shield" size={52} />
          <View style={{ flex: 1, gap: 2, marginLeft: 6 }}>
            <Highlighted text={t('Keep it *safe*')} size={24} align="left" />
            <L size={12.5} tone="muted" line={17}>
              {t('Optional, but worth it.')}
            </L>
          </View>
        </View>
        {lockedBefore ? (
          <Glass style={{ paddingVertical: 12, paddingHorizontal: 14, gap: 9 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Tile tile="gold" icon="key" />
              <View style={{ flex: 1 }}>
                <L size={15} weight="700">
                  {t('A password for Erevos')}
                </L>
                <L size={12.5} tone="ok" line={17}>
                  {t('On, as on the other phone')}
                </L>
              </View>
              <StartToggle on />
            </View>
            {biometricSealer.available() ? (
              <>
                <L size={12.5} tone="muted" line={17}>
                  {t('The fingerprint or face stays with each phone: turn it on again on this one.')}
                </L>
                <GhostButton title={t('Lock and second password')} height={44} onPress={() => router.push('/security?part=lock')} />
              </>
            ) : null}
          </Glass>
        ) : (
          <Glass style={{ paddingVertical: 12, paddingHorizontal: 14, gap: 9 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Tile tile="gold" icon="key" />
              <View style={{ flex: 1 }}>
                <L size={15} weight="700">
                  {t('A password for Erevos')}
                </L>
              </View>
              <StartToggle on={passwordOn} label={t('A password for Erevos')} onChange={(on) => !locked && setPasswordOn(on)} />
            </View>
            {passwordOn ? (
              <>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!locked}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={t('Password')}
                  placeholderTextColor={look.faint}
                  accessibilityLabel={t('Password')}
                  style={[field, noOutline]}
                />
                <TextInput
                  value={again}
                  onChangeText={setAgain}
                  secureTextEntry
                  editable={!locked}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={t('The password again')}
                  placeholderTextColor={look.faint}
                  accessibilityLabel={t('The password again')}
                  style={[field, noOutline]}
                />
                {strength ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: look.line, overflow: 'hidden' }}>
                      <View style={{ width: `${strengthLook.share * 100}%`, height: 6, backgroundColor: strengthLook.color }} />
                    </View>
                    <L size={12} weight="800" tone={strengthLook.color}>
                      {strengthLook.text}
                    </L>
                  </View>
                ) : null}
                <View style={{ padding: 11, paddingVertical: 9, borderRadius: 14, backgroundColor: tint(look.ok, 0.08), gap: 3 }}>
                  <L size={13} weight="700">
                    {t('For a stronger password')}
                  </L>
                  <Bolded text={`✓ ${t('4 or more random words, such as {example}', { example: `**${t('moon-ladder-orange-7')}**` })}`} size={12.5} />
                  <Bolded text={`✓ ${t('Not a name, a birthday or 1234')}`} size={12.5} />
                  <Bolded text={`✓ ${t('Not the same as the phone’s PIN or another password')}`} size={12.5} />
                  <Bolded text={`✓ ${t('Write it down somewhere safe: if you forget it, it cannot be recovered')}`} size={12.5} />
                </View>
                {biometricSealer.available() ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 2 }}>
                    <View style={{ flex: 1 }}>
                      <L size={14} weight="600">
                        {t('With your fingerprint or face too')}
                      </L>
                    </View>
                    <StartToggle on={fingerprint} label={t('With your fingerprint or face too')} onChange={setFingerprint} />
                  </View>
                ) : null}
              </>
            ) : null}
          </Glass>
        )}
        {CAN_AUTO_BACKUP ? (
          <>
            <L size={12} weight="800" tone="muted" style={{ letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 2 }}>
              {t('Automatic backups · encrypted')}
            </L>
            <View accessibilityRole="radiogroup" style={{ gap: 12 }}>
              {backups.map((each) => (
                <BackupRow
                  key={each.id}
                  {...each}
                  chosen={backup === each.id}
                  onPress={() => {
                    if (backup === each.id) return setBackup(null);
                    setBackup(each.id);
                    // Google Drive says first what signing in with Google tells Google.
                    setSheet(each.id === 'drive');
                  }}
                />
              ))}
            </View>
          </>
        ) : null}
        {error ? (
          <L size={12.5} tone="warn" line={17}>
            {error}
          </L>
        ) : null}
      </StartScreen>
      <StartSheet visible={sheet && backup === 'drive'} onClose={goBackFromSheet}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Tile tile="rose" icon="eye" />
          <View style={{ flex: 1 }}>
            <L size={18} weight="700" line={24}>
              {t('Before you sign in with Google')}
            </L>
          </View>
        </View>
        {(
          [
            ['teal', 'lock', t('The backups leave **encrypted**. Google cannot read them.')],
            ['rose', 'eye', t('But Google **knows who you are**. It sees that you use Erevos, when you make a backup and how big it is, and may hand that over if asked.')],
            // In INVISIBLE, that signing in is in the browser, outside Tor.
            ...(mode === 'invisible' ? [['violet', 'ghost', t('This space is INVISIBLE, but signing in happens **in your browser, outside Erevos**, not through Tor: Google sees your internet address then.')] as const] : []),
            ['blue', 'srv', t('For more privacy, choose **this device** or **WebDAV**.')],
          ] as const
        ).map(([tile, icon, text]) => (
          <View key={icon} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <Tile tile={tile} icon={icon} size={30} radius={10} iconSize={15} />
            <View style={{ flex: 1 }}>
              <Bolded text={text} />
            </View>
          </View>
        ))}
        {/* Drive stays chosen: the backups screen goes on to sign in. */}
        <MainButton title={t('I understand, sign in with Google')} onPress={() => setSheet(false)} />
        <GhostButton title={t('Back')} onPress={goBackFromSheet} />
      </StartSheet>
    </>
  );
}

// Who sees the address, in a mark: warn where they do, ok and struck through where they do not.
function Sees({ who, sees }: { who: string; sees: boolean }) {
  const look = useStartLook();
  const color = sees ? look.warn : look.ok;
  return (
    <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, backgroundColor: tint(color, 0.14) }}>
      <L size={10.5} weight="700" tone={color} line={14} style={{ textDecorationLine: sees ? 'none' : 'line-through' }}>
        {who}
      </L>
    </View>
  );
}

// One mode, as a card to choose: its name, who sees the address, and how calls go; faint where it
// cannot be had here (INVISIBLE where this build has no Tor).
function ModeCard({ mode, chosen, faint, onPress }: { mode: Mode; chosen: boolean; faint: boolean; onPress: () => void }) {
  const look = useStartLook();
  const says = modeSays[mode];
  const { tile, icon } = MODE_LOOKS[mode];
  const a = TILES[tile][0];
  const name = MODE_NAMES[mode];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: chosen }}
      accessibilityLabel={`${name}. ${t(says.line)} ${t(says.calls)}`}
      style={({ pressed }) => ({ opacity: (faint ? 0.5 : 1) * (pressed ? 0.8 : 1) })}
    >
      <View
        style={{
          borderRadius: 22,
          borderWidth: chosen ? 1.5 : 1,
          borderColor: chosen ? a : look.line,
          backgroundColor: look.glass,
          overflow: 'hidden',
          boxShadow: chosen ? `0px 10px 30px -12px ${a}` : undefined,
        }}
      >
        {chosen ? <Gradient from={tint(a, 0.22)} to={look.glass} /> : null}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 }}>
          <Tile tile={tile} icon={icon} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <L size={15} weight="800" style={{ letterSpacing: 1.4 }}>
                {name}
              </L>
              <Radio on={chosen} color={a} />
            </View>
            <L size={12.5} tone="muted" line={17} style={{ marginTop: 3 }}>
              {t(says.line)}
            </L>
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Sees who={t('server')} sees={says.server} />
              <Sees who={t('contacts')} sees={says.contacts} />
            </View>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, backgroundColor: tint(a, 0.18) }}
            >
              <Icon name={mode === 'invisible' ? 'x' : 'phone'} size={12} color={mix(a, look.text, 0.7)} />
              <L size={11.5} weight="700" tone={mix(a, look.text, 0.7)} line={16}>
                {t(says.calls)}
              </L>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// A group of permissions: its tile and title with how many are allowed, and its rows, each with its mark.
function PermissionCard({ group, onFix }: { group: PermissionGroup; onFix: (id: RowId) => void }) {
  const look = useStartLook();
  const { tile, icon } = GROUP_TILES[group.id];
  const ok = group.rows.filter((row) => row.state === 'ok').length;
  return (
    <Glass style={{ paddingVertical: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10, paddingBottom: 6, paddingHorizontal: 14 }}>
        <Tile tile={tile} icon={icon} size={28} radius={9} iconSize={15} />
        <View style={{ flex: 1 }} accessibilityRole="header">
          <L size={13.5} weight="700">
            {groupTitle(group.id)}
          </L>
        </View>
        <L size={12} weight="700" tone="faint">{`${ok}/${group.rows.length}`}</L>
      </View>
      {group.rows.map((row) => {
        const title = rowTitle(row.id);
        const allowed = row.state === 'ok';
        return (
          <Pressable
            key={row.id}
            onPress={() => onFix(row.id)}
            disabled={allowed}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityState={{ disabled: allowed, checked: allowed }}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, paddingLeft: 52, paddingRight: 14, opacity: pressed ? 0.7 : 1 })}
          >
            <View style={{ flex: 1 }}>
              <L size={13.5} line={19}>
                {title}
              </L>
            </View>
            {allowed ? (
              <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: tint(look.ok, 0.25) }}>
                <Icon name="check" size={12} color={look.ok} />
              </View>
            ) : row.state === 'yours' || row.state === 'note' ? (
              <View style={{ height: 22, paddingHorizontal: 7, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: look.glassStrong }}>
                <L size={10} weight="800" tone="muted" line={14}>
                  {t('Open')}
                </L>
              </View>
            ) : (
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: look.line }} />
            )}
          </Pressable>
        );
      })}
    </Glass>
  );
}

// One place for the automatic backups: its tile, name and line, the Google badge where it is tied to an account.
function BackupRow({ tile, icon, title, line, badge, chosen, onPress }: { tile: TileColour; icon: IconName; title: string; line: string; badge?: boolean; chosen: boolean; onPress: () => void }) {
  const look = useStartLook();
  const a = TILES[tile][0];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: chosen }}
      accessibilityLabel={`${title}. ${line}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
    >
      <View style={{ borderRadius: 20, borderWidth: chosen ? 1.5 : 1, borderColor: chosen ? a : look.line, backgroundColor: look.glass, overflow: 'hidden' }}>
        {chosen ? <Gradient from={tint(a, 0.2)} to={look.glass} /> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 }}>
          <Tile tile={tile} icon={icon} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <L size={15} weight="700">
                {title}
              </L>
              {badge ? (
                <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7, backgroundColor: tint(look.warn, 0.15) }}>
                  <L size={11} weight="800" tone="warn" line={15}>
                    {'⚠ Google'}
                  </L>
                </View>
              ) : null}
            </View>
            <L size={12.5} tone="muted" line={17}>
              {line}
            </L>
          </View>
          <Radio on={chosen} color={a} />
        </View>
      </View>
    </Pressable>
  );
}
