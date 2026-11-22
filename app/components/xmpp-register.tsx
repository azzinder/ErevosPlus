// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useState } from 'react';

import type { AccountTor } from '../lib/account-tor';
import { t } from '../lib/i18n';
import { isXmppId, XmppRegisterError } from '../lib/xmpp';
import { xmppRegister } from '../lib/xmpp-store';

import { openLink } from './linked-text';
import { Button, Card, Field, Input, Row, Text } from './ui';

// A new XMPP account, from the sign-in screen (app/xmpp.tsx), made on its server by in-band
// registration (XEP-0077): an address and a password. A server that asks for a captcha, or makes
// accounts only on its website, says so, and gives its page when it named one: the account is made
// there, and signed in to here with Sign in.

/** `tor`: the new account's Tor choice from the start (lib/account-tor.ts). */
export function XmppRegister({ tor = 'never' }: { tor?: AccountTor }) {
  const [jid, setJid] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [page, setPage] = useState<string | null>(null);

  async function make() {
    setBusy(true);
    setNote('');
    setPage(null);
    try {
      await xmppRegister(jid.trim().toLowerCase(), password, server, tor);
      setPassword('');
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
      if (error instanceof XmppRegisterError && error.page) setPage(error.page);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <Text variant="bodyStrong">{t('Make a new account')}</Text>
      <Field label={t('New XMPP address')} hint={t('A name, then @ and the server that makes it, such as name@example.org.')}>
        <Input value={jid} onChangeText={setJid} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="name@example.org" accessibilityLabel={t('New XMPP address')} />
      </Field>
      <Field label={t('Password')} hint={t('At least 8 characters.')}>
        <Input value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} accessibilityLabel={t('Password')} />
      </Field>
      <Field label={t('Server')} hint={t('Only when the server is not the one in the address, or cannot be found. A name, name:port or a wss:// address.')}>
        <Input value={server} onChangeText={setServer} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="xmpp.example.org" accessibilityLabel={t('Server')} />
      </Field>
      <Button title={busy ? t('Making…') : t('Make the account')} loading={busy} disabled={busy || !isXmppId(jid) || password.length < 8} onPress={() => void make()} />
      {note ? <Text tone="muted">{note}</Text> : null}
      {page ? (
        <Row>
          <Button title={t('Open the server’s page')} kind="secondary" compact onPress={() => openLink(page)} />
        </Row>
      ) : null}
      <Text variant="caption" tone="faint">
        {t('Not every XMPP server makes accounts here; one that does not says so. A new account has no chats and no contacts yet.')}
      </Text>
    </Card>
  );
}
