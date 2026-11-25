// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ipGate } from './ip-warning';
import { Button, Field, font, Input, Row, Text, TextButton } from './ui';
import { canPairCode, nostrKeys } from '../lib/core';
import { t } from '../lib/i18n';
import { nostrChatsThroughTor } from '../lib/nostr-dm-net';
import { PAIR_DIGITS, typeCode, type PairEnd, type Pairing } from '../lib/pair-code';
import { radius, space, withAlpha } from '../theme/colors';
import { useColors } from '../theme/context';

// I have their code, a page of New chat (app/chat.tsx): what the other person gave. The 8 digits
// their phone shows under Near me (lib/pair-code.ts), typed in boxes and paired as the last one is
// typed; or their contact link or invite, pasted; or their QR code, photographed.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

/** Whether this build can pair with a code: the core's pairing and Nostr's keys. */
export function canPairWithCode(): boolean {
  return canPairCode() && nostrKeys() !== null;
}

export function TheirCode({ shown, ownLink, canCode, onLink, draft, onDraft, onAdd, onScan, onPhoto }: {
  /** Whether the page shows now: closed, whatever was under way ends. */
  shown: boolean;
  ownLink: string | null;
  /** Whether this build pairs with a code of 8 digits. */
  canCode: boolean;
  /** The phone that shows the code typed here: its contact link. */
  onLink: (link: string) => void;
  /** Their link or invite, as typed or pasted, and adding it. */
  draft: string;
  onDraft: (text: string) => void;
  onAdd: () => void;
  /** Their QR code, photographed now; and from a photo there is already, where the phone has a camera too. */
  onScan: () => void;
  onPhoto?: () => void;
}) {
  const colors = useColors();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const pairing = useRef<Pairing | null>(null);
  // The digits that were last tried, so the same ones are not tried again by themselves.
  const tried = useRef('');
  const stop = () => {
    pairing.current?.stop();
    pairing.current = null;
  };
  useEffect(() => {
    if (shown) return;
    stop();
    setTyped('');
    setBusy(false);
    setNote('');
    tried.current = '';
  }, [shown]);
  useEffect(() => stop, []);

  async function pair(digits: string) {
    if (!ownLink || busy) return;
    tried.current = digits;
    // The phones meet on public Nostr relays: straight, unless the space's Tor carries Nostr, they
    // see this phone's internet address, so that is said first (lib/ip-warning.ts, 'pair').
    if (!nostrChatsThroughTor() && !(await ipGate({ network: 'Nostr', act: 'pair', of: 'pair code' }))) return;
    stop();
    setNote('');
    setBusy(true);
    let end: PairEnd;
    try {
      const under = await typeCode(digits, ownLink);
      pairing.current = under;
      end = await under.done;
      if (pairing.current !== under) return;
      pairing.current = null;
    } catch (error) {
      end = { error: errorText(error) };
    }
    setBusy(false);
    if ('link' in end) {
      setTyped('');
      onLink(end.link);
    } else if (end.error) setNote(end.error);
  }

  // The last digit typed pairs by itself, once for the same digits.
  useEffect(() => {
    if (typed.length === PAIR_DIGITS && tried.current !== typed) void pair(typed);
    if (typed.length < PAIR_DIGITS) tried.current = '';
  }, [typed]);

  function cancel() {
    stop();
    setBusy(false);
  }

  return (
    <View style={styles.page}>
      {canCode && ownLink ? (
        <View style={styles.section}>
          <Text>{t('Type the 8 digits the other phone shows.')}</Text>
          <View>
            <View style={styles.boxes} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {Array.from({ length: PAIR_DIGITS }, (_, n) => (
                <View
                  key={n}
                  style={[
                    styles.box,
                    n === PAIR_DIGITS / 2 && styles.half,
                    { borderRadius: radius.md, backgroundColor: colors.surface, borderColor: n === typed.length && !busy ? colors.primary : withAlpha(colors.border, 0.9) },
                  ]}
                >
                  <Text style={[styles.digit, font('700')]}>{typed[n] ?? ''}</Text>
                </View>
              ))}
            </View>
            {/* What is typed goes in a field over the boxes that shows nothing of its own, so the phone's keyboard, pasting and a screen reader work as in any field. */}
            <TextInput
              value={typed}
              onChangeText={(text) => setTyped(text.replace(/[^0-9]/g, '').slice(0, PAIR_DIGITS))}
              keyboardType="number-pad"
              inputMode="numeric"
              autoFocus
              editable={!busy}
              caretHidden
              maxLength={PAIR_DIGITS + 3}
              accessibilityLabel={t('Their code of 8 digits')}
              style={styles.over}
            />
          </View>
          {busy ? (
            <Row>
              <Text tone="muted" style={styles.grow}>
                {t('Waiting for the other phone…')}
              </Text>
              <TextButton title={t('Cancel')} onPress={cancel} />
            </Row>
          ) : typed.length === PAIR_DIGITS ? (
            <Button title={t('Pair')} compact onPress={() => void pair(typed)} />
          ) : null}
          {note ? <Text variant="caption">{note}</Text> : null}
        </View>
      ) : null}
      <Field label={canCode && ownLink ? t('Or their link or invite') : t('Their link or invite')}>
        <Row>
          <Input value={draft} onChangeText={onDraft} placeholder={t('Paste their contact link or invite')} autoCapitalize="none" autoCorrect={false} onSubmitEditing={onAdd} style={styles.grow} />
          <Button title={t('Add')} compact onPress={onAdd} />
        </Row>
      </Field>
      <Row wrap>
        <Button title={t('Scan their QR code')} kind="secondary" onPress={onScan} />
        {onPhoto ? <TextButton title={t('From a photo of their QR code')} onPress={onPhoto} /> : null}
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: space.lg,
  },
  section: {
    gap: space.sm,
  },
  boxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  box: {
    flex: 1,
    maxWidth: 44,
    height: 52,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The code reads as two groups of four, as the other phone shows it.
  half: {
    marginLeft: 8,
  },
  digit: {
    fontSize: 24,
    lineHeight: 30,
  },
  over: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.02,
    color: 'transparent',
  },
  grow: {
    flex: 1,
    // A browser's field otherwise keeps its own width and pushes the button beside it out.
    minWidth: 0,
  },
});
