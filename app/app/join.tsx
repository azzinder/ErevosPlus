// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, Card, Field, Input, Page, Text, TextButton } from '../components/ui';
import { canPublicGroup } from '../lib/core';
import { t } from '../lib/i18n';
import { checkJoinLink } from '../lib/public-rules';
import { spaceGroups } from '../lib/space-groups';
import { MAX_NAME } from '../lock/e2e-data';
import { useTheme } from '../theme/context';

// Opens from a public group's link or its scanned QR code, erevos://join?g=...&d=...&relay=...&k=...
// (lib/public-rules.ts), or one pasted in app/public-groups.tsx. Nothing is sent until the person
// chooses a name and asks, because any link can open this screen.
export default function Join() {
  const { g, d, relay, rk, k, n } = useLocalSearchParams<{ g?: string; d?: string; relay?: string; rk?: string; k?: string; n?: string }>();
  const { colors } = useTheme();
  const link = checkJoinLink(g, d, relay, rk, k, n);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState(false);
  const [note, setNote] = useState('');

  if (!canPublicGroup()) {
    return (
      <Page>
        <Text variant="title">{t('Join a group')}</Text>
        <Text tone="muted">{t('This build of Erevos has no public groups yet. Update it to make or join one.')}</Text>
        <Button title={t('Close')} onPress={() => router.dismissTo('/')} />
      </Page>
    );
  }

  if (!link) {
    return (
      <Page>
        <Text variant="title">{t('Not a group’s link')}</Text>
        <Text tone="muted">{t('This link does not hold a group Erevos can ask to join.')}</Text>
        <Button title={t('Close')} onPress={() => router.dismissTo('/')} />
      </Page>
    );
  }

  async function ask() {
    if (!link) return;
    setBusy(true);
    setNote('');
    try {
      await (await spaceGroups()).ask(link, name);
      setAsked(true);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  if (asked) {
    return (
      <Page>
        <Text variant="title">{t('Asked to join')}</Text>
        <Text tone="muted">
          {t('The group shows in your chats once its owner’s phone lets you in: when Erevos is open on it, and if the group asks for it, once an admin says yes.')}
        </Text>
        <Button title={t('Close')} onPress={() => router.dismissTo('/')} />
      </Page>
    );
  }

  return (
    <Page>
      <Text variant="title">{link.name ? t('Join {name}', { name: link.name }) : t('Join a group')}</Text>
      <Card>
        <Field label={t('Your name in the group')} hint={t('Everyone in the group sees it, beside the start of a key made for this group alone.')}>
          <Input value={name} onChangeText={setName} placeholder={t('A name for this group')} maxLength={MAX_NAME} autoFocus />
        </Field>
        <Field label={t('Its owner’s server')}>
          <Text selectable variant="mono" style={{ fontSize: 13 }}>
            {link.relay}
          </Text>
        </Field>
      </Card>
      <Text tone="muted">
        {t('A public group: whoever has its link can join it, so anyone in it may be someone you do not know, and can copy what is said. Members see the name you choose, and where their messages reach you (your server and your queue on it), not who you are in your chats.')}
      </Text>
      {note ? <Text color={colors.danger}>{note}</Text> : null}
      <Button title={t('Ask to join')} onPress={() => void ask()} disabled={busy || !name.trim()} loading={busy} />
      <TextButton title={t('Cancel')} onPress={() => router.dismissTo('/')} />
    </Page>
  );
}
