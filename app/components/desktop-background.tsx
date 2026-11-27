// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { keepRunning, setKeepRunning } from '../lib/desktop';
import { t } from '../lib/i18n';
import { shellSystem } from '../lib/shell';
import { Card, Chip, Row, SectionTitle, Text } from './ui';

// Settings → Notifications → In the background on a computer (lib/desktop.ts): whether Erevos
// keeps running with its window closed, in the system tray, or quits.
export function DesktopBackground({ titled }: { titled: boolean }) {
  const [keep, setKeep] = useState<boolean | null>(null);
  const [said, setSaid] = useState('');

  useEffect(() => {
    void keepRunning().then(setKeep);
  }, []);

  function choose(next: boolean) {
    setSaid('');
    setKeepRunning(next).then(
      () => setKeep(next),
      (error: unknown) => setSaid(error instanceof Error ? error.message : String(error)),
    );
  }

  if (keep === null) return null;
  const mac = shellSystem() === 'macos';
  return (
    <>
      {titled ? <SectionTitle title={t('In the background')} /> : null}
      <Row wrap>
        <Chip label={t('Keep running when closed')} selected={keep} onPress={() => choose(true)} />
        <Chip label={t('Quit when closed')} selected={!keep} onPress={() => choose(false)} />
      </Row>
      <Card>
        <Text variant="caption" tone="muted" style={hint}>
          {said ||
            (keep
              ? mac
                ? t('When you close its window, Erevos keeps running in the Dock: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Click its icon in the Dock to open it again, and quit it from its menu.')
                : t('When you close its window, Erevos keeps running in the system tray: it waits at the server, a call rings and brings the window back, and a notification says how many messages are not read, never who or what. Open it again from its icon there, or by starting Erevos, and quit it from that icon\'s menu. Where the desktop shows no tray, as GNOME without an extension for it, starting Erevos again brings the window back.')
              : t('Closing its window quits Erevos: messages wait at the server until you open it again, and a call that came meanwhile shows as missed.'))}
        </Text>
      </Card>
    </>
  );
}

// Hints read better a little larger and looser than captions.
const hint = { fontSize: 14, lineHeight: 20 };
