// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { dialCards, type Card as ContactCard } from '../lib/contact-book';
import { toDial, type Findable } from '../lib/contacts';
import { t } from '../lib/i18n';
import { dialNumber } from '../lib/phone';
import type { SpeedDial } from '../lock/phone-data';
import { space } from '../theme/colors';
import { Button, Input, Sheet, Text } from './ui';

// Choosing the number of a speed dial key (2 to 9), on the Phone's keypad (app/phone.tsx) and
// under its Settings (app/phone-settings.tsx): a contact found by name or number, or a number typed;
// `current` the key's number now, which Take it off removes (`onPick('', '')`).

const MOST = 20;

export function SpeedDialPick({ slot, current, onClose, onPick }: {
  slot: string | null;
  current?: SpeedDial;
  onClose: () => void;
  onPick: (number: string, name: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [cards, setCards] = useState<ContactCard[] | null>(null);
  const findables = useMemo(() => new Map<string, Findable>(), [cards]);
  const hits = useMemo(() => (cards && query.trim() ? toDial(cards, query, findables, MOST) : []), [cards, query, findables]);
  const typed = dialNumber(query);

  useEffect(() => {
    if (slot === null) return;
    setQuery('');
    dialCards(true).then(setCards, () => setCards([]));
  }, [slot]);

  return (
    <Sheet visible={slot !== null} onClose={onClose} title={slot ? t('Speed dial {key}', { key: slot }) : undefined}>
      {current ? (
        <View style={{ gap: space.xs }}>
          <Text tone="muted">{[current.name, current.number].filter(Boolean).join(' · ')}</Text>
          <Button title={t('Take it off')} kind="secondary" onPress={() => onPick('', '')} />
        </View>
      ) : null}
      <Input value={query} onChangeText={setQuery} placeholder={t('A name or a number')} autoCorrect={false} />
      {typed.replace(/\D/g, '').length >= 3 && hits.length === 0 ? <Button title={t('Use {number}', { number: typed })} onPress={() => onPick(typed, '')} /> : null}
      {hits.map((row) => (
        <Button key={row.key} title={`${row.name} · ${row.kind} · ${row.number}`} kind="secondary" onPress={() => onPick(row.number, row.name)} />
      ))}
      {query.trim() && cards && hits.length === 0 && typed.replace(/\D/g, '').length < 3 ? <Text tone="muted">{t('No contact with a number matches.')}</Text> : null}
      <Text variant="caption" tone="faint">
        {t('Held down on an empty keypad, the key calls this number. Erevos keeps it sealed in this space.')}
      </Text>
    </Sheet>
  );
}
