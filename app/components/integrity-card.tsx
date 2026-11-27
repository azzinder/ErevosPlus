// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { loadCurrentSpaceData } from '../lock/space-data';
import { checkForUpdate, integrityStatus, watchIntegrity, WEB_APP, type IntegrityStatus } from '../lib/integrity';
import { PUSH_AVAILABLE, turnOffPush, turnOnPush } from '../lib/web-push';
import { useTheme } from '../theme/context';
import { locale, t } from '../lib/i18n';

import { Button, Card, Row, SectionTitle, Text } from './ui';

// The Lock screen's part on the web app (pwa/): which signed release runs, with the fingerprint
// of the key that signed it, what waits for the next start, and what the service worker refused.
// Nothing in the phone or desktop app.

const when = (ms: number) => new Date(ms).toLocaleString(locale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Whether the browser lets Erevos show notifications: it may have been refused since they were turned on.
const allowed = () => !PUSH_AVAILABLE || Notification.permission === 'granted';

/** The web app's signed release and its Web Push; with `part`, only the one, as a screen of its own. */
export function IntegrityCard({ part }: { part?: 'web' | 'push' }) {
  const { colors } = useTheme();
  const [status, setStatus] = useState<IntegrityStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [push, setPush] = useState<boolean | null>(null);
  const [pushLeft, setPushLeft] = useState(false);
  const [pushAllowed, setPushAllowed] = useState(allowed);
  const [pushNote, setPushNote] = useState('');

  const reload = useCallback(() => {
    integrityStatus().then(setStatus, () => setStatus(null));
  }, []);

  useEffect(() => {
    reload();
    return watchIntegrity(reload);
  }, [reload]);

  useEffect(() => {
    loadCurrentSpaceData().then(
      (data) => {
        setPush(data.push);
        setPushLeft(data.pushLeft);
      },
      () => setPush(false),
    );
    // Back from the browser's or the phone's settings: what it allows now.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setPushAllowed(allowed());
    });
    return () => subscription.remove();
  }, []);

  if (!WEB_APP) return null;

  async function check() {
    setBusy(true);
    try {
      setStatus(await checkForUpdate());
    } finally {
      setBusy(false);
    }
  }

  // Called straight from the tap: Safari asks for the permission only from one.
  function switchPush() {
    setBusy(true);
    setPushNote('');
    const change = push ? turnOffPush().then(() => null) : turnOnPush();
    change
      .then((problem) => {
        if (problem) setPushNote(problem);
        else setPush(!push);
        setPushAllowed(allowed());
        // Turned off with the relay out of reach, or told.
        loadCurrentSpaceData().then((data) => setPushLeft(data.pushLeft), () => undefined);
      })
      .finally(() => setBusy(false));
  }

  const current = status?.current;
  return (
    <>
      {part === 'push' ? null : (
        <>
          {part ? null : <SectionTitle title={t('This web app')} />}
          <Card>
            {current ? (
              <Text variant="bodyStrong">{t('Release {version}, checked', { version: current.label ?? current.version })}</Text>
            ) : (
              <Text variant="bodyStrong" color={colors.danger}>
                {t('Not checked: no service worker runs Erevos here')}
              </Text>
            )}
            <Text variant="caption" tone="muted" style={hint}>
              {t("Erevos runs only code signed with its release key, kept on this device. The key's fingerprint is")}{' '}
              <Text variant="caption" style={mono}>
                {status?.key ?? '…'}
              </Text>
              {t('. It must match the one you were given with the address of this server.')}
            </Text>
            {status?.pending ? (
              <Text variant="caption" color={colors.success} style={hint}>
                {t('Release {version} is checked and starts the next time Erevos opens.', { version: status.pending.label ?? status.pending.version })}
              </Text>
            ) : null}
            {status?.checked ? (
              <Text variant="caption" tone="muted" style={hint}>
                {t('Last looked for updates {when}.', { when: when(status.checked) })}
                {status.error ? ` ${status.error}` : ''}
              </Text>
            ) : null}
            {status?.refused.length ? (
              <>
                <Text variant="caption" color={colors.danger} style={hint}>
                  {t('Refused:')}
                </Text>
                {status.refused.map((refusal) => (
                  <Text key={refusal.at} variant="caption" color={colors.danger} style={hint}>
                    {when(refusal.at)}: {refusal.reason}
                  </Text>
                ))}
              </>
            ) : null}
            <Row wrap>
              <Button title={busy ? t('Looking…') : t('Look for an update')} kind="secondary" compact onPress={check} disabled={busy || !current} />
            </Row>
          </Card>
        </>
      )}
      {PUSH_AVAILABLE && part !== 'web' ? (
        <>
          {part ? null : <SectionTitle title={t('Notifications while closed')} />}
          <Card>
            <Text variant="bodyStrong">{push ? t('On in this space') : t('Off in this space')}</Text>
            {push && !pushAllowed ? (
              <Text variant="caption" color={colors.danger} style={hint}>
                {t('Notifications are not allowed for Erevos. Allow them in the settings of this browser or phone.')}
              </Text>
            ) : null}
            {push === false && pushLeft ? (
              <Text variant="caption" color={colors.warning} style={hint}>
                {t('Your server could not be told yet, so notifications may still come. Erevos tells it once it can be reached.')}
              </Text>
            ) : null}
            <Text variant="caption" tone="muted" style={hint}>
              {t(
                'When messages come, or a call rings, while Erevos is closed, your server sends a push through this browser\'s push service (Apple\'s on an iPhone), and Erevos shows how many messages came since you last opened it, such as "3 new messages", or "Call" when only a call rang, nothing more. The push carries no message and no sender, and its count is encrypted for this browser, but the push service sees when something comes for this device, and that it uses Erevos. With a server or a sender\'s Erevos older than 2.0.0, or a message that other phones carried to the server, there is no number: Erevos shows "New message", or "New messages" once more came, until you open it. Hidden chats never get notifications. Each space that turns them on has a push address of its own, so the address does not tie two spaces together at their server.',
              )}
            </Text>
            {/* A call while closed: Web Push can only show it, it cannot ring. */}
            <Text variant="caption" tone="muted" style={hint}>
              {t('A call that comes while Erevos is closed does not ring: only the notification "Call" shows. On an iPhone nothing more can be done: Apple lets a web app neither run while it is closed nor ring as a phone does; that would take an app from the App Store. On Android, the Erevos app rings even when closed.')}
            </Text>
            {/* The number on the icon (lib/icon-number.ts), which comes with them. */}
            <Text variant="caption" tone="muted" style={hint}>
              {t("Where the browser can show it, Erevos's icon then also shows how many messages this space has not read, unless turned off under Number on the icon.")}
            </Text>
            <Text variant="caption" tone="muted" style={hint}>
              {t("Each space with them on has a service worker of its own in this browser, which its settings list: whoever can see them can count the spaces with notifications on. A message request from someone new, through your contact link, may show only once Erevos opens.")}
            </Text>
            {pushNote ? (
              <Text variant="caption" color={colors.danger} style={hint}>
                {pushNote}
              </Text>
            ) : null}
            <Row wrap>
              <Button title={push ? t('Turn off') : t('Turn on')} kind="secondary" compact onPress={switchPush} disabled={busy || push === null} />
              <Button title={t('All permissions')} kind="ghost" compact onPress={() => router.push('/permissions')} />
            </Row>
          </Card>
        </>
      ) : null}
    </>
  );
}

const hint = { fontSize: 14, lineHeight: 20 };
const mono = { fontFamily: 'ui-monospace, Menlo, Consolas, monospace' };
