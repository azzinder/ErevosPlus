// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useState } from 'react';

import { mark, t } from '../lib/i18n';
import type { SmsLink } from '../lib/sms-link';
import { MAX_QUICK, QUICK_TEXT } from '../lock/sms-data';
import { Button, Chip, Input, Row, Sheet, Text } from './ui';

// Quick texts for an SMS conversation (app/sms.tsx): short words written often, put in the field
// with a tap. The app's own until the owner adds or removes one; then theirs, kept encrypted with
// the space's SMS data (lock/sms-data.ts), each space its own.

const OWN = [mark("I'm on my way"), mark("I'll call you later"), mark("I'm driving, I'll write to you"), mark('Yes 👍'), mark('Thank you!')];

/** The quick texts as they show: the owner's, or the app's own in the app's language. */
export function quickTexts(link: SmsLink | null): string[] {
  return link?.quick ?? OWN.map((text) => t(text));
}

/** The sheet of quick texts: a tap puts one in the field; held down, it goes; Add keeps a new one. */
export function QuickTexts({ visible, link, onPick, onClose }: { visible: boolean; link: SmsLink | null; onPick: (text: string) => void; onClose: () => void }) {
  const [typed, setTyped] = useState('');
  const [note, setNote] = useState('');
  const [list, setList] = useState<string[] | null>(null);
  const shown = list ?? quickTexts(link);

  async function keep(next: string[]) {
    if (!link) return;
    try {
      await link.setQuick(next);
      setList(link.quick);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  function add() {
    const text = typed.trim();
    if (!text) return;
    if (shown.length >= MAX_QUICK) {
      setNote(t('At most {n} quick texts.', { n: String(MAX_QUICK) }));
      return;
    }
    setTyped('');
    setNote('');
    void keep([...shown, text]);
  }

  return (
    <Sheet visible={visible} onClose={onClose} title={t('Quick texts')}>
      <Row wrap>
        {shown.map((text) => (
          <Chip
            key={text}
            label={text}
            onPress={() => {
              onPick(text);
              onClose();
            }}
            onLongPress={() => void keep(shown.filter((q) => q !== text))}
          />
        ))}
      </Row>
      <Text variant="caption" tone="muted">
        {t('Tap one to put it in the field. Hold one down to remove it.')}
      </Text>
      <Input value={typed} onChangeText={setTyped} placeholder={t('A new quick text')} maxLength={QUICK_TEXT} onSubmitEditing={add} />
      <Button title={t('Add')} kind="secondary" disabled={!typed.trim() || !link} onPress={add} />
      {note ? <Text tone="muted">{note}</Text> : null}
    </Sheet>
  );
}
