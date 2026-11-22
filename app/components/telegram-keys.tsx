// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useState } from 'react';

import { ask } from '../lib/alert';
import { plural, t } from '../lib/i18n';
import { ExportError, openExport } from '../lib/telegram-import';
import type { SealData } from '../lib/telegram-seal';
import { telegramAdopt } from '../lib/telegram-store';
import { Button, Card, Field, Input, Text, TextButton } from './ui';

// Bringing the ErevosGram app's keys into this space's Telegram (lib/telegram-import.ts): the app
// writes erevosgram-keys.txt, one line, and shows a 20-character code. The line is pasted here (no
// file picker is part of Erevos) and the code typed; the keys open only with that code. Chats the
// ErevosGram app had encrypted open here from then on, and the ErevosGram app should not be used
// for them any more: two phones with one ratchet would each spend the same keys. If this space
// already has ErevosGram keys of its own they are kept unless replacing is asked for and confirmed.

function why(error: unknown): string {
  if (error instanceof ExportError) {
    switch (error.why) {
      case 'not-export':
        return t('This is not what the ErevosGram app wrote. Paste the whole line of erevosgram-keys.txt, which starts with EGX1:.');
      case 'code':
        return t('Type the 20-character code the ErevosGram app showed.');
      case 'wrong-code':
        return t('The code does not open these keys. Check it and try again.');
      case 'version':
        return t('These keys are from a version of the ErevosGram app that Erevos cannot read yet.');
      case 'broken':
        return t('These keys are damaged. Export them again in the ErevosGram app.');
    }
  }
  return error instanceof Error ? error.message : String(error);
}

export function TelegramKeys() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [done, setDone] = useState<number | null>(null);
  // The keys that opened but found this space's own: kept until replacing is confirmed or dropped.
  const [held, setHeld] = useState<SealData | null>(null);

  function close() {
    setOpen(false);
    setText('');
    setCode('');
    setHeld(null);
    setNote('');
  }

  async function bring() {
    setBusy(true);
    setNote('');
    setDone(null);
    try {
      const data = await openExport(text, code);
      const result = await telegramAdopt(data);
      if (result.account) {
        setDone(result.chats);
        setText('');
        setCode('');
        setHeld(null);
      } else {
        setHeld(data);
        setDone(result.chats);
      }
    } catch (error) {
      setNote(why(error));
    } finally {
      setBusy(false);
    }
  }

  function replace() {
    const data = held;
    if (!data) return;
    ask(t("Replace this space's keys?"), t('The chats encrypted here so far stop opening, because their keys are replaced by the ErevosGram app\'s. This cannot be undone.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t("Replace this space's keys"),
        style: 'destructive',
        onPress: () => {
          setBusy(true);
          setNote('');
          telegramAdopt(data, true).then(
            (result) => {
              setDone(result.chats);
              setHeld(null);
              setText('');
              setCode('');
            },
            (error: unknown) => setNote(why(error)),
          ).finally(() => setBusy(false));
        },
      },
    ]);
  }

  if (!open) {
    return (
      <Card>
        <Text tone="muted">{t('Already use ErevosGram encryption in the ErevosGram app? Bring its keys here, and those chats open in Erevos.')}</Text>
        <Button title={t('Bring keys from the ErevosGram app')} kind="secondary" onPress={() => setOpen(true)} />
      </Card>
    );
  }

  return (
    <Card>
      <Text variant="bodyStrong">{t('Bring keys from the ErevosGram app')}</Text>
      <Text tone="muted">{t('In the ErevosGram app, export the keys: it writes erevosgram-keys.txt and shows a 20-character code. Open the file, copy its one line and paste it here, then type the code.')}</Text>
      <Field label={t('The line of erevosgram-keys.txt')}>
        <Input value={text} onChangeText={setText} multiline autoCapitalize="none" autoCorrect={false} placeholder="EGX1:…" accessibilityLabel={t('The line of erevosgram-keys.txt')} />
      </Field>
      <Field label={t('The 20-character code')}>
        <Input value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} accessibilityLabel={t('The 20-character code')} />
      </Field>
      <Button title={busy ? t('Opening…') : t('Bring the keys')} loading={busy} disabled={busy || !text.trim() || !code.trim() || held !== null} onPress={() => void bring()} />
      {note ? <Text tone="muted">{note}</Text> : null}
      {held ? (
        <>
          <Text>{t("This space already has its own ErevosGram keys, so the ErevosGram app's keys were not taken. To use them, replace this space's keys.")}</Text>
          <Button title={t("Replace this space's keys")} kind="danger" disabled={busy} onPress={replace} />
        </>
      ) : done !== null ? (
        <>
          <Text>{plural(done, '{n} chat came in.', '{n} chats came in.')}</Text>
          <Text tone="muted">{t('Do not use the ErevosGram app for those chats any more: two phones using the same keys would break the encryption.')}</Text>
        </>
      ) : null}
      <TextButton title={t('Close')} onPress={close} />
    </Card>
  );
}
