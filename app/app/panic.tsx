// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { PasswordSheet } from '../components/PasswordSheet';
import { Button, Card, Chip, Page, Row, SectionTitle, Text } from '../components/ui';
import { confirm } from '../lib/alert';
import { folderLabel, loadAutoBackup, type AutoBackup } from '../lib/backup-folder';
import { t } from '../lib/i18n';
import { allowPanicApp, CAN_PANIC_APP, CAN_WIPE, forgetPanicApp, panicResponders, panicState, refusePanicApp, tellPanicApp, renewPanicApp, seenPanicRefused, setPanic, wipeNow, WIPE_BACKUPS_HERE, type PanicResponder, type PanicState } from '../lib/panic';
import { isPasswordLocked, loadLockConfig, removePanicPassword, setPanicPassword } from '../lock/config';
import { useTheme } from '../theme/context';

// The panic button (Settings → Privacy and security → Panic button, lib/panic.ts): wipe everything
// Erevos keeps here now, and, on Android, let a panic app the owner trusts do it (PanicKit). A
// panic app that asks to be the one opens this screen, after the password, where the owner says
// yes or no; it is trusted only then, and only while the switch is on. With the password lock on,
// a panic password can be set here (lock/config.ts): typed on the lock screen, it wipes the same.
// Erevos keeps nothing that shows whether one is set, so this screen cannot say either.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));
const two = (n: number) => String(n).padStart(2, '0');
// When a refused wipe was: day/month/year hour:minute.
const whenText = (at: number) => {
  const d = new Date(at);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${two(d.getHours())}:${two(d.getMinutes())}`;
};

export default function Panic() {
  const { colors } = useTheme();
  const [state, setState] = useState<PanicState | null>(() => panicState());
  const [auto, setAuto] = useState<AutoBackup | null>(null);
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null);
  const [wiping, setWiping] = useState(false);
  // On a computer or Sailfish OS, whether the automatic backups go too (no panic app there).
  const [backupsHere, setBackupsHere] = useState(false);
  // Whether the lock screen asks for a password: only then can a panic password be typed.
  const [locked, setLocked] = useState(false);
  const [settingPanic, setSettingPanic] = useState(false);

  // The apps Erevos tells as it wipes, as Fasouli, which locks itself then.
  const [responders, setResponders] = useState<PanicResponder[]>(() => panicResponders());
  const reload = () => {
    setState(panicState());
    setResponders(panicResponders());
  };
  useEffect(() => {
    void loadAutoBackup().then(setAuto);
    void loadLockConfig().then((config) => setLocked(isPasswordLocked(config)), () => setLocked(false));
    // A panic app may ask while this screen shows (it opens Erevos again).
    const sub = AppState.addEventListener('change', (now) => {
      if (now === 'active') reload();
    });
    return () => sub.remove();
  }, []);

  const say = (text: string, bad = false) => setNote(text ? { text, bad } : null);
  const folder = auto?.folder ?? '';

  function toggle() {
    if (!state) return;
    setPanic(!state.on, state.backups, folder);
    reload();
  }

  function toggleBackups() {
    if (!state) return;
    setPanic(state.on, !state.backups, folder);
    reload();
  }

  function tellApp(app: PanicResponder) {
    if (!tellPanicApp(app.pkg, !app.told)) say(t('{app} is not installed.', { app: app.label }), true);
    else say(app.told ? t('{app} is no longer told when Erevos wipes.', { app: app.label }) : t('{app} is told when Erevos wipes. If it asks, say yes there too.', { app: app.label }));
    reload();
  }

  function allow() {
    if (!state?.pending) return;
    if (allowPanicApp(state.pending)) {
      if (!state.on) setPanic(true, state.backups, folder);
      say(t('{app} can now wipe Erevos.', { app: state.pendingLabel }));
    } else say(t('That app changed since it asked. Ask again from it.'), true);
    reload();
  }

  function refuse() {
    refusePanicApp();
    reload();
  }

  async function forget() {
    if (!state?.trigger) return;
    if (!(await confirm(t('Stop trusting {app}', { app: state.triggerLabel }), t('{app} will no longer be able to wipe Erevos.', { app: state.triggerLabel })))) return;
    forgetPanicApp();
    reload();
  }

  // The trusted app is installed but signed with a key Erevos cannot tie to the one trusted: an
  // update signed anew, or another app under its name. Only the owner can tell which.
  async function renew() {
    if (!state?.trigger) return;
    if (!(await confirm(t('Trust {app} as it is now', { app: state.triggerLabel }), t('{app} is now signed with another key, so Erevos does not let it wipe. Say yes only if you updated it yourself from where you got it; another app under its name could be the one asking.', { app: state.triggerLabel }), t('Trust it')))) return;
    if (renewPanicApp()) say(t('{app} can now wipe Erevos.', { app: state.triggerLabel }));
    else say(t('{app} is not installed.', { app: state.triggerLabel }), true);
    reload();
  }

  function seenRefused() {
    seenPanicRefused();
    reload();
  }

  async function panicPasswordSet(password: string) {
    await setPanicPassword(password);
    setSettingPanic(false);
    say(t('Panic password set. Typed on the lock screen, it wipes Erevos.'));
  }

  async function panicPasswordOff() {
    if (!(await confirm(t('Turn off the panic password'), t('Typed on the lock screen, it will then be only a wrong password.'), t('Turn off')))) return;
    await removePanicPassword();
    say(t('No panic password now.'));
  }

  async function wipe() {
    const withBackups = !!folder && (WIPE_BACKUPS_HERE ? backupsHere : !!state?.backups);
    const backups = withBackups ? ` ${t('The automatic backups in {folder} go too.', { folder: folderLabel(folder) })}` : '';
    if (!(await confirm(t('Wipe everything'), t('Everything Erevos keeps here goes now, for good: every space and its hidden chats, contacts, messages and keys. Erevos then starts as if just installed. This cannot be undone.') + backups, t('Wipe')))) return;
    setWiping(true);
    try {
      await wipeNow(WIPE_BACKUPS_HERE && withBackups ? folder : '');
    } catch (error) {
      setWiping(false);
      say(errorText(error), true);
    }
  }

  return (
    <Page>
      <Text variant="title">{t('Panic button')}</Text>
      <Text variant="caption" tone="muted" style={hint}>
        {t('In danger, wipe Erevos at once: every space and its hidden chats, with their contacts, messages, photos, files and keys, the lock, the Matrix, XMPP and Nostr accounts, the server tokens, and the settings and password of automatic backups and of their server.')}
      </Text>
      <Text variant="caption" tone="muted" style={hint}>
        {t('What it cannot reach stays: backups you copied elsewhere or sent to a server (their password still guards them), what the server holds for you until it expires, and what your contacts have.')}
      </Text>

      <SectionTitle title={t('Wipe now')} />
      <Card>
        {CAN_WIPE ? (
          <>
            {WIPE_BACKUPS_HERE && folder ? (
              <Row wrap>
                <Chip label={t('Also the automatic backups in {folder}', { folder: folderLabel(folder) })} selected={backupsHere} onPress={() => setBackupsHere(!backupsHere)} />
              </Row>
            ) : null}
            <Row wrap>
              <Button title={wiping ? t('One moment…') : t('Wipe everything now')} kind="danger" compact onPress={() => void wipe()} disabled={wiping} />
            </Row>
          </>
        ) : (
          <Text tone="muted">{t('Here Erevos cannot wipe itself: delete its data from the computer instead.')}</Text>
        )}
      </Card>

      {CAN_WIPE && locked ? (
        <>
          <SectionTitle title={t('Panic password')} />
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {t('A password of its own that, typed on the lock screen, wipes Erevos as the button above does. The screen then looks as after a wrong password, and checking it takes as long as any other. It must differ from every password of your spaces.')}
            </Text>
            <Text variant="caption" tone="muted" style={hint}>
              {t('Erevos keeps nothing that shows whether one is set, so this screen cannot say either. Setting it again replaces the one before.')}
            </Text>
            <Row wrap>
              <Button title={t('Set the panic password')} compact onPress={() => setSettingPanic(true)} />
              <Button title={t('Turn off the panic password')} kind="secondary" compact onPress={() => void panicPasswordOff()} />
            </Row>
          </Card>
          <PasswordSheet
            visible={settingPanic}
            title={t('Panic password')}
            repeat
            hint={t('Typed on the lock screen, it wipes everything Erevos keeps here.')}
            submitLabel={t('Save')}
            onClose={() => setSettingPanic(false)}
            onSubmit={panicPasswordSet}
          />
        </>
      ) : null}

      {CAN_PANIC_APP && state ? (
        <>
          <SectionTitle title={t('From a panic app')} />
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {t('A panic app, such as Ripple, wipes the apps you choose with one gesture. Install one, choose Erevos in it, then say yes here. Only the app you say yes to can wipe Erevos, and only while this is on.')}
            </Text>
            {state.pending ? (
              <>
                <Text variant="bodyStrong">{t('{app} asks to be able to wipe Erevos.', { app: state.pendingLabel })}</Text>
                <Row wrap>
                  <Button title={t('Say yes')} compact onPress={allow} />
                  <Button title={t('Say no')} kind="secondary" compact onPress={refuse} />
                </Row>
              </>
            ) : null}
            {state.trigger ? (
              <Text variant="bodyStrong">
                {state.triggerThere ? t('Trusted panic app: {app}', { app: state.triggerLabel }) : t('Trusted panic app: {app}, no longer installed as it was.', { app: state.triggerLabel })}
              </Text>
            ) : state.pending ? null : (
              <Text tone="muted">{t('No panic app yet.')}</Text>
            )}
            {state.trigger && state.refused ? (
              <>
                <Text variant="label" color={colors.danger}>
                  {state.refusedKey
                    ? t('On {when} {app} asked to wipe Erevos, and Erevos refused: the app is no longer signed as when you trusted it.', { when: whenText(state.refused), app: state.triggerLabel })
                    : t('On {when} {app} asked to wipe Erevos, and Erevos refused: the switch below was off.', { when: whenText(state.refused), app: state.triggerLabel })}
                </Text>
                <Row wrap>
                  <Button title={t('Got it')} kind="secondary" compact onPress={seenRefused} />
                </Row>
              </>
            ) : null}
            {state.trigger && !state.triggerThere && state.triggerInstalled ? (
              <>
                <Text variant="caption" tone="muted" style={hint}>
                  {t('{app} is installed but signed with another key, so it cannot wipe Erevos. If you updated it yourself, trust it again as it is now.', { app: state.triggerLabel })}
                </Text>
                <Row wrap>
                  <Button title={t('Trust {app} as it is now', { app: state.triggerLabel })} compact onPress={() => void renew()} />
                </Row>
              </>
            ) : null}
            <Row wrap>
              <Chip label={t('A panic app may wipe Erevos')} selected={state.on} onPress={toggle} />
              {folder ? <Chip label={t('Also the automatic backups in {folder}', { folder: folderLabel(folder) })} selected={state.backups} onPress={toggleBackups} /> : null}
            </Row>
            {state.trigger ? (
              <Row wrap>
                <Button title={t('Stop trusting {app}', { app: state.triggerLabel })} kind="secondary" compact onPress={() => void forget()} />
              </Row>
            ) : null}
          </Card>
        </>
      ) : Platform.OS === 'android' ? (
        <Text variant="caption" tone="muted" style={hint}>
          {t('This build of Erevos cannot be wiped by a panic app. Update Erevos for it.')}
        </Text>
      ) : null}

      {CAN_PANIC_APP ? (
        <>
          <SectionTitle title={t('Tell other apps')} />
          <Card>
            <Text tone="muted" style={hint}>
              {t('As Erevos wipes, from the button, the panic password or a panic app, it can tell the apps you choose here, as a panic app does: Fasouli then locks itself. Each app decides what it does, and asks you first whether Erevos may.')}
            </Text>
            {responders.length === 0 ? (
              <Text tone="muted">{t("No app on this phone takes a panic app's request.")}</Text>
            ) : (
              <Row wrap>
                {responders.map((app) => (
                  <Chip key={app.pkg} label={app.label} selected={app.told} onPress={() => tellApp(app)} />
                ))}
              </Row>
            )}
          </Card>
        </>
      ) : null}

      {note ? (
        <Text variant="label" color={note.bad ? colors.danger : colors.success}>
          {note.text}
        </Text>
      ) : null}
    </Page>
  );
}

const hint = { fontSize: 14, lineHeight: 20 };
