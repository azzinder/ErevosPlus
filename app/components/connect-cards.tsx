// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Reach } from '../lib/connect-reach';
import { t } from '../lib/i18n';
import { radius, space, withAlpha } from '../theme/colors';
import { useColors } from '../theme/context';

import { ChevronIcon, PersonIcon } from './icons';
import { QrCode } from './QrCode';
import { Tile, type TileTint } from './shortcut-tile';
import { Button, Row, Text, TextButton } from './ui';

// The parts of New chat (app/chat.tsx, with no chat open) that say how this phone connects: a card
// with how its contacts reach it now, in plain words, and the ways in for a phone with no relay yet,
// each a card with a coloured tile that opens what it needs under it.

/** How this phone connects now: `title`, then `line` in plain words, `detail` (the relay's address) small under it. */
export function ConnectStatus({ reach, title, line, detail, children }: {
  reach: Reach;
  title: string;
  line: string;
  detail?: string;
  children?: ReactNode;
}) {
  const colors = useColors();
  const tint = reach === 'ready' ? colors.success : reach === 'part' ? colors.warning : colors.textFaint;
  return (
    <View style={[styles.status, { borderRadius: radius.lg, backgroundColor: withAlpha(tint, 0.1), borderColor: withAlpha(tint, 0.4) }]}>
      <Text variant="caption" tone="muted">
        {t('How you connect now')}
      </Text>
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: tint }]} />
        <Text variant="heading" style={styles.grow}>
          {title}
        </Text>
      </View>
      <Text tone="muted">{line}</Text>
      {detail ? (
        <Text variant="caption" tone="muted" numberOfLines={1} style={styles.mono}>
          {detail}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/** A way in: its tile and sign, what it is and one line of what it does; tapped, it opens `children` under it. */
export function WayCard({ tint, sign, title, line, open, onPress, children }: {
  tint: TileTint;
  sign: ReactNode;
  title: string;
  line: string;
  open: boolean;
  onPress: () => void;
  children?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={[styles.way, { borderRadius: radius.lg, backgroundColor: colors.surface, borderColor: open ? withAlpha(colors.primary, 0.6) : withAlpha(colors.border, 0.6) }]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.wayHead, pressed && styles.pressed]}
      >
        <Tile tint={tint} size={44}>
          {sign}
        </Tile>
        <View style={styles.grow}>
          <Text variant="label">{title}</Text>
          <Text variant="caption" tone="muted">
            {line}
          </Text>
        </View>
        <ChevronIcon color={colors.textFaint} down={open} />
      </Pressable>
      {open && children ? <View style={styles.wayBody}>{children}</View> : null}
    </View>
  );
}

const WHITE = '#ffffff';

/**
 * This phone's own QR code (#12), on My link, a page of New chat: whoever scans it adds
 * this phone. Under it, scanning theirs, sharing the link, and a photo of their QR code. `text`
 * null while it is not ready yet. `children` go under the buttons (NFC, the large code).
 */
export function MyQrCard({ text, onScan, onShare, shareTitle, onPhoto, children }: {
  text: string | null;
  onScan?: () => void;
  onShare: () => void;
  shareTitle: string;
  onPhoto: () => void;
  children?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={[styles.qrCard, { borderRadius: radius.lg, backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text variant="heading">{t('Your QR code')}</Text>
      <View style={styles.qrBox}>
        {text ? <QrCode text={text} size={200} /> : <Text tone="muted">{t('Getting it ready…')}</Text>}
      </View>
      <Text variant="caption" tone="muted" style={styles.center}>
        {t('They scan it with the camera, and you are each other’s contacts at once.')}
      </Text>
      <Row wrap style={styles.qrButtons}>
        {onScan ? <Button title={t('Scan theirs')} onPress={onScan} /> : null}
        <Button title={shareTitle} kind="secondary" onPress={onShare} />
      </Row>
      <TextButton title={t('From a photo of their QR code')} onPress={onPhoto} />
      {children}
    </View>
  );
}

/** A row that opens what it says, with a person and a plus: on New chat, an invite for someone with no Erevos yet. */
export function InviteRow({ title, line, onPress }: { title: string; line: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title} ${line}`}
      style={({ pressed }) => [styles.inviteRow, { borderRadius: radius.lg, backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}
    >
      <PersonIcon color={colors.primary} size={22} />
      <View style={styles.grow}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" tone="muted">
          {line}
        </Text>
      </View>
      <ChevronIcon color={colors.textMuted} />
    </Pressable>
  );
}

/** A QR code, white unless `color` is given: its three corner squares and a few dots, for the tile of an invite. */
export function QrSign({ size = 20, color = WHITE }: { size?: number; color?: string }) {
  const k = size / 20;
  const corner = (x: number, y: number) => (
    <View
      key={`${x}-${y}`}
      style={{ position: 'absolute', left: x * k, top: y * k, width: 8 * k, height: 8 * k, borderWidth: 2 * k, borderColor: color, borderRadius: 2 * k, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{ width: 2 * k, height: 2 * k, backgroundColor: color }} />
    </View>
  );
  const dot = (x: number, y: number) => <View key={`${x}:${y}`} style={{ position: 'absolute', left: x * k, top: y * k, width: 3 * k, height: 3 * k, backgroundColor: color }} />;
  return (
    <View style={{ width: size, height: size }}>
      {[corner(0, 0), corner(12, 0), corner(0, 12)]}
      {[dot(12, 12), dot(17, 12), dot(14.5, 14.5), dot(12, 17), dot(17, 17)]}
    </View>
  );
}

// The corners are the look's, so they are given where they are drawn (theme/colors.ts radius).
const styles = StyleSheet.create({
  status: {
    gap: 6,
    padding: space.md,
    borderWidth: 1,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  grow: {
    flex: 1,
  },
  mono: {
    fontFamily: 'monospace',
  },
  way: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  wayHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    minHeight: 64,
  },
  wayBody: {
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingBottom: space.md,
  },
  pressed: {
    opacity: 0.7,
  },
  center: {
    textAlign: 'center',
  },
  qrCard: {
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderWidth: 1,
  },
  qrBox: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtons: {
    justifyContent: 'center',
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderWidth: 1,
    minHeight: 64,
  },
});
