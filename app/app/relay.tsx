// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useState } from 'react';

import { Button, Card, Field, Input, Page, Row, Text } from '../components/ui';
import { t } from '../lib/i18n';
import { createQueue, decodeEnvelope, encodeEnvelope, fromHex, receiveMessage, sendMessage, toHex } from '../lib/relay';
import { useColors } from '../theme/context';

// Messages through the relay running on a computer, over WebSocket. Phones on the same
// Wi-Fi reach it at ws://<computer-IP>:7879. Nothing is saved, so reloading forgets the queue.

type Queue = { recipientHex: string; senderHex: string };

export default function Relay() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [queue, setQueue] = useState<Queue | null>(null);
  const [sendTo, setSendTo] = useState('');
  const [draft, setDraft] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const colors = useColors();

  function note(line: string) {
    setLog((list) => [line, ...list].slice(0, 30));
  }

  function target() {
    const relay = url.trim();
    if (!relay) {
      note(t('Type the server address first.'));
      return null;
    }
    return { url: relay, token: token.trim() || undefined };
  }

  async function attempt(action: () => Promise<string>) {
    try {
      note(await action());
    } catch (error) {
      note(error instanceof Error ? error.message : String(error));
    }
  }

  function create() {
    const relay = target();
    if (!relay) return;
    attempt(async () => {
      const ids = await createQueue(relay);
      setQueue({ recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) });
      return t('Queue created.');
    });
  }

  function send() {
    const relay = target();
    const text = draft.trim();
    if (!relay || !text) return;
    attempt(async () => {
      // A try of the relay, which no chat shows: no message (lib/relay.ts, Mark).
      await sendMessage(relay, fromHex(sendTo), encodeEnvelope('', text), 'quiet');
      setDraft('');
      return t('Sent: {text}', { text });
    });
  }

  function receive() {
    const relay = target();
    if (!relay) return;
    if (!queue) {
      note(t('Create a queue first.'));
      return;
    }
    attempt(async () => {
      const bytes = await receiveMessage(relay, fromHex(queue.recipientHex));
      const envelope = bytes ? decodeEnvelope(bytes) : null;
      return envelope ? t('Received: {text}', { text: envelope.text }) : t('Nothing waiting.');
    });
  }

  return (
    <Page>
      <Text variant="title">{t('Server test (Wi-Fi)')}</Text>
      <Text tone="muted">
        {t("Messages wait on the server running on the computer. Both phones must be on the same Wi-Fi and use that computer's address.")}
      </Text>
      <Input
        value={url}
        onChangeText={setUrl}
        placeholder="ws://172.22.140.150:7879"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <Input
        value={token}
        onChangeText={setToken}
        placeholder={t('Token, if the server needs one')}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />
      <Button title={t('Create queue')} onPress={create} />
      {queue ? (
        <Card>
          <Field label={t('Sender id (give this to the phone that writes to you)')}>
            <Text selectable variant="mono">{queue.senderHex}</Text>
          </Field>
          <Field label={t('Recipient id (keep private, used to receive)')}>
            <Text selectable variant="mono">{queue.recipientHex}</Text>
          </Field>
        </Card>
      ) : null}
      <Field label={t('Send to a sender id')}>
        <Input value={sendTo} onChangeText={setSendTo} placeholder={t('48 hex characters')} autoCapitalize="none" autoCorrect={false} />
      </Field>
      <Input value={draft} onChangeText={setDraft} placeholder={t('Message')} />
      <Row>
        <Button title={t('Send')} onPress={send} style={{ flex: 1 }} />
        <Button title={t('Receive')} kind="secondary" onPress={receive} style={{ flex: 1 }} />
      </Row>
      {log.map((line, index) => (
        <Text key={index} variant="caption" color={colors.accentText}>
          {line}
        </Text>
      ))}
    </Page>
  );
}
