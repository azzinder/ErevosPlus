// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, BackHandler, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckCard, checkTitle } from '../components/check-card';
import { DefaultAppCards } from '../components/default-apps';
import { moduleAbout, moduleName } from '../components/module-texts';
import { Button, Card, Page, Row, SectionTitle, Text, TextButton } from '../components/ui';
import { loadCloudBackup } from '../lib/backup-cloud';
import { loadAutoBackup } from '../lib/backup-folder';
import { backgroundState } from '../lib/background';
import { findMoves, takeMove, type FoundMove } from '../lib/edition-move';
import { plural, t } from '../lib/i18n';
import type { Module } from '../lib/modules';
import { myNameAt, setMyNameAt } from '../lib/my-name';
import { hrefLink, holdLink } from '../lib/open-link';
import { lacking, makerOf, type Check } from '../lib/permission-checks';
import { ASKS_ALL, askAll, checksOffered, readChecks } from '../lib/permissions';
import { afterSteps, checksAt, keepSetupAfter, loadSetupAfter, setupAfterDone, type SetupAfter } from '../lib/setup-after';
import { holdReceiver } from '../lib/receiver';
import { spaceGroupsAt } from '../lib/space-groups';
import { updateEditionName } from '../lib/update-channel';
import { isPasswordLocked, loadLockConfig } from '../lock/config';
import { useLock } from '../lock/context';
import { biometricSealer } from '../modules/erevos-biometric';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';

// The first start's setup, once the first space is open (components/setup.tsx, lib/setup-after.ts):
// the name typed goes to the space; moving from another phone, the backup is restored first; then
// a screen for each module chosen, with what it is, how to begin with it, and what Android (or the
// browser) should allow for it, each permission on the first screen that needs it; then the
// password lock and the backups; then what is ready and what is missing. Any step can be put off:
// all of it is in Settings too. On a computer or in a browser linked to the phone, Linked devices
// opens instead. Until done or put off, it shows again at the next start (app/index.tsx).

const WEB = Platform.OS === 'web';

/** Where each module with an account of its own is set up. */
const SET_UP: Partial<Record<Module, string>> = { nostr: '/nostr-chats', matrix: '/matrix', xmpp: '/xmpp' };

export default function FirstSteps() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [after, setAfter] = useState<SetupAfter | null>(null);
  const [at, setAt] = useState(0);
  const [checks, setChecks] = useState<Check[]>([]);
  const [noBackup, setNoBackup] = useState(false);
  // Another edition on this phone that made a move for this one (lib/edition-move.ts), and how far
  // taking it is, in percent (null while not taking it), or what went wrong.
  const [move, setMove] = useState<FoundMove | null>(null);
  const [taking, setTaking] = useState<number | null>(null);
  const [moveError, setMoveError] = useState('');
  const { closeNow } = useLock();
  const maker = makerOf(backgroundState()?.maker);
  const modules = after?.modules ?? [];
  const key = modules.join(',');

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

  const read = useCallback(() => {
    if (!key) return;
    void readChecks(key.split(',') as Module[])
      .then(setChecks)
      .catch(() => setChecks([]));
  }, [key]);

  useEffect(() => {
    read();
    // Back from Android's question or settings, or the browser's: what it allows now.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') read();
    });
    return () => subscription.remove();
  }, [read]);

  // Back from a screen these steps opened (Permissions, Default apps…): what is allowed now.
  useFocusEffect(read);

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

  if (!after) return <View style={{ flex: 1, backgroundColor: colors.ground }} />;

  // Done, or put off: Erevos opens, and an invite it was opened with opens over it.
  async function finish(then?: string) {
    const invite = after?.invite;
    await setupAfterDone();
    if (then) router.replace(then as never);
    else if (router.canGoBack()) router.back();
    else router.replace('/');
    if (invite) setTimeout(() => holdLink(hrefLink(invite)), 400);
  }

  const top = { paddingTop: insets.top + space.xl };

  // Takes the move: what this space has now (only what these steps made) gives way to it, and
  // Erevos opens again as the other edition was, with its passwords; these steps then go on.
  async function bring(found: FoundMove) {
    setMoveError('');
    setTaking(0);
    const release = await holdReceiver();
    try {
      await takeMove(found, (done, all) => setTaking(Math.floor((done * 100) / Math.max(1, all))));
    } catch (error) {
      setMoveError(t('It could not be brought: {error}. Backups does the same by hand: make one in {edition}, then restore it here.', { error: error instanceof Error ? error.message : String(error), edition: updateEditionName(found.from) }));
      return;
    } finally {
      setTaking(null);
      release();
    }
    closeNow();
  }

  if (after.restore === 'wanted') {
    return (
      <Page style={top}>
        <Text variant="overline" tone="muted">
          {t('Moving from another phone')}
        </Text>
        <Text variant="title">{t('Bring your Erevos here')}</Text>
        <Text tone="muted" style={hint}>
          {t('A backup brings everything over: every space, with its contacts, messages and hidden chats, your name, the modules, and the settings that go with you.')}
        </Text>
        {move ? (
          <Card>
            <Text variant="bodyStrong">{t('From {edition} on this phone', { edition: updateEditionName(move.from) })}</Text>
            <Text variant="caption" tone="muted" style={hint}>
              {t('{edition} made everything ready for this app, here on the phone. Bring it: Erevos then opens as {edition} was, with its passwords, and these steps go on.', { edition: updateEditionName(move.from) })}
            </Text>
            {taking !== null ? (
              <Text variant="caption" tone="muted" style={hint}>
                {t('Bringing everything here… {percent}%', { percent: taking })}
              </Text>
            ) : (
              <Row wrap>
                <Button title={t('Bring everything here')} onPress={() => void bring(move)} />
              </Row>
            )}
            {moveError ? (
              <Text variant="caption" color={colors.danger} style={hint}>
                {moveError}
              </Text>
            ) : null}
          </Card>
        ) : null}
        <Card>
          <Text variant="bodyStrong">{t('Restore a backup')}</Text>
          <Text variant="caption" tone="muted" style={hint}>
            {t('Under Restore, choose the backup on this phone or on your server, and type its password. Erevos then opens as the old phone was, with its passwords, and these steps go on.')}
          </Text>
          <Row wrap>
            <Button title={t('Open Backups')} onPress={() => router.push('/backup')} />
          </Row>
        </Card>
        <Text variant="caption" tone="muted" style={hint}>
          {t('One phone at a time: after the backup, do not open Erevos on the old phone, and delete it there once new messages come here.')}
        </Text>
        {noBackup ? (
          <Card>
            <Text style={hint}>
              {t('On the old phone: Settings → Data and devices → Backups → Make a backup. Copy it here with every file whose name starts as its name, all in one folder, then restore it. A backup on your server needs no copying.')}
            </Text>
            <Row wrap>
              <Button
                title={t('Start without a backup')}
                kind="secondary"
                compact
                onPress={() => {
                  const next: SetupAfter = { ...after, restore: undefined };
                  void keepSetupAfter(next).catch(() => undefined);
                  setAfter(next);
                }}
              />
            </Row>
          </Card>
        ) : (
          <TextButton title={t('I have no backup yet')} onPress={() => setNoBackup(true)} />
        )}
      </Page>
    );
  }

  const steps = afterSteps(modules);
  const step = steps[Math.min(at, steps.length - 1)];
  // The two steps before the space opened, unless the backup brought their choice.
  const before = after.restore ? 0 : 2;
  const next = () => setAt(Math.min(at + 1, steps.length - 1));

  return (
    <Page style={top}>
      <Text variant="overline" tone="muted">
        {t('Setting up Erevos · step {n} of {m}', { n: before + at + 1, m: before + steps.length })}
      </Text>
      {step.kind === 'module' ? (
        <ModuleStep module={step.module} modules={modules} checks={checks} maker={maker} onChanged={read} />
      ) : step.kind === 'lock' ? (
        <LockStep restored={after.restore === 'done'} />
      ) : (
        <DoneStep modules={modules} checks={checks} onInvite={() => void finish('/chat?setup=invite')} />
      )}
      <Row style={{ justifyContent: 'space-between', marginTop: space.md }}>
        {at > 0 ? <Button title={t('Back')} kind="ghost" compact onPress={() => setAt(at - 1)} /> : <View />}
        {step.kind === 'done' ? <Button title={t('Open Erevos')} onPress={() => void finish()} /> : <Button title={t('Next')} onPress={next} />}
      </Row>
      {step.kind !== 'done' ? (
        <View style={{ alignItems: 'center', marginTop: space.sm }}>
          <TextButton title={t('Do the rest later')} onPress={() => void finish()} />
        </View>
      ) : null}
    </Page>
  );
}

// A module's screen: what it is, how to begin with it, and what it needs allowed.
function ModuleStep({ module, modules, checks, maker, onChanged }: { module: Module; modules: Module[]; checks: Check[]; maker: ReturnType<typeof makerOf>; onChanged: () => void }) {
  const { own, earlier } = checksAt(module, modules, checks);
  const needed = own.filter((check) => check.needed);
  const others = own.filter((check) => !check.needed);
  // What Android asks in Erevos itself, still to allow: asked one after another with one tap.
  const askable = own.filter((check) => check.state !== 'ok' && ASKS_ALL.has(check.id));
  const already = earlier.filter((check) => check.needed && check.state === 'ok');
  const still = earlier.filter(lacking);
  const route = SET_UP[module];
  return (
    <>
      <Text variant="title">{moduleName(module)}</Text>
      <Text tone="muted" style={hint}>
        {moduleAbout(module)}
      </Text>
      {module === 'erevos' ? (
        <>
          <SectionTitle title={t('How you join')} />
          <Card>
            <Text variant="bodyStrong">{t('I have an invite')}</Text>
            <Text variant="caption" tone="muted" style={hint}>
              {t('Scan its QR code, or open or paste the link they sent you.')}
            </Text>
            <Row wrap>
              <Button title={t('Open')} kind="secondary" compact onPress={() => router.push('/chat?setup=1')} />
            </Row>
          </Card>
          <Card>
            <Text variant="bodyStrong">{t('Other ways in')}</Text>
            <Text variant="caption" tone="muted" style={hint}>
              {t('Sign in with LPHL, start without a relay, or use a relay of your own: under For advanced users.')}
            </Text>
            <Row wrap>
              <Button title={t('Open')} kind="secondary" compact onPress={() => router.push('/chat?setup=relay')} />
            </Row>
          </Card>
        </>
      ) : null}
      {module === 'phone' || module === 'sms' ? <DefaultAppCards modules={[module]} /> : null}
      {route ? (
        <Card>
          <Text variant="caption" tone="muted" style={hint}>
            {t('Your account there: set it up now, or later from {module}.', { module: moduleName(module) })}
          </Text>
          <Row wrap>
            <Button title={t('Set up {module}', { module: moduleName(module) })} kind="secondary" compact onPress={() => router.push(route as never)} />
          </Row>
        </Card>
      ) : null}
      {own.length || earlier.length ? <SectionTitle title={WEB ? t('What the browser should allow') : t('What Android should allow')} /> : null}
      {askable.length > 1 ? (
        <Row wrap>
          <Button title={t('Allow all, one by one')} onPress={() => void askAll(askable.map((check) => check.id)).then(onChanged)} />
        </Row>
      ) : null}
      {needed.map((check) => (
        <CheckCard key={check.id} check={check} maker={maker} onChanged={onChanged} />
      ))}
      {others.length ? <SectionTitle title={t('Optional')} /> : null}
      {others.map((check) => (
        <CheckCard key={check.id} check={check} maker={maker} onChanged={onChanged} />
      ))}
      {already.length ? (
        <Text variant="caption" tone="muted" style={hint}>
          {t('Allowed already, on a screen before: {list}', { list: already.map((check) => checkTitle(check.id)).join(', ') })}
        </Text>
      ) : null}
      {still.length ? (
        <Text variant="caption" style={hint}>
          {t('Still missing, from a screen before: {list}', { list: still.map((check) => checkTitle(check.id)).join(', ') })}
        </Text>
      ) : null}
    </>
  );
}

// Whether a password locks Erevos, and whether automatic backups are on, read again on coming back.
function useLockAndBackups(): { locked: boolean; backups: boolean } | null {
  const [state, setState] = useState<{ locked: boolean; backups: boolean } | null>(null);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void Promise.all([
        loadLockConfig().then(isPasswordLocked, () => false),
        loadAutoBackup().catch(() => null),
        loadCloudBackup().catch(() => null),
      ]).then(([locked, auto, cloud]) => {
        if (active) setState({ locked, backups: auto !== null || cloud !== null });
      });
      return () => {
        active = false;
      };
    }, []),
  );
  return state;
}

// The password lock, with the fingerprint or face, and the automatic backups.
function LockStep({ restored }: { restored: boolean }) {
  const colors = useColors();
  const state = useLockAndBackups();
  const status = (on: boolean | undefined) =>
    on === undefined ? null : (
      <Text variant="label" color={on ? colors.success : colors.textMuted}>
        {on ? t('On') : t('Off')}
      </Text>
    );
  return (
    <>
      <Text variant="title">{t('Lock and backups')}</Text>
      <Text tone="muted" style={hint}>
        {restored && biometricSealer.available()
          ? t('The fingerprint or face and the folder of automatic backups stay with each phone: set them again here.')
          : t('Both are optional, and both are worth it.')}
      </Text>
      <Card>
        <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text variant="bodyStrong" style={{ flexShrink: 1 }}>
            {t('A password for Erevos')}
          </Text>
          {status(state?.locked)}
        </Row>
        <Text variant="caption" tone="muted" style={hint}>
          {biometricSealer.available()
            ? t('Without one, whoever unlocks your phone opens Erevos too. A fingerprint or face can unlock it as well.')
            : t('Without one, whoever opens this device opens Erevos too.')}
        </Text>
        <Row wrap>
          <Button title={t('Lock and second password')} kind="secondary" compact onPress={() => router.push('/security?part=lock')} />
        </Row>
      </Card>
      <Card>
        <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text variant="bodyStrong" style={{ flexShrink: 1 }}>
            {t('Automatic backups')}
          </Text>
          {status(state?.backups)}
        </Row>
        <Text variant="caption" tone="muted" style={hint}>
          {t('Encrypted, in a folder on this device or on your server. If the phone is lost, they bring back your chats, contacts and settings.')}
        </Text>
        <Row wrap>
          <Button title={t('Open Backups')} kind="secondary" compact onPress={() => router.push('/backup')} />
        </Row>
      </Card>
    </>
  );
}

// What is ready and what is missing, and the first person to invite.
function DoneStep({ modules, checks, onInvite }: { modules: Module[]; checks: Check[]; onInvite: () => void }) {
  const colors = useColors();
  const state = useLockAndBackups();
  const [name, setName] = useState('');
  useEffect(() => {
    void myNameAt(spaceGroupsAt)
      .then(setName)
      .catch(() => undefined);
  }, []);
  const rows = modules.map((module) => ({ module, missing: checksAt(module, modules, checks).own.filter(lacking) }));
  const missing = rows.reduce((sum, row) => sum + row.missing.length, 0);
  const title = name ? (missing ? t('Almost ready, {name}', { name }) : t('Ready, {name}', { name })) : missing ? t('Almost ready') : t('Ready');
  return (
    <>
      <Text variant="title">{title}</Text>
      <Text tone="muted" style={hint}>
        {t('All of it can be changed any time in Settings.')}
      </Text>
      <Card>
        {rows.map(({ module, missing: lack }) => (
          <View key={module} style={{ gap: 2 }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text variant="bodyStrong">{moduleName(module)}</Text>
              <Text variant="label" color={lack.length ? colors.danger : colors.success}>
                {lack.length ? plural(lack.length, '{n} is missing', '{n} are missing') : t('Ready')}
              </Text>
            </Row>
            {lack.length ? (
              <Text variant="caption" tone="muted" style={hint}>
                {lack.map((check) => checkTitle(check.id)).join(', ')}
              </Text>
            ) : null}
          </View>
        ))}
        {state ? (
          <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text variant="bodyStrong">{t('Lock and backups')}</Text>
            <Text variant="label" color={state.locked && state.backups ? colors.success : colors.textMuted}>
              {state.locked && state.backups ? t('Ready') : state.locked || state.backups ? t('One of the two') : t('Not set')}
            </Text>
          </Row>
        ) : null}
      </Card>
      {missing ? (
        <>
          <Text variant="caption" tone="muted" style={hint}>
            {t('Without them, a call may not ring, or messages may not come, while Erevos is closed. They are also under Settings → General → Permissions.')}
          </Text>
          <Row wrap>
            <Button title={t('Permissions')} kind="secondary" compact onPress={() => router.push('/permissions')} />
          </Row>
        </>
      ) : null}
      {modules.includes('erevos') ? (
        <Card>
          <Text variant="bodyStrong">{t('Add your first person')}</Text>
          <Text variant="caption" tone="muted" style={hint}>
            {t('One tap makes an invite: a QR code for someone beside you, or a link for someone far away.')}
          </Text>
          <Row wrap>
            <Button title={t('Invite someone')} kind="secondary" compact onPress={onInvite} />
          </Row>
        </Card>
      ) : null}
    </>
  );
}

// Hints read better a little larger and looser than captions.
const hint = { fontSize: 14, lineHeight: 20 };
