// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { Pressable, View } from 'react-native';

import { Chip, Row, Text, Toggle } from './ui';
import { tap } from '../lib/haptics';
import { mark, t } from '../lib/i18n';
import { accountThroughTor, canAccountTor, type AccountTor } from '../lib/account-tor';
import { space } from '../theme/colors';

// Tor for one account of another network (lib/account-tor.ts), the same on every account's screen:
// Off (the default), As the space, Always. `network` names it in the words, as «Telegram».
// `chatsThroughTor`: a chat of it goes «Through Tor», so the account goes only through Tor
// whatever is chosen here, and says so.

const WAYS: AccountTor[] = ['never', 'space', 'always'];
const LABELS: Record<AccountTor, string> = {
  never: mark('Off'),
  space: mark('As the space'),
  always: mark('Always through Tor'),
};

export function AccountTorChoice({
  network,
  way,
  chatsThroughTor = false,
  disabled = false,
  onChange,
}: {
  network: string;
  way: AccountTor;
  chatsThroughTor?: boolean;
  disabled?: boolean;
  onChange: (way: AccountTor) => void;
}) {
  if (!canAccountTor()) return null;
  const through = accountThroughTor(way);
  return (
    <View style={{ gap: space.xs }}>
      <Text variant="caption" tone="muted">
        {t('Tor for this {network} account', { network })}
      </Text>
      <Row wrap>
        {WAYS.map((choice) => (
          <Chip key={choice} label={t(LABELS[choice])} selected={way === choice} disabled={disabled} onPress={() => onChange(choice)} />
        ))}
      </Row>
      <Text variant="caption" tone="muted">
        {chatsThroughTor && way !== 'always'
          ? t('A chat of this account is set to go through Tor, so the whole account goes only through Tor while it is: {network} has one connection for all its chats. Never straight.', { network })
          : way === 'always'
            ? t('Always through Tor, whatever the space does, signing in too: the {network} server never sees your address. Slower, and nothing goes while Tor cannot connect. Calls do not go through Tor.', { network })
            : way === 'never'
              ? t('Not through Tor: the {network} server sees your address. Choose As the space or Always through Tor to hide it.', { network })
              : through
                ? t('Through Tor, as the space: the {network} server does not see your address. Files too only when the space sends Everything through Tor.', { network })
                : t('As the space, which does not go through Tor now: the {network} server sees your address. Tor is under Settings → Relay and networks → Tor.', { network })}
      </Text>
      <Text variant="caption" tone="muted">
        {t('Tor uses the bridges chosen under Settings → Relay and networks → Tor, as Erevos does.')}
      </Text>
    </View>
  );
}

/**
 * «Through Tor» for one chat of a network with one connection per account (Telegram, Signal,
 * XMPP): on, it makes the whole account go only through Tor while it is (lib/account-tor.ts
 * effectiveTor), and says so. Off by default.
 */
export function ChatTorSwitch({
  network,
  on,
  disabled = false,
  onChange,
}: {
  network: string;
  on: boolean;
  disabled?: boolean;
  onChange: (on: boolean) => void;
}) {
  if (!canAccountTor()) return null;
  return (
    <View style={{ gap: space.xs }}>
      <Pressable
        disabled={disabled}
        onPress={() => {
          tap();
          onChange(!on);
        }}
        accessibilityRole="switch"
        accessibilityState={{ checked: on, disabled }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}
      >
        <Text variant="bodyStrong" style={{ flex: 1 }}>
          {t('Through Tor')}
        </Text>
        <Toggle on={on} />
      </Pressable>
      <Text variant="caption" tone="muted">
        {on
          ? t('This chat goes only through Tor, never straight, whatever the account or the space say. {network} has one connection for all chats of an account, so the whole account goes through Tor while this is on. Calls do not go through Tor.', { network })
          : t('This chat goes as the account’s Tor setting says. Turn on to send it only through Tor; the whole {network} account then goes through Tor, as it has one connection.', { network })}
      </Text>
    </View>
  );
}
