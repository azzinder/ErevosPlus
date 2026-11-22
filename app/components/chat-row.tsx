// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { press } from '../lib/haptics';
import { SERVICE_NAMES } from '../lib/messenger';
import { msgCaseOnly, openMessengerCase } from '../lib/messenger-store';
import { t } from '../lib/i18n';
import { rowTime, shownName, type InboxRow } from '../lib/inbox';
import { laterLabel } from '../lib/later';
import { notesSummary, type Note } from '../lib/myself';
import { radius, space, withAlpha, type Colors } from '../theme/colors';
import { useStyles, useTheme } from '../theme/context';

import { BellIcon, LockIcon, PinIcon, QuietIcon, TimerIcon } from './icons';
import { KeyFace } from './key-face';
import { MyselfFace } from './myself-face';
import { NetworkPicture } from './network-picture';
import { font, Text } from './ui';

const MARKS = ['✓', '✓✓', '✓✓✓'];

// A name's first letter or digit, in capitals; empty for a name with none (only symbols, say).
const initial = (name: string) => (name.match(/[\p{L}\p{N}]/u)?.[0] ?? '').toLocaleUpperCase();

/** A chat's row in a list of chats, as home has it (app/index.tsx) and hidden chats too
 *  (app/chat.tsx): tapped, it opens its chat, or does `onOpen` where one is given. In hidden chats
 *  (`hidden`), the chat of a network opens for the hidden place's own account (lib/network-place.ts). */
export function ChatRow({
  row,
  now,
  online = false,
  hidden = false,
  onLong,
  onOpen,
}: {
  row: InboxRow;
  now: number;
  online?: boolean;
  hidden?: boolean;
  onLong?: () => void;
  onOpen?: () => void;
}) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [photoFailed, setPhotoFailed] = useState(false);
  const name = shownName(row);
  // What makes a network's screen the hidden place's own: after its other parameters, or alone.
  const place = hidden ? '&hidden=1' : '';
  const placeOnly = hidden ? '?hidden=1' : '';
  const preview = row.locked ? t('Locked with a PIN') : row.draft || row.last || (row.imported ? t('Imported chat, goes on here') : t('No messages yet'));
  return (
    <Pressable
      onLongPress={
        onLong
          ? () => {
              press();
              onLong();
            }
          : undefined
      }
      onPress={
        onOpen ??
        (() =>
          // Messenger in its case: the chat opens there (its screen here, if the case cannot open).
          row.network === 'messenger' && msgCaseOnly('messenger')
            ? void openMessengerCase(row.identity.slice('messenger:'.length)).catch(() => router.push('/messenger'))
            : router.push(
            row.sms
              ? `/sms?to=${encodeURIComponent(row.sms)}`
              : row.network === 'matrix'
                ? row.invited
                  ? `/matrix${placeOnly}`
                  : `/matrix-chat?room=${encodeURIComponent(row.identity.slice('matrix:'.length))}${place}`
                : row.network === 'xmpp'
                  ? row.invited
                    ? `/xmpp${placeOnly}`
                    : `/xmpp-chat?jid=${encodeURIComponent(row.identity.slice('xmpp:'.length))}${place}`
                  : row.network === 'telegram'
                    ? row.tgKept
                      ? `/telegram-chat?id=${encodeURIComponent(row.identity.slice('telegram-kept:'.length))}&kept=1`
                      : `/telegram-chat?id=${encodeURIComponent(row.identity.slice('telegram:'.length))}${place}`
                    : row.network === 'messenger' || row.network === 'signal' || row.network === 'session'
                    ? `/${row.network}-chat?key=${encodeURIComponent(row.identity.slice(row.network.length + 1))}`
                    : row.network === 'nostr'
                    ? `/nostr-chat?key=${row.identity.slice('nostr:'.length)}${place}`
                    : row.identity.startsWith('group:')
                      ? `/group?id=${row.identity.slice(6)}`
                      : `/chat?contact=${row.identity}`,
          ))
      }
      accessibilityRole="button"
      accessibilityLabel={`${name}${online ? t(', online') : ''}${row.unread ? t(', {n} not read', { n: row.unread }) : ''}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {row.sms && row.photo && !photoFailed ? (
        // The picture the phone's contacts have for the number, read from them as it shows.
        <Image source={{ uri: row.photo }} style={styles.smsFace} onError={() => setPhotoFailed(true)} accessibilityIgnoresInvertColors />
      ) : row.network === 'matrix' || row.network === 'xmpp' ? (
        <NetworkPicture
          network={row.network}
          of={row.network === 'matrix' ? row.picture : row.identity.slice('xmpp:'.length)}
          size={52}
          fallback={row.network === 'xmpp' ? 'xmpp' : '[m]'}
          where={hidden ? 'place' : 'space'}
        />
      ) : row.sms || row.network ? (
        <View style={styles.smsFace}>
          {(row.network === 'telegram' || row.network === 'messenger' || row.network === 'signal' || row.network === 'session') && initial(name) ? (
            // A Telegram, Messenger, Signal or Session chat's face is its name's first letter, so its rows tell apart at a glance.
            <Text variant="title" tone="muted">
              {initial(name)}
            </Text>
          ) : (
            <Text variant="label" tone="muted">
              {row.sms ? 'SMS' : row.network === 'nostr' ? 'nostr' : row.network === 'telegram' ? 'TG' : '[m]'}
            </Text>
          )}
        </View>
      ) : (
        <View>
          <KeyFace identity={row.identity.startsWith('group:') ? row.identity.slice(6) : row.identity} name={row.name} size={52} avatar={row.avatar} />
          {online ? <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.background }]} /> : null}
        </View>
      )}
      <View style={styles.rowBody}>
        <View style={styles.rowLine}>
          <Text variant="bodyStrong" numberOfLines={1} style={[styles.rowName, !row.name && styles.mono]}>
            {name}
          </Text>
          {row.pinned ? <PinIcon color={colors.textFaint} size={13} /> : null}
          <Text variant="caption" color={row.unread ? colors.accentText : colors.textFaint}>
            {rowTime(row.at, now)}
          </Text>
        </View>
        <View style={styles.rowLine}>
          <View style={styles.previewLine}>
            {row.locked ? <LockIcon color={colors.textMuted} size={13} /> : null}
            {row.muted ? <QuietIcon color={colors.textMuted} size={13} /> : null}
            {row.timer ? <TimerIcon color={colors.textMuted} size={13} /> : null}
            {row.draft && !row.locked ? (
              <Text variant="caption" color={colors.danger}>
                {t('Draft')}
              </Text>
            ) : row.lastSms ? (
              <Text variant="caption" color={colors.warning}>
                SMS
              </Text>
            ) : row.network === 'matrix' ? (
              <Text variant="caption" color={colors.success}>
                Matrix
              </Text>
            ) : row.network === 'xmpp' ? (
              <Text variant="caption" color={colors.success}>
                XMPP
              </Text>
            ) : row.network === 'telegram' ? (
              <Text variant="caption" color={colors.success}>
                Telegram
              </Text>
            ) : row.network === 'messenger' || row.network === 'signal' || row.network === 'session' ? (
              <Text variant="caption" color={colors.success}>
                {SERVICE_NAMES[row.network]}
              </Text>
            ) : row.network === 'nostr' ? (
              <Text variant="caption" color={colors.success}>
                Nostr
              </Text>
            ) : null}
            {row.last && row.mine && !row.lastSms && !row.draft ? (
              <Text variant="caption" color={row.mark === 2 ? colors.accentText : colors.textMuted}>
                {row.mark < 0 ? t('Waiting') : MARKS[row.mark]}
              </Text>
            ) : null}
            <Text
              numberOfLines={1}
              variant="caption"
              tone={row.unread ? undefined : 'muted'}
              style={[styles.preview, !row.last && styles.italic, row.unread ? styles.previewUnread : null]}
            >
              {preview}
            </Text>
          </View>
          {row.unread ? (
            <View style={styles.badge}>
              <Text variant="caption" color={colors.onPrimary} style={styles.badgeText}>
                {row.unread > 99 ? '99+' : row.unread}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

// Chat with myself's row, at the top of the chats: its last note, or the reminders that came and
// were not read yet, in amber with their number, as a chat's unread messages are counted. It draws
// again when the next reminder's time comes. Tapped, it opens the space's, or does `onOpen`.
export function MyselfRow({ notes, onOpen }: { notes: Note[]; onOpen?: () => void }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [now, setNow] = useState(Date.now());
  const { last, due, next } = notesSummary(notes, now);
  useEffect(() => {
    if (next === null) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(next - Date.now() + 500, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [next]);
  const line = (note: Note) => note.text.split('\n')[0] || (note.voice ? t('Voice message') : (note.file?.name ?? ''));
  const shown = due.length > 0 ? due[due.length - 1] : last;
  const preview = shown ? line(shown) : t('Notes, links and reminders only you see');
  return (
    <Pressable
      onPress={onOpen ?? (() => router.push('/myself'))}
      accessibilityRole="button"
      accessibilityLabel={`${t('Chat with myself')}${due.length ? `, ${t('Reminders')}: ${due.length}` : ''}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <MyselfFace size={52} />
      <View style={styles.rowBody}>
        <View style={styles.rowLine}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.rowName}>
            {t('Chat with myself')}
          </Text>
          <PinIcon color={colors.textFaint} size={13} />
          {last ? (
            <Text variant="caption" color={due.length ? colors.warning : colors.textFaint}>
              {rowTime(due.length ? due[due.length - 1].due! : last.at, now)}
            </Text>
          ) : null}
        </View>
        <View style={styles.rowLine}>
          <View style={styles.previewLine}>
            {due.length || (shown?.due !== undefined && shown.due > now) ? <BellIcon color={due.length ? colors.warning : colors.textMuted} size={13} /> : null}
            <Text
              numberOfLines={1}
              variant="caption"
              tone={due.length ? undefined : 'muted'}
              color={due.length ? colors.warning : undefined}
              style={[styles.preview, !shown && styles.italic, due.length ? styles.previewUnread : null]}
            >
              {shown?.due !== undefined && shown.due > now ? `${laterLabel(shown.due)} · ${preview}` : preview}
            </Text>
          </View>
          {due.length ? (
            <View style={[styles.badge, { backgroundColor: colors.warning }]}>
              <Text variant="caption" color="#ffffff" style={styles.badgeText}>
                {due.length > 99 ? '99+' : due.length}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingVertical: space.sm + 2,
      paddingHorizontal: space.sm,
      marginHorizontal: -space.sm,
      borderRadius: radius.lg,
    },
    pressed: {
      backgroundColor: colors.surfacePressed,
    },
    smsFace: {
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: withAlpha(colors.border, 0.6),
    },
    onlineDot: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 2,
    },
    rowBody: {
      flex: 1,
      gap: 3,
    },
    rowLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space.sm,
    },
    rowName: {
      flex: 1,
    },
    mono: {
      fontFamily: 'monospace',
      fontSize: 14,
    },
    previewLine: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    preview: {
      flex: 1,
      fontSize: 14,
    },
    previewUnread: {
      ...font('600'),
    },
    italic: {
      fontStyle: 'italic',
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
  });
