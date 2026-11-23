// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useState } from 'react';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { inEdition } from '../lib/edition';
import { mark, t } from '../lib/i18n';
import { WIDGET_BUTTONS, setWidgetOrder, widgetOrder, type WidgetButton } from '../modules/erevos-widget';
import { radius, space, type Colors } from '../theme/colors';
import { useStyles, useTheme } from '../theme/context';
import { Card, SectionTitle, Text, TextButton } from './ui';

// Appearance → Widget: the order of the home-screen widget's four buttons, from left to right, moved
// up or down one place at a time, with the widget drawn as it will look. Android only, and the
// phone's, like the launcher icons (modules/erevos-widget).

const LABELS: Record<WidgetButton, string> = { phone: mark('Phone'), sms: 'SMS', messages: mark('Messages'), contacts: mark('Contacts') };

// The widget's own pictures (modules/erevos-widget/res/drawable), drawn as PNGs.
const PICTURES: Record<WidgetButton, ImageSourcePropType> = {
  phone: require('../assets/icon/widget/phone.png'),
  sms: require('../assets/icon/widget/sms.png'),
  messages: require('../assets/icon/widget/messages.png'),
  contacts: require('../assets/icon/widget/contacts.png'),
};

/** The Widget section, or nothing where the phone has no widget; `titled` false on a screen of its own. */
export function WidgetOrder({ titled = true }: { titled?: boolean }) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [order, setOrder] = useState(widgetOrder);
  if (!order) return null;

  function save(next: WidgetButton[]) {
    if (setWidgetOrder(next)) setOrder(next);
  }

  // The buttons this app has (Erevos Lite has no Phone or SMS, lib/edition.ts): the widget shows only them.
  const shown = order.filter((button) => (button !== 'phone' && button !== 'sms') || inEdition(button));

  function move(place: number, by: -1 | 1) {
    const other = place + by;
    if (!order || other < 0 || other >= shown.length) return;
    const a = order.indexOf(shown[place]);
    const b = order.indexOf(shown[other]);
    const next = [...order];
    [next[a], next[b]] = [next[b], next[a]];
    save(next);
  }

  const first = order.every((button, place) => button === WIDGET_BUTTONS[place]);

  return (
    <>
      {titled ? <SectionTitle title={t('Widget')} /> : null}
      <Text variant="caption" tone="muted" style={styles.hint}>
        {t("The order of the buttons on the home screen's widget, from left to right. Tap ↑ or ↓ to move a button.")}
      </Text>
      <Card>
        {shown.map((button, place) => (
          <View key={button} style={[styles.row, place > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
            <Text tone="muted" style={styles.place}>
              {place + 1}
            </Text>
            <Image source={PICTURES[button]} style={[styles.glyph, { tintColor: colors.text }]} />
            <Text style={styles.name}>{t(LABELS[button])}</Text>
            <Arrow up label={t('Move up')} disabled={place === 0} onPress={() => move(place, -1)} />
            <Arrow up={false} label={t('Move down')} disabled={place === shown.length - 1} onPress={() => move(place, 1)} />
          </View>
        ))}
      </Card>
      <Text variant="caption" tone="muted" style={styles.hint}>
        {t('This is how it will look:')}
      </Text>
      <View style={styles.widget}>
        {shown.map((button) => (
          <View key={button} style={styles.button}>
            <Image source={PICTURES[button]} style={styles.widgetGlyph} />
            <Text numberOfLines={1} style={styles.widgetLabel}>
              {t(LABELS[button])}
            </Text>
          </View>
        ))}
      </View>
      {first ? null : <TextButton title={t('First order')} onPress={() => save(WIDGET_BUTTONS)} />}
    </>
  );
}

function Arrow({ up, label, disabled, onPress }: { up: boolean; label: string; disabled: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.arrow, { backgroundColor: pressed ? colors.surfacePressed : colors.background, opacity: disabled ? 0.35 : 1 }]}
    >
      <Text style={styles.arrowText}>{up ? '↑' : '↓'}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    hint: {
      fontSize: 14,
      lineHeight: 20,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      minHeight: 52,
    },
    place: {
      width: 18,
      textAlign: 'center',
    },
    glyph: {
      width: 24,
      height: 24,
    },
    name: {
      flex: 1,
      fontSize: 16,
    },
    arrow: {
      width: 44,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    // As the widget draws itself (modules/erevos-widget/res), whatever the look.
    widget: {
      flexDirection: 'row',
      padding: 6,
      borderRadius: 24,
      backgroundColor: 'rgba(20, 20, 32, 0.9)',
    },
    button: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 6,
      gap: 4,
    },
    widgetGlyph: {
      width: 28,
      height: 28,
    },
    widgetLabel: {
      fontSize: 12,
      color: '#E9EAF2',
    },
  });
