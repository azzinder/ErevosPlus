// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { AppState, Linking, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ask } from '../lib/alert';
import { cancelMove, declineMove, moveErrorText, openEdition, takeMove, type FoundMove } from '../lib/edition-move';
import { t } from '../lib/i18n';
import { wipeNow } from '../lib/panic';
import { holdReceiver } from '../lib/receiver';
import { device } from '../modules/erevos-device';
import { channelPage } from '../lib/updates';
import { channelsOf, isTestVersion, updateEditionName, type UpdateEdition } from '../lib/update-channel';
import { Logo } from '../lock/gate';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';

import { Button, Card, Row, Text } from './ui';

// Moving to another edition on the same phone (lib/edition-move.ts), as app/_layout.tsx shows it
// in place of everything else. In the app moved from, once the move is made: it opens no space, so
// nothing comes in here that the other edition does not get, until the move is called off; once the
// other took it, only that this app can go. In an app already set up, a move another edition made
// for it: brought only when asked, as it takes the place of everything here.

// The download page of `edition`: its betas' while this app is a beta.
function pageOf(edition: UpdateEdition): string {
  const channels = channelsOf({ edition, beta: isTestVersion(Constants.expoConfig?.version ?? '') });
  return channelPage(channels[channels.length - 1]!);
}

function Page({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <ScrollView contentContainerStyle={{ width: '100%', maxWidth: 760, alignSelf: 'center', padding: space.xl - 4, paddingTop: insets.top + space.xl, gap: space.md }}>
        <View style={{ alignItems: 'center', paddingVertical: space.md }}>
          <Logo size={72} />
        </View>
        {children}
      </ScrollView>
    </View>
  );
}

/** This app moved out to `to`: the move waits for it (`taken` false), or it took it. `onChanged` starts Erevos again. */
export function MovedOut({ to, taken, onChanged }: { to: UpdateEdition; taken: boolean; onChanged: () => void }) {
  const name = updateEditionName(to);
  const [note, setNote] = useState('');

  // As this app moved out, the engines of the networks that cannot stop by themselves (Signal's,
  // Session's) may still run in its process: what they take in meanwhile is kept in their own
  // folders, which go with the move (MoveNet.kt reads them only from a process started after it).
  // So that nothing runs here longer, the process ends as soon as this screen is left; opened
  // again, it starts with no engine, as none opens in an app moved out.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') device?.endProcess?.();
    });
    return () => subscription.remove();
  }, []);

  const open = () => {
    if (!openEdition(to)) setNote(t('{edition} is not on this phone yet. Install it from its download page, then open it.', { edition: name }));
  };

  const cancel = () =>
    ask(t('Call the move off?'), t('Its copy for {edition} is deleted, and this Erevos opens as before, with everything here.', { edition: name }), [
      { text: t('Not now'), style: 'cancel' },
      {
        text: t('Call it off'),
        onPress: () => {
          cancelMove();
          onChanged();
        },
      },
    ]);

  const wipe = () =>
    ask(t('Delete everything here?'), t('Every space this Erevos keeps, with its contacts, messages and settings, is deleted from it now. {edition} keeps its own. This cannot be undone.', { edition: name }), [
      { text: t('Not now'), style: 'cancel' },
      {
        text: t('Delete everything here'),
        style: 'destructive',
        onPress: () => void wipeNow().catch((error) => setNote(error instanceof Error ? error.message : String(error))),
      },
    ]);

  if (taken) {
    return (
      <Page>
        <Text variant="title" style={{ textAlign: 'center' }}>
          {t('Moved to {edition}', { edition: name })}
        </Text>
        <Card>
          <Text>{t('{edition} took everything: your chats go on there. This Erevos is no longer needed: delete what it still keeps, then uninstall it.', { edition: name })}</Text>
          <Text tone="muted">{t("If this Erevos is the phone's SMS or phone app, make {edition} that app instead: until then SMS come here, where only the move shows.", { edition: name })}</Text>
          <Row wrap>
            <Button title={t('Open {edition}', { edition: name })} onPress={open} />
            <Button title={t('Delete everything here')} kind="secondary" onPress={wipe} />
            <Button title={t('Uninstall')} kind="secondary" onPress={() => void Linking.openSettings().catch(() => undefined)} />
          </Row>
        </Card>
        {note ? <Text tone="muted">{note}</Text> : null}
      </Page>
    );
  }
  return (
    <Page>
      <Text variant="title" style={{ textAlign: 'center' }}>
        {t('Moving to {edition}', { edition: name })}
      </Text>
      <Card>
        <Text>{t('Everything is ready for {edition}. Open it within a day: it asks whether to bring your chats from here.', { edition: name })}</Text>
        <Text tone="muted">{t('Meanwhile this Erevos receives and sends nothing, so that no message stays here that {edition} does not have.', { edition: name })}</Text>
        <Text tone="muted">{t("If this Erevos is the phone's SMS or phone app, make {edition} that app instead: until then SMS come here, where only the move shows.", { edition: name })}</Text>
        <Row wrap>
          <Button title={t('Open {edition}', { edition: name })} onPress={open} />
          <Button title={t('Download page')} kind="secondary" onPress={() => void Linking.openURL(pageOf(to)).catch(() => undefined)} />
          <Button title={t('Call the move off')} kind="secondary" onPress={cancel} />
        </Row>
      </Card>
      {note ? <Text tone="muted">{note}</Text> : null}
    </Page>
  );
}

/** In an app set up already: `move`, made for it by another edition. `onDone` starts Erevos again, `onLater` opens it as before. */
export function MoveFound({ move, onDone, onLater }: { move: FoundMove; onDone: () => void; onLater: () => void }) {
  const name = updateEditionName(move.from);
  const [taking, setTaking] = useState<number | null>(null);
  const [error, setError] = useState('');

  const bring = () =>
    ask(t('Bring everything from {edition}?', { edition: name }), t('It takes the place of everything this Erevos has now: its spaces, chats and settings. Make a backup here first if you want to keep them.', { edition: name }), [
      { text: t('Not now'), style: 'cancel' },
      {
        text: t('Bring everything here'),
        style: 'destructive',
        onPress: () => {
          setError('');
          setTaking(0);
          // Nothing is received while everything here gives way to the move (as Backups' restore).
          void holdReceiver().then((release) =>
            takeMove(move, (done, all) => setTaking(Math.floor((done * 100) / Math.max(1, all))))
              .finally(release)
              .then((placed) => {
                // An engine was open here: the networks' accounts go in place as Erevos starts again.
                if (!placed) ask(t('Open Erevos again'), t('The accounts of the networks come in as Erevos starts again: close Erevos and open it again.'), [{ text: t('OK') }]);
                onDone();
              }, (e: unknown) => {
                setTaking(null);
                setError(moveErrorText(e, name));
              }),
          );
        },
      },
    ]);

  return (
    <Page>
      <Text variant="title" style={{ textAlign: 'center' }}>
        {t('From {edition} on this phone', { edition: name })}
      </Text>
      <Card>
        <Text>{t('{edition} made everything ready for this app: every space, with its contacts, messages and settings.', { edition: name })}</Text>
        {taking !== null ? (
          <Text variant="bodyStrong">{t('Bringing everything here… {percent}%', { percent: taking })}</Text>
        ) : (
          <Row wrap>
            <Button title={t('Bring everything here')} onPress={bring} />
            <Button
              title={t('Not now')}
              kind="secondary"
              onPress={() => {
                declineMove(move);
                onLater();
              }}
            />
          </Row>
        )}
      </Card>
      {error ? <Text tone="muted">{error}</Text> : null}
    </Page>
  );
}
