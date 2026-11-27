// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { confirm } from '../lib/alert';
import { t } from '../lib/i18n';
import { forgetRelayKey, onRelayCheck, relayCheck, type RelayCheck } from '../lib/relay';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';

import { Button, Text } from './ui';

// Under how this phone connects (components/connect-cards.tsx, ConnectStatus): whether its relay
// proved its own key in a channel (lib/relay.ts, Channels), which only the relay that holds the key
// can do, so no one in between with a certificate for its name passes for it.

export function useRelayCheck(url: string): RelayCheck {
  const [check, setCheck] = useState(() => relayCheck(url));
  useEffect(() => {
    setCheck(relayCheck(url));
    return onRelayCheck(() => setCheck(relayCheck(url)));
  }, [url]);
  return check;
}

/** What this phone knows of the key of the relay at `url`: nothing before it tried. */
export function RelayKeyNote({ url }: { url: string }) {
  const colors = useColors();
  const check = useRelayCheck(url);
  if (check === 'unknown') return null;
  if (check === 'proven') {
    return (
      <Text variant="caption" color={colors.success}>
        {t('✓ Your server proved its own key: no one in between can pass for it.')}
      </Text>
    );
  }
  if (check === 'none') {
    return (
      <Text variant="caption" tone="muted">
        {t('Your server does not prove its own key yet: it is older than this app. It works as before; once its operator updates it, Erevos checks its key every time.')}
      </Text>
    );
  }
  async function forget() {
    const sure = await confirm(
      t('Forget the key kept for this server?'),
      t('Only when its operator told you it has a new key. Erevos then takes the key the server gives next, and checks it every time from then on.'),
      t('Forget it'),
    );
    if (sure) forgetRelayKey(url);
  }
  return (
    <View style={styles.refused}>
      <Text variant="caption" color={colors.danger}>
        {t('Your server did not prove the key Erevos keeps for it: someone may be in between, or it has a new key. Nothing goes to it until it proves it; your messages wait.')}
      </Text>
      <Button title={t('It has a new key')} kind="secondary" compact onPress={() => void forget()} />
    </View>
  );
}

const styles = StyleSheet.create({
  refused: { gap: space.sm },
});
