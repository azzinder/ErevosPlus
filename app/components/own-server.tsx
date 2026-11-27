// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useState } from 'react';

import { WayCard } from './connect-cards';
import { StackIcon } from './icons';
import { Button, Field, Input, Row, Text } from './ui';
import { t } from '../lib/i18n';
import { useColors } from '../theme/context';

// For a phone with no relay yet (New chat, For advanced users): what a server is, in one line, over
// the ways to start that follow it, which stand as equals: an account at a server (LPHL's, or another), a server
// of one's own, or none. Where starting with none is offered below (`none`), a line says that it is
// the way for whoever has neither, so nobody is left choosing between things they do not have.
export function ServerChoice({ none = false }: { none?: boolean }) {
  return (
    <>
      <Text variant="bodyStrong">{t('Where your messages wait')}</Text>
      <Text variant="caption" tone="muted">
        {t('A server keeps your messages, encrypted, until the other phone takes them. It cannot read them. Choose how to start: you can change it any time, here.')}
      </Text>
      {none ? (
        <Text variant="caption" tone="muted">
          {t('If you have neither an account nor a server, start without a server: it needs nothing, and you can add one later.')}
        </Text>
      ) : null}
    </>
  );
}

/**
 * A server of one's own, or one's group's: its address and the code whoever set it up gave, typed
 * here and tried at once (`onUse`, which gives back what went wrong, or null once this phone is on
 * it). Nothing is kept until the server answered: a mistyped address leaves the phone as it was.
 */
export function OwnServerCard({ open, onPress, onUse }: { open: boolean; onPress: () => void; onUse: (address: string, code: string) => Promise<string | null> }) {
  const [address, setAddress] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const colors = useColors();
  const use = async () => {
    setBusy(true);
    setProblem('');
    try {
      setProblem((await onUse(address, code)) ?? '');
    } finally {
      setBusy(false);
    }
  };
  return (
    <WayCard
      tint="blue"
      sign={<StackIcon color="#ffffff" size={20} />}
      title={t('I have a server of my own')}
      line={t('Yours, or one of your family, group or workplace. You type its address and the code you were given.')}
      open={open}
      onPress={onPress}
    >
      <Field label={t('Server address')}>
        <Input value={address} onChangeText={setAddress} placeholder="relay.example.org" autoCapitalize="none" autoCorrect={false} keyboardType="url" />
      </Field>
      <Field label={t('Code (if the server has one)')}>
        <Input value={code} onChangeText={setCode} autoCapitalize="none" autoCorrect={false} secureTextEntry />
      </Field>
      <Row wrap>
        <Button title={t('Connect')} compact loading={busy} disabled={!address.trim()} onPress={() => void use()} />
      </Row>
      {problem ? <Text color={colors.danger}>{problem}</Text> : null}
      <Text variant="caption" tone="muted">
        {t('Whoever set up the server gives you both; there they are called the server address and the token. Calls, photos and files then go through that server too. To set one up yourself, see Running your own server in the user guide.')}
      </Text>
    </WayCard>
  );
}
