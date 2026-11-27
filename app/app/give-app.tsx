// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';

import { QrCode } from '../components/QrCode';
import { Button, Card, Page, Row, SectionTitle, Text } from '../components/ui';
import { FDROID } from '../lib/distribution';
import { CAN_GIVE, givingState, startGiving, stopGiving, type GivingApp } from '../lib/give-app';
import { t } from '../lib/i18n';
import { grouped, nearbyLink, nearbyPage } from '../lib/nearby-link';
import { formatSize } from '../lib/updates';
import { useTheme } from '../theme/context';

// Give Erevos to a phone nearby (Settings → General → Give Erevos to a phone nearby,
// lib/give-app.ts): with no internet, this phone serves the Erevos it runs over its Wi-Fi or its
// hotspot while this screen shows, ten minutes at most. The QR code opens the download page in the
// other phone's browser; an Erevos there scans it in Updates and checks the package by itself.
// F-Droid's build says that it is F-Droid's, here and on the page: there too only F-Droid updates it.

export default function GiveApp() {
  const { colors } = useTheme();
  const [given, setGiven] = useState<GivingApp | null>(null);
  const [state, setState] = useState({ on: false, given: 0 });
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const started = useRef(false);

  // Leaving the screen stops it.
  useEffect(() => () => stopGiving(), []);

  useEffect(() => {
    if (!given) return;
    const timer = setInterval(() => setState(givingState()), 1500);
    return () => clearInterval(timer);
  }, [given]);

  async function start() {
    setError('');
    setStarting(true);
    try {
      const now = await startGiving();
      started.current = true;
      setGiven(now);
      setState({ on: true, given: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setStarting(false);
    }
  }

  function stop() {
    stopGiving();
    setState(givingState());
  }

  const on = !!given && state.on;
  const host = given?.addresses[0] ?? '';
  return (
    <Page>
      <Text variant="title">{t('Give Erevos to a phone nearby')}</Text>
      <Text variant="caption" tone="muted" style={hint}>
        {t('With no internet, a phone on the same Wi-Fi as this one, or on its hotspot, can take Erevos from it. Turn on the hotspot, or join the same Wi-Fi, then tap Start.')}
      </Text>

      {!CAN_GIVE ? (
        <Card>
          <Text tone="muted">{t('This build of Erevos cannot give itself. Update Erevos for it.')}</Text>
        </Card>
      ) : on && given ? (
        <>
          <Card>
            <Row style={{ justifyContent: 'center' }}>
              <QrCode text={nearbyLink({ host, port: given.port, token: given.token, sha256: given.sha256 })} size={260} />
            </Row>
            <Text style={hint}>{t('On the other phone, scan this with the camera: its browser opens a page to download Erevos {version} ({size}).', { version: given.version, size: formatSize(given.size) })}</Text>
            {FDROID ? (
              <Text variant="bodyStrong" style={hint}>
                {t('This is the Erevos from F-Droid: on the other phone too, only the F-Droid app will update it. An Erevos there that is not from F-Droid asks before it installs it.')}
              </Text>
            ) : null}
            <Text variant="caption" tone="muted" style={hint}>
              {t('With Erevos already on it, scan it there under Settings → General → Updates → From a phone nearby instead: Erevos checks the package by itself.')}
            </Text>
            <Text variant="caption" tone="muted" style={hint}>
              {t('Or type this in its browser:')}
            </Text>
            {given.addresses.map((address) => (
              <Text key={address} variant="mono" selectable>
                {nearbyPage({ host: address, port: given.port, token: given.token })}
              </Text>
            ))}
          </Card>

          <SectionTitle title={t('To compare')} />
          <Card>
            <Text variant="caption" tone="muted" style={hint}>
              {t('The page on the other phone shows these two. They must be the same there; with internet, compare the certificate with the one on the Erevos website too.')}
            </Text>
            <Text variant="label">{t('SHA-256 of the package:')}</Text>
            <Text variant="mono" selectable>
              {grouped(given.sha256)}
            </Text>
            <Text variant="label">{t('SHA-256 of the certificate it is signed with:')}</Text>
            {given.cert.split(',').map((cert) => (
              <Text key={cert} variant="mono" selectable>
                {grouped(cert)}
              </Text>
            ))}
          </Card>

          <Text variant="label" color={colors.success}>
            {t('Taken whole so far: {n}', { n: state.given })}
          </Text>
          <Text variant="caption" tone="muted" style={hint}>
            {t('It stops by itself after ten minutes, or when you leave this screen.')}
          </Text>
          <Row wrap>
            <Button title={t('Stop')} kind="secondary" compact onPress={stop} />
          </Row>
        </>
      ) : (
        <>
          {started.current ? <Text tone="muted">{t('Erevos is no longer given. Taken whole: {n}', { n: state.given })}</Text> : null}
          <Row wrap>
            <Button title={t('Start')} compact onPress={() => void start()} loading={starting} />
          </Row>
        </>
      )}

      {error ? (
        <Text variant="label" color={colors.danger}>
          {error}
        </Text>
      ) : null}

      <Text variant="caption" tone="muted" style={hint}>
        {t('Anyone on the same network who sees the code can download Erevos too, nothing else: no chat, contact or setting of yours goes with it.')}
      </Text>
    </Page>
  );
}

const hint = { fontSize: 14, lineHeight: 20 };
