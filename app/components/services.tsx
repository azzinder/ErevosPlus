// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type HostInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '../lock/gate';
import { tap } from '../lib/haptics';
import { plural, t } from '../lib/i18n';
import { radius, shape, space, withAlpha, type Colors } from '../theme/colors';
import { useStyles, useTheme } from '../theme/context';
import { PlusIcon } from './icons';
import { font, Text } from './ui';

// The services on home (app/index.tsx): one button under the search says which part of the list
// shows, with the services' signs, their messages not read and any that is not connected; it opens
// a window with every service as a card, each with its own number and a dot for its connection.
// A card chosen shows that part of the list, as the chips did, and a swipe to the side still goes
// to the part beside. Long lists of services fit, as the window has four to a row.

/** One part of the list: `key` as home names it (lib/inbox.ts InboxShow), its name, its messages
 *  not read, and its connection: `on`, `off` (it says what is wrong), or null when it has none. */
export type Service = { key: string; label: string; count: number; link: 'on' | 'off' | null };

/** The sign of a service: its colour and what is written on it. A Telegram folder (`tg:` and its
 *  id) has Telegram's colour and its own name's first letter. Erevos's is its moon. */
function signOf(key: string, label: string): { color: string; glyph: string } {
  if (key.startsWith('tg:')) return { color: '#2AABEE', glyph: (label.trim()[0] ?? 'T').toUpperCase() };
  switch (key) {
    case 'sms':
      return { color: '#2E8B57', glyph: 'SMS' };
    case 'matrix':
      return { color: '#0F766E', glyph: '[m]' };
    case 'xmpp':
      return { color: '#2563EB', glyph: 'X' };
    case 'nostr':
      return { color: '#7C3AED', glyph: 'N' };
    case 'public':
      return { color: '#9A6B2F', glyph: '◎' };
    case 'telegram':
      return { color: '#2AABEE', glyph: 'T' };
    case 'messenger':
      return { color: '#7B5CFF', glyph: 'M' };
    case 'signal':
      return { color: '#3A76F0', glyph: 'S' };
    case 'session':
      return { color: '#00A36C', glyph: 'S' };
    case 'facebook':
      return { color: '#1877F2', glyph: 'f' };
    default:
      return { color: '#2A2520', glyph: (label.trim()[0] ?? '?').toUpperCase() };
  }
}

export function ServiceSign({ service, size, ring }: { service: Pick<Service, 'key' | 'label'>; size: number; ring?: string }) {
  const { colors } = useTheme();
  const border = ring ? { borderWidth: 2, borderColor: ring } : null;
  if (service.key === 'all') {
    // All of them: four dots, as the window's cards are.
    const dot = size * 0.16;
    return (
      <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, border]}>
        <View style={{ width: dot * 2 + 4, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {[0, 1, 2, 3].map((n) => (
            <View key={n} style={{ width: dot, height: dot, borderRadius: dot / 4, backgroundColor: colors.onPrimary }} />
          ))}
        </View>
      </View>
    );
  }
  if (service.key === 'erevos') {
    return (
      <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#2A2520', alignItems: 'center', justifyContent: 'center' }, border]}>
        <Logo size={size * 0.72} />
      </View>
    );
  }
  const sign = signOf(service.key, service.label);
  const folder = service.key.startsWith('tg:');
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: folder ? size * 0.3 : size / 2, backgroundColor: sign.color, alignItems: 'center', justifyContent: 'center' },
        border,
      ]}
    >
      <Text color="#ffffff" style={{ fontSize: size * (sign.glyph.length > 2 ? 0.3 : sign.glyph.length > 1 ? 0.36 : 0.46), lineHeight: size * 0.6, ...font('800') }} numberOfLines={1}>
        {sign.glyph}
      </Text>
    </View>
  );
}

const count99 = (n: number) => (n > 99 ? '99+' : String(n));

/**
 * The button and its window. `current` is the part shown; `onPick` shows another; `onAdd` opens
 * where services are turned on (Settings → General → Modules); `onReadAll`, when the part shown
 * has messages not read, marks them read (lib/read-all.ts). `pages` are cards that open a page of
 * their own rather than a part of the list (Erevos+: Facebook's feed), after the services.
 */
export function Services({ services, hidden = [], pages = [], current, onPick, onAdd, onReadAll, onMove, onHide, start = 'all', onStart }: {
  services: Service[];
  /** The services hidden from home (lib/service-order.ts), offered at the window's foot to show again. */
  hidden?: Pick<Service, 'key' | 'label'>[];
  pages?: { key: string; label: string; onOpen: () => void }[];
  current: string;
  onPick: (key: string) => void;
  onAdd: () => void;
  onReadAll?: () => void;
  /** A card held down moves one place earlier (-1) or later (1), or is hidden (true) or shown again (false). */
  onMove?: (key: string, by: -1 | 1) => void;
  onHide?: (key: string, hidden: boolean) => void;
  /** The card Erevos opens on (lib/service-order.ts startPart), and choosing it when one is held. */
  start?: string;
  onStart?: (key: string) => void;
}) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  // Where the window opens: under the button, as long as it has room there.
  const [at, setAt] = useState(0);
  const button = useRef<HostInstance>(null);
  // The card held down: what can be done with it shows under the cards, until Done.
  const [held, setHeld] = useState<string | null>(null);
  const close = () => {
    setOpen(false);
    setHeld(null);
  };

  const chosen = services.find((s) => s.key === current) ?? services[0];
  const others = services.filter((s) => s.key !== 'all');
  const total = services.find((s) => s.key === 'all')?.count ?? others.reduce((sum, s) => sum + s.count, 0);
  const off = others.filter((s) => s.link === 'off');
  const shownSigns = others.slice(0, width < 380 ? 3 : 5);
  const title = chosen.key === 'all' ? t('All services') : chosen.label;
  const below = off.length > 0 ? t('{name} offline', { name: off.map((s) => s.label).join(', ') }) : plural(others.length, '{n} service', '{n} services');

  const show = () => {
    tap();
    const go = () => setOpen(true);
    if (!button.current) return go();
    button.current.measureInWindow((_x, y, _w, h) => {
      setAt(y + h + space.sm);
      go();
    });
  };
  const pick = (key: string) => {
    if (held) {
      // While a card is held, a tap chooses which card the moves are for.
      setHeld(key);
      return;
    }
    close();
    onPick(key);
  };
  const movable = services.filter((s) => s.key !== 'all');
  const heldAt = held ? movable.findIndex((s) => s.key === held) : -1;
  // All messages can be held too, only to be opened on.
  const heldOne = heldAt >= 0 ? movable[heldAt] : held === 'all' ? (services.find((s) => s.key === 'all') ?? null) : null;
  // Four to a row on a phone; on a wide screen the window is no wider than 520.
  const panel = Math.min(width - space.md * 2, 520);
  const rows = Math.ceil((services.length + pages.length + 1) / 4);
  const tall = 64 + rows * 98 + 44 + (hidden.length ? 56 : 0) + (heldOne ? 56 : 0);
  const top = at && at + tall < height - insets.bottom ? at : Math.max(insets.top + space.lg, (height - tall) / 2);

  return (
    <>
      <Pressable
        ref={button}
        onPress={show}
        accessibilityRole="button"
        accessibilityLabel={`${t('Services')}: ${title}, ${below}${total ? `, ${plural(total, '{n} unread message', '{n} unread messages')}` : ''}`}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <View style={styles.stack}>
          {(chosen.key === 'all' ? shownSigns : [chosen]).map((s, n) => (
            <View key={s.key} style={n > 0 ? { marginLeft: -9 } : null}>
              <ServiceSign service={s} size={30} ring={colors.surfaceAlt} />
            </View>
          ))}
        </View>
        <View style={styles.buttonText}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="caption" numberOfLines={1} color={off.length ? colors.danger : colors.textMuted}>
            {below}
          </Text>
        </View>
        {total ? (
          <View style={styles.badge}>
            <Text variant="caption" color={colors.onPrimary} style={styles.badgeText}>
              {count99(total)}
            </Text>
          </View>
        ) : null}
        <Chevron color={colors.textMuted} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={close} accessibilityLabel={t('Close')} />
        <View style={[styles.panel, { top, width: panel, left: (width - panel) / 2, maxHeight: height - top - insets.bottom - space.md }]}>
          <Text variant="heading" style={styles.panelTitle}>
            {t('Services')}
          </Text>
          {/* Many services: the cards scroll, and the window stays on the screen. */}
          <ScrollView style={styles.cards} contentContainerStyle={styles.grid} keyboardShouldPersistTaps="handled">
            {services.map((s) => {
              const on = s.key === current;
              return (
                <View key={s.key} style={styles.cell}>
                  <Pressable
                    onPress={() => pick(s.key)}
                    onLongPress={
                      onMove
                        ? () => {
                            tap();
                            setHeld(s.key);
                          }
                        : undefined
                    }
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={`${s.label}${s.count ? `, ${plural(s.count, '{n} unread message', '{n} unread messages')}` : ''}${s.link === 'off' ? `, ${t('Offline')}` : ''}`}
                    style={({ pressed }) => [styles.card, on && styles.cardOn, held === s.key && styles.cardHeld, pressed && styles.pressed]}
                  >
                    {s.link ? <View style={[styles.link, { backgroundColor: s.link === 'on' ? colors.success : colors.danger }]} /> : null}
                    {s.count ? (
                      <View style={[styles.badge, styles.cardBadge]}>
                        <Text variant="caption" color={colors.onPrimary} style={styles.badgeText}>
                          {count99(s.count)}
                        </Text>
                      </View>
                    ) : null}
                    <ServiceSign service={s} size={36} />
                    <Text variant="caption" numberOfLines={2} style={styles.cardLabel} color={on ? colors.accentText : colors.text}>
                      {s.key === 'all' ? t('All messages') : s.label}
                    </Text>
                    {s.link === 'off' ? (
                      <Text variant="caption" color={colors.danger} style={styles.offText} numberOfLines={1}>
                        {t('Offline')}
                      </Text>
                    ) : null}
                  </Pressable>
                </View>
              );
            })}
            {pages.map((p) => (
              <View key={p.key} style={styles.cell}>
                <Pressable
                  onPress={() => {
                    close();
                    p.onOpen();
                  }}
                  accessibilityRole="link"
                  accessibilityLabel={p.label}
                  style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                >
                  <ServiceSign service={p} size={36} />
                  <Text variant="caption" numberOfLines={2} style={styles.cardLabel} color={colors.text}>
                    {p.label}
                  </Text>
                </Pressable>
              </View>
            ))}
            <View style={styles.cell}>
              <Pressable
                onPress={() => {
                  close();
                  onAdd();
                }}
                accessibilityRole="button"
                style={({ pressed }) => [styles.card, styles.addCard, pressed && styles.pressed]}
              >
                <View style={styles.addSign}>
                  <PlusIcon color={colors.textMuted} size={18} />
                </View>
                <Text variant="caption" numberOfLines={1} tone="muted" style={styles.cardLabel}>
                  {t('Add')}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
          {heldOne ? (
            // The card held: one place earlier or later, or hidden from home.
            <View style={styles.heldRow}>
              <Text variant="label" numberOfLines={1} style={styles.heldName}>
                {heldOne.key === 'all' ? t('All messages') : heldOne.label}
              </Text>
              {onStart ? (
                <SmallButton
                  label={start === heldOne.key ? `✓ ${t('Opens first')}` : t('Opens first')}
                  hint={t('Erevos opens on this one from its icon')}
                  disabled={start === heldOne.key}
                  onPress={() => onStart(heldOne.key)}
                />
              ) : null}
              {heldOne.key !== 'all' ? (
                <>
                  <SmallButton label="‹" hint={t('Move earlier')} disabled={heldAt === 0} onPress={() => onMove?.(heldOne.key, -1)} />
                  <SmallButton label="›" hint={t('Move later')} disabled={heldAt === movable.length - 1} onPress={() => onMove?.(heldOne.key, 1)} />
                  <SmallButton
                    label={t('Hide')}
                    onPress={() => {
                      onHide?.(heldOne.key, true);
                      setHeld(null);
                    }}
                  />
                </>
              ) : null}
              <SmallButton label={t('Done')} strong onPress={() => setHeld(null)} />
            </View>
          ) : null}
          {hidden.length > 0 ? (
            <View style={styles.hiddenRow}>
              <Text variant="caption" tone="muted">
                {t('Hidden · tap one to show it again')}
              </Text>
              <View style={styles.hiddenList}>
                {hidden.map((s) => (
                  <Pressable
                    key={s.key}
                    onPress={() => onHide?.(s.key, false)}
                    accessibilityRole="button"
                    accessibilityLabel={`${s.label}, ${t('Hidden · tap one to show it again')}`}
                    style={({ pressed }) => [styles.hiddenChip, pressed && styles.pressed]}
                  >
                    <ServiceSign service={s} size={20} />
                    <Text variant="caption" numberOfLines={1}>
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
          {!heldOne && onMove ? (
            <Text variant="caption" tone="faint" style={styles.holdHint}>
              {onStart ? t('Hold a card to move it, hide it, or open Erevos on it') : t('Hold a card to move or hide it')}
            </Text>
          ) : null}
          {onReadAll && !heldOne ? (
            <Pressable
              onPress={() => {
                close();
                onReadAll();
              }}
              accessibilityRole="button"
              hitSlop={8}
              style={styles.readAll}
            >
              <Text variant="label" color={colors.accentText}>
                {t('Mark all as read')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

function SmallButton({ label, hint, onPress, disabled, strong }: { label: string; hint?: string; onPress: () => void; disabled?: boolean; strong?: boolean }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={hint ?? label}
      hitSlop={4}
      style={({ pressed }) => [styles.small, strong && { backgroundColor: colors.primary }, disabled && { opacity: 0.35 }, pressed && styles.pressed]}
    >
      <Text variant="label" color={strong ? colors.onPrimary : colors.text} style={label.length === 1 ? { fontSize: 20, lineHeight: 22 } : null}>
        {label}
      </Text>
    </Pressable>
  );
}

function Chevron({ color }: { color: string }) {
  // A "v" of two short bars, as the icons are drawn (components/icons.tsx): no icon font.
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ flexDirection: 'row', marginTop: -4 }}>
        <View style={{ width: 9, height: 2.4, borderRadius: 1.2, backgroundColor: color, transform: [{ translateX: 1.6 }, { rotate: '45deg' }] }} />
        <View style={{ width: 9, height: 2.4, borderRadius: 1.2, backgroundColor: color, transform: [{ translateX: -1.6 }, { rotate: '-45deg' }] }} />
      </View>
    </View>
  );
}

/** A section's title in the list (Unread, Recent), with a word to tap on its right. */
export function ListSection({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text variant="overline" tone="muted" accessibilityRole="header">
        {title}
      </Text>
      {action && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text variant="caption" color={colors.accentText} style={font('600')}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      minHeight: 54,
      paddingVertical: space.sm,
      paddingLeft: space.sm + 2,
      paddingRight: space.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceAlt,
      borderWidth: shape.cardBorder > 1 || shape.glass ? 1 : 0,
      borderColor: colors.border,
    },
    pressed: {
      backgroundColor: colors.surfacePressed,
    },
    stack: {
      flexDirection: 'row',
    },
    buttonText: {
      flex: 1,
      minWidth: 0,
      gap: 1,
    },
    badge: {
      minWidth: 22,
      height: 22,
      paddingHorizontal: 6,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    badgeText: {
      fontSize: 12,
      ...font('700'),
    },
    panel: {
      position: 'absolute',
      padding: space.md,
      paddingTop: space.lg,
      borderRadius: radius.xl,
      backgroundColor: colors.popover,
      borderWidth: 1,
      borderColor: withAlpha(colors.border, 0.8),
      boxShadow: `0px 12px 40px ${withAlpha('#000000', 0.45)}`,
    },
    panelTitle: {
      paddingHorizontal: space.xs,
      paddingBottom: space.sm,
    },
    cards: {
      flexGrow: 0,
      flexShrink: 1,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -3,
    },
    cell: {
      width: '25%',
      padding: 3,
    },
    card: {
      alignItems: 'center',
      gap: 4,
      minHeight: 88,
      paddingTop: space.sm + 2,
      paddingBottom: space.sm,
      paddingHorizontal: 2,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceAlt,
    },
    cardOn: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: withAlpha(colors.primary, 0.16),
    },
    cardLabel: {
      maxWidth: '100%',
      textAlign: 'center',
      fontSize: 12,
      ...font('600'),
    },
    cardBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 19,
      height: 19,
      paddingHorizontal: 4,
    },
    link: {
      position: 'absolute',
      top: 8,
      left: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    offText: {
      fontSize: 10.5,
      marginTop: -3,
      ...font('700'),
    },
    addCard: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    addSign: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardHeld: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.accentText,
    },
    heldRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: space.xs + 2,
      marginTop: space.sm,
      paddingTop: space.sm,
      borderTopWidth: 1,
      borderTopColor: withAlpha(colors.border, 0.7),
    },
    heldName: {
      flex: 1,
      minWidth: 80,
    },
    small: {
      minWidth: 38,
      height: 36,
      paddingHorizontal: space.sm + 2,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
    },
    hiddenRow: {
      gap: space.xs + 2,
      marginTop: space.sm,
      paddingTop: space.sm,
      borderTopWidth: 1,
      borderTopColor: withAlpha(colors.border, 0.7),
    },
    hiddenList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space.xs + 2,
    },
    hiddenChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 4,
      paddingLeft: 4,
      paddingRight: space.sm + 2,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      opacity: 0.85,
    },
    holdHint: {
      paddingTop: space.sm,
      paddingHorizontal: space.xs,
    },
    readAll: {
      alignSelf: 'flex-end',
      paddingTop: space.md,
      paddingHorizontal: space.xs,
    },
    section: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: space.md,
      paddingBottom: space.xs,
    },
  });
