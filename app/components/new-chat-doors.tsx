// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { WayCard } from './connect-cards';
import { CheckIcon, ChevronIcon, GlobeIcon } from './icons';
import { Button, Field, Input, Row, Text } from './ui';
import { t } from '../lib/i18n';
import { MAX_NAME } from '../lock/e2e-data';
import { radius, space, withAlpha } from '../theme/colors';
import { useColors } from '../theme/context';

// New chat (app/chat.tsx, with no chat open) asks one thing, where the other person is, and each
// answer is a page of its own: Near me (components/near-me.tsx), Far away (an invite to send,
// components/welcome-invite.tsx) and I have their code (components/their-code.tsx). All three end
// on the same page, You are connected. The rest of New chat, this phone's own link, who is blocked
// and what is for advanced users, waits behind three small rows under them.

/** The pages of New chat: its first one, the three doors, where they end, and the rest. */
export type Door = 'root' | 'near' | 'far' | 'code' | 'done' | 'link' | 'blocked' | 'advanced';

const WHITE = '#ffffff';

// Two phones side by side, for Near me.
function NearSign({ size = 22 }: { size?: number }) {
  const k = size / 22;
  const phone = (x: number, y: number) => (
    <View style={{ position: 'absolute', left: x * k, top: y * k, width: 8.5 * k, height: 15 * k, borderWidth: 1.9 * k, borderColor: WHITE, borderRadius: 2.4 * k }} />
  );
  return (
    <View style={{ width: size, height: size }}>
      {phone(1.5, 5.5)}
      {phone(12, 1.5)}
    </View>
  );
}

// The keys of a keypad, for a code typed.
function CodeSign({ size = 22 }: { size?: number }) {
  const k = size / 22;
  return (
    <View style={{ width: size, height: size }}>
      {[0, 1, 2].flatMap((row) =>
        [0, 1, 2].map((column) => (
          <View key={`${row}-${column}`} style={{ position: 'absolute', left: (2.5 + column * 6.6) * k, top: (2.5 + row * 6.6) * k, width: 3.8 * k, height: 3.8 * k, borderRadius: 1.2 * k, backgroundColor: WHITE }} />
        )),
      )}
    </View>
  );
}

/** Where is the other person: the three doors. `invites`: whether Far away sends an invite, or only this phone's contact link. */
export function Doors({ invites, onOpen }: { invites: boolean; onOpen: (door: 'near' | 'far' | 'code') => void }) {
  return (
    <View style={styles.doors}>
      <Text variant="title">{t('Where is the other person?')}</Text>
      <WayCard
        tint="green"
        sign={<NearSign />}
        title={t('Near me')}
        line={t('The two phones find each other by themselves, or with a code on the screen.')}
        open={false}
        onPress={() => onOpen('near')}
      />
      <WayCard
        tint="blue"
        sign={<GlobeIcon color={WHITE} size={22} />}
        title={t('Far away')}
        line={invites ? t('Send an invite with any app: they tap the link, and they are in.') : t('Send your contact link with any app: they add you with it.')}
        open={false}
        onPress={() => onOpen('far')}
      />
      <WayCard
        tint="violet"
        sign={<CodeSign />}
        title={t('I have their code')}
        line={t('8 digits, a link or a QR code they gave you.')}
        open={false}
        onPress={() => onOpen('code')}
      />
    </View>
  );
}

/** The rest of New chat, under the doors: small rows, each opening its page. */
export function Rest({ rows }: { rows: { title: string; onPress: () => void }[] }) {
  const colors = useColors();
  return (
    <View style={[styles.rest, { borderRadius: radius.lg, backgroundColor: colors.surface, borderColor: withAlpha(colors.border, 0.6) }]}>
      {rows.map((row, n) => (
        <Pressable
          key={row.title}
          onPress={row.onPress}
          accessibilityRole="button"
          style={({ pressed }) => [styles.restRow, n > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }, pressed && styles.pressed]}
        >
          <Text numberOfLines={1} style={styles.grow}>
            {row.title}
          </Text>
          <ChevronIcon color={colors.textFaint} />
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
    gap: space.sm,
  },
  rest: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 48,
    paddingHorizontal: space.md,
  },
  grow: {
    flex: 1,
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
