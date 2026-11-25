// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CheckIcon, ChevronIcon, GlobeIcon } from './icons';
import { Button, buttonColors, Field, Input, Row, Text } from './ui';
import { t } from '../lib/i18n';
import { MAX_NAME } from '../lock/e2e-data';
import { radius, space, withAlpha } from '../theme/colors';
import { useColors } from '../theme/context';

// New chat (app/chat.tsx, with no chat open) asks one thing, where the other person is, and each
// answer is a page of its own: Near me (components/near-me.tsx), Far away (an invite to send,
// components/welcome-invite.tsx) and I have their code (components/their-code.tsx). All three end
// on the same page, You are connected. The rest of New chat, this phone's own link, who is blocked
// and what is for advanced users, waits behind three small buttons under them.
//
// The question is a quiet line and the answers are what the page is: three large doors, the first
// lit in the look's own colour, as the way for the one beside you is the one most take.

/** The pages of New chat: its first one, the three doors, where they end, and the rest. */
export type Door = 'root' | 'near' | 'far' | 'code' | 'done' | 'link' | 'blocked' | 'advanced';

const WHITE = '#ffffff';

// Two phones side by side, for Near me.
function NearSign({ size = 26, color = WHITE }: { size?: number; color?: string }) {
  const k = size / 22;
  const phone = (x: number, y: number) => (
    <View style={{ position: 'absolute', left: x * k, top: y * k, width: 8.5 * k, height: 15 * k, borderWidth: 1.9 * k, borderColor: color, borderRadius: 2.4 * k }} />
  );
  return (
    <View style={{ width: size, height: size }}>
      {phone(1.5, 5.5)}
      {phone(12, 1.5)}
    </View>
  );
}

// The keys of a keypad, for a code typed.
function CodeSign({ size = 26, color = WHITE }: { size?: number; color?: string }) {
  const k = size / 22;
  return (
    <View style={{ width: size, height: size }}>
      {[0, 1, 2].flatMap((row) =>
        [0, 1, 2].map((column) => (
          <View key={`${row}-${column}`} style={{ position: 'absolute', left: (2.5 + column * 6.6) * k, top: (2.5 + row * 6.6) * k, width: 3.8 * k, height: 3.8 * k, borderRadius: 1.2 * k, backgroundColor: color }} />
        )),
      )}
    </View>
  );
}

// A door: its sign in a tile, what it is, and one line of what it does. `lit`: the first of them,
// drawn as the look draws its main button (filled, or in Nocturne outlined), the others as cards.
function DoorCard({ lit = false, sign, title, line, onPress }: {
  lit?: boolean;
  sign: (color: string) => ReactNode;
  title: string;
  line: string;
  onPress: () => void;
}) {
  const colors = useColors();
  const main = buttonColors('primary', colors);
  const ink = lit ? main.fg : colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${line}`}
      style={({ pressed }) => [
        styles.door,
        {
          borderRadius: radius.lg,
          backgroundColor: lit ? (pressed ? main.pressed : main.bg) : colors.surface,
          borderColor: lit ? (main.line ?? 'transparent') : withAlpha(colors.border, 0.6),
        },
        pressed && !lit && styles.pressed,
      ]}
    >
      <View style={[styles.doorSign, { borderRadius: radius.md, backgroundColor: lit ? withAlpha(ink, 0.16) : colors.surfaceAlt }]}>{sign(lit ? ink : colors.accentText)}</View>
      <View style={styles.grow}>
        <Text variant="heading" color={ink}>
          {title}
        </Text>
        <Text variant="caption" color={lit ? withAlpha(ink, 0.82) : colors.textMuted}>
          {line}
        </Text>
      </View>
      <ChevronIcon color={lit ? withAlpha(ink, 0.7) : colors.textFaint} />
    </Pressable>
  );
}

/** Where is the other person: the three doors. `invites`: whether Far away sends an invite, or only this phone's contact link. */
export function Doors({ invites, onOpen }: { invites: boolean; onOpen: (door: 'near' | 'far' | 'code') => void }) {
  return (
    <View style={styles.doors}>
      <Text variant="bodyStrong" tone="muted" accessibilityRole="header" style={styles.question}>
        {t('Where is the other person?')}
      </Text>
      <DoorCard
        lit
        sign={(color) => <NearSign color={color} />}
        title={t('Near me')}
        line={t('The two phones find each other by themselves, or with a code on the screen.')}
        onPress={() => onOpen('near')}
      />
      <DoorCard
        sign={(color) => <GlobeIcon color={color} size={26} />}
        title={t('Far away')}
        line={invites ? t('Send an invite with any app: they tap the link, and they are in.') : t('Send your contact link with any app: they add you with it.')}
        onPress={() => onOpen('far')}
      />
      <DoorCard
        sign={(color) => <CodeSign color={color} />}
        title={t('I have their code')}
        line={t('8 digits, a link or a QR code they gave you.')}
        onPress={() => onOpen('code')}
      />
    </View>
  );
}

/** The rest of New chat, under the doors: small buttons side by side, each opening its page. */
export function Rest({ rows }: { rows: { title: string; onPress: () => void }[] }) {
  const colors = useColors();
  return (
    <View style={styles.rest}>
      {rows.map((row) => (
        <Pressable
          key={row.title}
          onPress={row.onPress}
          accessibilityRole="button"
          style={({ pressed }) => [styles.restChip, { borderRadius: radius.chip, backgroundColor: pressed ? colors.surfacePressed : colors.surfaceAlt }]}
        >
          <Text variant="label" numberOfLines={1}>
            {row.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/**
 * You are connected, where every door ends: the contact's face, the name they take in the chats
 * here, which the other phone may have said and the owner may change, then writing to them or
 * adding someone else.
 */
export function Joined({ face, name, onName, onWrite, onAnother, children }: {
  face: ReactNode;
  /** Their name here now: what the field starts with. */
  name: string;
  /** The name as typed, kept as the field is left. */
  onName: (name: string) => void;
  onWrite: () => void;
  onAnother: () => void;
  children?: ReactNode;
}) {
  const colors = useColors();
  const [typed, setTyped] = useState(name);
  // The name may come a moment after the page: taken while nothing was typed over it.
  useEffect(() => setTyped(name), [name]);
  const keep = () => {
    if (typed.trim() !== name.trim()) onName(typed.trim());
  };
  return (
    <View style={styles.joined}>
      <View style={styles.faceBox}>
        {face}
        <View style={[styles.check, { backgroundColor: colors.success, borderColor: colors.background }]}>
          <CheckIcon color={WHITE} size={14} />
        </View>
      </View>
      <Text variant="title" style={styles.center} accessibilityRole="header">
        {t('You are connected')}
      </Text>
      <Text tone="muted" style={styles.center}>
        {t('What you write to each other is end-to-end encrypted.')}
      </Text>
      <View style={styles.stretch}>
        <Field label={t('Their name in your chats')}>
          <Input value={typed} onChangeText={setTyped} onEndEditing={keep} onSubmitEditing={keep} placeholder={t('Name')} maxLength={MAX_NAME} autoCorrect={false} />
        </Field>
      </View>
      {children}
      <Row wrap style={styles.buttons}>
        <Button
          title={t('Write a message')}
          onPress={() => {
            keep();
            onWrite();
          }}
        />
        <Button
          title={t('Add someone else')}
          kind="secondary"
          onPress={() => {
            keep();
            onAnother();
          }}
        />
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  doors: {
    gap: space.md,
  },
  question: {
    paddingHorizontal: space.xs,
  },
  door: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 92,
    padding: space.lg,
    borderWidth: 1,
  },
  doorSign: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rest: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    paddingTop: space.xs,
  },
  restChip: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  joined: {
    alignItems: 'center',
    gap: space.sm,
    paddingTop: space.lg,
  },
  faceBox: {
    padding: 4,
  },
  check: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  stretch: {
    alignSelf: 'stretch',
  },
  buttons: {
    justifyContent: 'center',
  },
});
