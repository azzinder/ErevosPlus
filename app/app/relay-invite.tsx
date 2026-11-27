// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useLocalSearchParams } from 'expo-router';

import { Button, Field, Page, Text, TextButton } from '../components/ui';
import { t } from '../lib/i18n';
import { checkInvite, offerInvite } from '../lib/relay-invite';
import { currentSpace } from '../lock/keys';

// Opens from a scanned invite to a relay, erevos://relay-invite?relay=...&code=... (see
// lib/relay-invite.ts). Nothing is taken until the person says so, because any link can open this
// screen; then the space's chat takes it, which keeps the relay and the token sealed in the space.

export default function RelayInvite() {
  const { relay, code } = useLocalSearchParams<{ relay?: string; code?: string }>();
  const invite = checkInvite(relay, code);

  if (!invite) {
    return (
      <Page>
        <Text variant="title">{t('Not an invite')}</Text>
        <Text tone="muted">{t('This link does not hold an invite to a server that Erevos can use.')}</Text>
        <Button title={t('Close')} onPress={() => router.dismissTo('/')} />
      </Page>
    );
  }

  return (
    <Page>
      <Text variant="title">{t('Invite to a server')}</Text>
      <Field label={t('Server')}>
        <Text selectable variant="mono" style={{ fontSize: 13 }}>
          {invite.relayUrl}
        </Text>
      </Field>
      <Text tone="muted">
        {t(
          'Whoever made this invite lets this phone use their server, with a token of its own, for as long as they may use it themselves. Erevos makes the token and keeps it in this space; you type nothing. Take it only if it came from someone you know.',
        )}
      </Text>
      <Button
        title={t('Use this server')}
        onPress={() => {
          offerInvite(invite, currentSpace().space);
          router.dismissTo('/chat?setup=1');
        }}
      />
      <TextButton title={t('Cancel')} onPress={() => router.dismissTo('/')} />
    </Page>
  );
}
