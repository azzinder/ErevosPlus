// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, PermissionsAndroid, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ask } from '../lib/alert';
import { hasCore } from '../lib/core';
import { t } from '../lib/i18n';
import { buildInbox, filterInbox, shownName, type InboxRow } from '../lib/inbox';
import { spaceChats } from '../lib/space-chats';
import { arrangeRows, onSmsOrderChanged, sortSms } from '../lib/sms-folders';
import { smsAddress, smsNumbers } from '../lib/sms-group';
import { sameNumber } from '../lib/sms-invite';
import { SmsLink } from '../lib/sms-link';
import { NO_SMS, smsRows, type SmsList } from '../lib/sms-rows';
import { onSmsEvent, smsStatus, waitingMms } from '../modules/erevos-sms';
import { useLock } from '../lock/context';
import { Logo } from '../lock/gate';
import { currentSpace } from '../lock/keys';
import { radius, space, withAlpha, type Colors } from '../theme/colors';
import { useStyles, useTheme } from '../theme/context';
import { ChatRow } from './chat-row';
import { PlusIcon, SearchIcon } from './icons';
import { KeyboardPaddedView } from './keyboard';
import { LockSign, ShortcutTile } from './shortcut-tile';
import { SmsActions, type SmsTarget } from './sms-actions';
import { SmsRecipient } from './sms-recipient';
import { Button, Chip, fontStyle, Row, Sheet, Text } from './ui';
import { UndoBar } from './undo-bar';

// The home screen when the password was given for the SMS (their icon, the widget's SMS button, an
// SMS notice; app/_layout.tsx): the phone's SMS conversations alone, each with a row of its own,
// also those with a number of one of the space's contacts, and nothing else of the space. A
// conversation, its folders and a new SMS open from here; everything else, and the orange
// padlock, asks for the password again, which then opens all of the space.

export function SmsHome() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const lock = useLock();
  const [rows, setRows] = useState<InboxRow[] | null>(null);
  const [now, setNow] = useState(Date.now());
  const [query, setQuery] = useState('');
  const [folders, setFolders] = useState({ archived: 0, spam: 0, trash: 0 });
  // The MMS waiting at the phone company for a tap (MmsStore.kt), also from numbers with no conversation yet.
  const [atCarrier, setAtCarrier] = useState(0);
  const [target, setTarget] = useState<SmsTarget | null>(null);
  const [writing, setWriting] = useState(false);
  const [number, setNumber] = useState('');
  const [note, setNote] = useState('');
  const [again, setAgain] = useState(0);
  const names = useRef(NO_SMS.names);
  const isApp = !!smsStatus()?.isDefault;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const { space: current, key } = currentSpace();
      // The numbers of the space's contacts, which no spam filter sends to Spam, as on the home screen.
      const phones = (): Promise<string[]> =>
        hasCore()
          ? spaceChats()
              .then(({ e2e }) => e2e.phones().map((p) => p.phone))
              .catch(() => [])
          : Promise.resolve([]);
      const load = () => {
        if (!isApp) {
          setRows([]);
          return;
        }
        void Promise.all([smsRows(current, key).catch((): SmsList => NO_SMS), phones()]).then(([sms, known]) => {
          if (!active) return;
          names.current = sms.names;
          const order = sms.order;
          const sorted = order ? sortSms(sms.threads, order, sms.blocked, (s) => !!s.name || known.some((p) => sameNumber(p, s.address))) : null;
          const at = Date.now();
          const list = buildInbox([], [], [], at, sorted?.list ?? sms.threads);
          setFolders({ archived: sorted?.archived.length ?? 0, spam: sorted?.spam.length ?? 0, trash: order?.trash.length ?? 0 });
          setAtCarrier(waitingMms().length);
          setNow(at);
          setRows(order ? arrangeRows(list, order.pinned, order.drafts) : list);
        });
      };
      load();
      const sms = onSmsEvent('onSms', load);
      const stopOrder = onSmsOrderChanged(load);
      return () => {
        active = false;
        sms?.remove();
        stopOrder();
      };
    }, [isApp, again]),
  );

  const shown = useMemo(() => filterInbox(rows ?? [], query), [rows, query]);

  // The names of the numbers, on or off, as on the home screen (Android asks first).
  async function toggleNames() {
    const on = !names.current;
    if (on && Platform.OS === 'android') {
      const answer = await PermissionsAndroid.request('android.permission.READ_CONTACTS').catch(() => null);
      if (answer !== PermissionsAndroid.RESULTS.GRANTED) {
        ask(t('Not done'), t("Erevos may not read the phone's contacts, so numbers stay as they are."), [{ text: t('OK') }]);
        return;
      }
    }
    const { space: current, key } = currentSpace();
    const link = await SmsLink.open(current, key).catch(() => null);
    if (!link) return;
    await link.setNames(on);
    names.current = on;
    setAgain((n) => n + 1);
  }

  const closeWriting = () => {
    setWriting(false);
    setNumber('');
    setNote('');
  };
  function write() {
    // Several numbers, separated by commas, make a group's conversation.
    const numbers = smsNumbers(number);
    if (numbers.length === 0) {
      setNote(t('Type a phone number.'));
      return;
    }
    closeWriting();
    router.push(`/sms?to=${encodeURIComponent(smsAddress(numbers))}`);
  }

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <Logo size={30} />
          <Text variant="title">SMS</Text>
        </View>
        <ShortcutTile label={t('Unlock everything')} tint="orange" onPress={() => lock.unlockAll()}>
          <LockSign tint="orange" />
        </ShortcutTile>
      </View>
      <Text variant="caption" tone="muted">
        {t('Only the SMS are open. Everything else in Erevos asks for the password again.')}
      </Text>
      <View style={styles.search}>
        <SearchIcon color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('Search chats')}
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      {isApp ? (
        <Row wrap>
          <Chip label={t('Names')} selected={names.current} onPress={() => void toggleNames()} />
          {folders.archived ? <Chip label={t('Archived · {n}', { n: folders.archived })} onPress={() => router.push('/sms-folder?folder=archived')} /> : null}
          {folders.spam ? <Chip label={t('Spam · {n}', { n: folders.spam })} onPress={() => router.push('/sms-folder?folder=spam')} /> : null}
          {folders.trash ? <Chip label={t('Trash · {n}', { n: folders.trash })} onPress={() => router.push('/sms-folder?folder=trash')} /> : null}
          {atCarrier ? <Chip label={t('MMS waiting · {n}', { n: atCarrier })} onPress={() => router.push('/sms-settings?part=mms')} /> : null}
        </Row>
      ) : null}
    </View>
  );

  return (
    <KeyboardPaddedView inset={insets.bottom} style={styles.container}>
      <FlatList
        data={shown}
        // Android's clipping of rows off the screen closed Erevos on Fabric (a row added twice), as on the home screen.
        removeClippedSubviews={false}
        keyExtractor={(row) => row.identity}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 120 }]}
        renderItem={({ item }) => <ChatRow row={item} now={now} onLong={() => setTarget({ address: item.sms, name: shownName(item), at: item.at, folder: 'list' })} />}
        ListEmptyComponent={
          rows === null ? undefined : (
            <Text tone="muted" style={styles.emptyText}>
              {!isApp ? t('Erevos is not the SMS app') : query.trim() ? t('No chat has “{query}” in it.', { query: query.trim() }) : t('No SMS yet.')}
            </Text>
          )
        }
      />
      {isApp ? (
        <Pressable
          onPress={() => setWriting(true)}
          accessibilityRole="button"
          accessibilityLabel={t('New SMS')}
          style={({ pressed }) => [styles.fab, { bottom: insets.bottom + space.xl }, pressed && styles.fabPressed]}
        >
          <PlusIcon color={colors.onPrimary} size={20} />
          <Text variant="label" color={colors.onPrimary}>
            {t('New SMS')}
          </Text>
        </Pressable>
      ) : null}
      <UndoBar bottom={insets.bottom + space.xl + 56 + space.md} />
      <SmsActions target={target} onClose={() => setTarget(null)} />
      <Sheet visible={writing} onClose={closeWriting} title={t('New SMS')}>
        <SmsRecipient value={number} onChange={setNumber} onSubmit={write} autoFocus />
        <Button title={t('Write')} onPress={write} />
        {note ? <Text tone="muted">{note}</Text> : null}
      </Sheet>
    </KeyboardPaddedView>
  );
}

const makeStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ground,
    },
    list: {
      width: '100%',
      maxWidth: 760,
      alignSelf: 'center',
      paddingHorizontal: space.lg,
    },
    headerBlock: {
      gap: space.md,
      paddingTop: space.md,
      paddingBottom: space.sm,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
    },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      height: 46,
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: withAlpha(colors.border, 0.6),
    },
    searchInput: {
      flex: 1,
      height: '100%',
      color: colors.text,
      fontSize: 16,
      ...(fontStyle('400') ?? {}),
    },
    emptyText: {
      textAlign: 'center',
      paddingTop: space.xxl,
    },
    fab: {
      position: 'absolute',
      right: space.xl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      height: 56,
      paddingHorizontal: space.xl - 4,
      borderRadius: 28,
      backgroundColor: colors.primary,
      boxShadow: `0px 8px 24px ${withAlpha('#000000', 0.35)}`,
    },
    fabPressed: {
      backgroundColor: colors.primaryPressed,
    },
  });
