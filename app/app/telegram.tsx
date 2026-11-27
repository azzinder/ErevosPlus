// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatRow } from '../components/chat-row';
import { TelegramKeys } from '../components/telegram-keys';
import { AccountTorChoice } from '../components/account-tor';
import { Button, Card, Chip, Field, Input, Page, Row, SectionTitle, Text, TextButton, Toggle } from '../components/ui';
import { ask } from '../lib/alert';
import { t } from '../lib/i18n';
import { telegramInboxRows, type InboxRow } from '../lib/inbox';
import { useNetworkWhere, whereParams, type NetworkWhere } from '../lib/network-place';
import type { TgAuth, TgList } from '../lib/telegram';
import {
  onTelegramChange,
  runTelegram,
  telegramAdsOn,
  telegramHomeFolders,
  telegramLockedChats,
  telegramAwayChats,
  telegramSetHomeFolder,
  telegramBegin,
  telegramCode,
  telegramHere,
  telegramLeave,
  telegramFindByName,
  telegramMoreChats,
  telegramNow,
  telegramPassword,
  telegramPhone,
  telegramResendCode,
  telegramSetAds,
  telegramSetTorChoice,
  telegramTorChats,
  telegramTorChoice,
  telegramCanTor,
  telegramShown,
} from '../lib/telegram-store';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';

// The space's Telegram account (the ErevosGram build only: lib/telegram-store.ts, docs/erevosgram.md),
// under Settings → Server and networks → Telegram: signing in step by step as Telegram asks (the phone
// number, the code, the two-step password, or a scan from another device), then its chats, its
// folders and its archive as rows like home's (components/chat-row.tsx), in a list that draws only
// the rows on the screen and asks Telegram for more as it nears its end, each opening in
// app/telegram-chat.tsx. Settings, beside the title, has what is set once: ads, Tor, which folders show,
// the ErevosGram keys, and leaving Telegram on this phone, which either signs this device out at
// Telegram too or only forgets it here. Every view says these chats are
// readable by Telegram unless both sides use ErevosGram encryption, and that Erevos is not made by
// Telegram. Opened from a hidden place's hidden chats (`hidden=1`) it is that place's own account
// (lib/network-place.ts), and says so.

export default function TelegramScreen() {
  const router = useRouter();
  const { hidden } = useLocalSearchParams<{ hidden?: string }>();
  const where = useNetworkWhere(hidden === '1');
  const [now, setNow] = useState(telegramNow(where));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [list, setList] = useState<TgList>('main');
  const [settings, setSettings] = useState(false);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  // The lists Telegram has no more chats for, and the one being asked for more now.
  const ended = useRef(new Set<TgList>());
  const asking = useRef(false);
  const [handle, setHandle] = useState('');

  // Back, on Android, goes from the settings to the chats before it leaves the screen.
  useEffect(() => {
    if (!settings) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      setSettings(false);
      return true;
    });
    return () => back.remove();
  }, [settings]);

  useEffect(() => {
    runTelegram();
    setNow(telegramNow(where));
    return onTelegramChange(() => setNow(telegramNow(where)));
  }, [where]);

  async function run(work: () => Promise<unknown>) {
    setBusy(true);
    setNote('');
    try {
      await work();
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  if (!telegramHere()) {
    return (
      <Page>
        <Text variant="title">Telegram</Text>
        <Text tone="muted">{t('This build of Erevos has no Telegram.')}</Text>
      </Page>
    );
  }

  // A hidden place's own account says so under the title: it is not the space's.
  const own =
    where === 'place' ? (
      <Text variant="caption" tone="muted">
        {t("This account is these hidden chats' own: nothing of it shows outside them.")}
      </Text>
    ) : null;

  const about = (
    <>
      <Text tone="muted">{t('Telegram can read your normal chats. Only a chat where you both use ErevosGram encryption is encrypted end to end.')}</Text>
      <Text variant="caption" tone="muted">
        {t('Erevos is not made by Telegram. It uses the Telegram API.')}
      </Text>
    </>
  );

  // Tor for this account (lib/account-tor.ts), the same three choices as every account's: before signing in too.
  const tor = telegramCanTor() ? (
    <AccountTorChoice
      network="Telegram"
      way={telegramTorChoice(where)}
      chatsThroughTor={telegramTorChats(where)}
      disabled={busy}
      onChange={(next) => void run(() => telegramSetTorChoice(next, where))}
    />
  ) : null;

  const { loaded, account, state, problem } = now;
  if (!loaded) {
    return (
      <Page>
        <Text variant="title">Telegram</Text>
        {own}
        {about}
      </Page>
    );
  }

  if (!account) {
    return (
      <Page>
        <Text variant="title">Telegram</Text>
        {own}
        {about}
        <Card>
          {tor}
          <Button title={busy ? t('Starting…') : t('Sign in to Telegram')} loading={busy} disabled={busy} onPress={() => void run(telegramBegin)} />
          <Text variant="caption" tone="faint">
            {where === 'place'
              ? t('Erevos signs in as a new device of your Telegram account, and keeps it encrypted in these hidden chats only.')
              : t('Erevos signs in as a new device of your Telegram account, and keeps it encrypted in this space only.')}
          </Text>
        </Card>
        {note || problem ? <Text tone="muted">{note || problem}</Text> : null}
      </Page>
    );
  }

  const leave = (
    <>
      <SectionTitle title={t('Leave Telegram on this phone')} />
      <Card>
        <Text tone="muted">{t('Erevos forgets this Telegram account, its chats kept here and the ErevosGram keys. Encrypted chats cannot be read again afterwards.')}</Text>
        <Button
          title={t('Leave Telegram on this phone')}
          kind="secondary"
          disabled={busy}
          onPress={() =>
            ask(t('Leave Telegram on this phone?'), t('Log out at Telegram too, so this phone is no longer one of your devices there, or only forget Telegram here, and this phone stays in your Telegram devices until you remove it in the Telegram app.'), [
              { text: t('Cancel'), style: 'cancel' },
              { text: t('Only forget it here'), style: 'destructive', onPress: () => void run(() => telegramLeave(false)) },
              { text: t('Log out at Telegram too'), style: 'destructive', onPress: () => void run(() => telegramLeave(true)) },
            ])
          }
        />
      </Card>
    </>
  );

  const step = state ? stepOf(state.auth, { busy, run, phone, setPhone, code, setCode, password, setPassword }) : null;
  if (!state || state.auth.kind !== 'ready') {
    return (
      <Page>
        <Text variant="title">Telegram</Text>
        {own}
        {about}
        {step ?? <Text tone="muted">{problem || t('Starting Telegram…')}</Text>}
        {tor ? <Card>{tor}</Card> : null}
        {note || problem ? <Text tone="muted">{note || problem}</Text> : null}
        {state ? <TextButton title={t('Stop signing in')} onPress={() => void run(() => telegramLeave(false))} /> : null}
      </Page>
    );
  }

  // The account's Telegram folders chosen on this phone (each a tab on home too); a folder that went away falls back to all.
  const chosen = telegramHomeFolders(where);
  const folders = state.folders.filter((f) => chosen.includes(f.id));
  const shownList: TgList = typeof list === 'number' && !folders.some((f) => f.id === list) ? 'main' : list;
  const choose = (next: TgList) => {
    setList(next);
    if (next !== 'main') void run(() => telegramMoreChats(next));
  };
  if (settings) {
    return (
      <Page>
        <Row>
          <Text variant="title" style={{ flex: 1 }}>
            {t('Settings')}
          </Text>
          <TextButton title={t('Chats')} onPress={() => setSettings(false)} />
        </Row>
        {own}
        {about}
        {note ? <Text tone="muted">{note}</Text> : null}
        <Card>
          <Pressable
            onPress={() => void run(() => telegramSetAds(!telegramAdsOn(where)))}
            disabled={busy}
            accessibilityRole="switch"
            accessibilityState={{ checked: telegramAdsOn(where), disabled: busy }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('Ads in channels')}</Text>
              <Text variant="caption" tone="muted">
                {t('Telegram asks apps to show its ads in large public channels. Off unless you turn it on.')}
              </Text>
            </View>
            <Toggle on={telegramAdsOn(where)} />
          </Pressable>
          {tor}
        </Card>
        {state.folders.length ? (
          <>
            <SectionTitle title={t('Telegram folders')} />
            <Card>
              <Text variant="caption" tone="muted">
                {t('The folders you made in Telegram. Each one turned on shows as its own tab here and on the home screen, and once any is on, only the chats in them notify. Telegram keeps them as they are.')}
              </Text>
              {state.folders.map((f) => {
                const shown = chosen.includes(f.id);
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => void run(() => telegramSetHomeFolder(f.id, !shown))}
                    disabled={busy}
                    accessibilityRole="switch"
                    accessibilityLabel={f.name}
                    accessibilityState={{ checked: shown, disabled: busy }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs }}
                  >
                    <Text style={{ flex: 1 }}>{f.name}</Text>
                    <Toggle on={shown} />
                  </Pressable>
                );
              })}
            </Card>
          </>
        ) : null}
        <SectionTitle title={t('ErevosGram keys')} />
        <TelegramKeys />
        {leave}
      </Page>
    );
  }

  const rows = telegramInboxRows(state, (m) => telegramShown(m.chatId, m, where), shownList, [], telegramLockedChats(where), where === 'space' ? telegramAwayChats() : undefined);
  const open = (row: InboxRow) => router.push({ pathname: '/telegram-chat', params: { id: row.identity.slice('telegram:'.length), ...whereParams(where) } });
  // Near the end of the list: Telegram is asked for more of it, until it has none.
  const more = () => {
    if (asking.current || ended.current.has(shownList) || rows.length === 0) return;
    asking.current = true;
    const had = rows.length;
    void telegramMoreChats(shownList)
      .then(() => {
        const state = telegramNow(where).state;
        if (state && telegramInboxRows(state, undefined, shownList).length <= had) ended.current.add(shownList);
      })
      .catch(() => undefined)
      .finally(() => {
        asking.current = false;
      });
  };
  // A person or public chat by their @name: opened, or said that nobody has it.
  async function find() {
    const name = handle.trim();
    if (!name) return;
    await run(async () => {
      const found = await telegramFindByName(name);
      if (found === null) {
        setNote(t('Nobody with that name on Telegram.'));
        return;
      }
      setHandle('');
      router.push({ pathname: '/telegram-chat', params: { id: String(found), ...whereParams(where) } });
    });
  }
  const shownAt = Date.now();
  return (
    <FlatList<InboxRow>
      style={{ flex: 1, backgroundColor: colors.ground }}
      data={rows}
      // Android's clipping of rows off the screen closed Erevos on Fabric (a row added twice).
      removeClippedSubviews={false}
      keyExtractor={(row) => row.identity}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: space.lg, paddingBottom: insets.bottom + space.xl }}
      ListHeaderComponent={
        <View style={{ gap: space.md, paddingTop: space.xl - 4, paddingBottom: space.sm }}>
          <Row>
            <Text variant="title" style={{ flex: 1 }}>
              Telegram
            </Text>
            <TextButton title={t('Settings')} onPress={() => setSettings(true)} />
          </Row>
          {own}
          <Row>
            <Input
              style={{ flex: 1 }}
              value={handle}
              onChangeText={setHandle}
              onSubmitEditing={() => void find()}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t('Find by @name')}
              accessibilityLabel={t('Find by @name')}
            />
            <Button title={t('Find')} kind="secondary" compact disabled={busy || !handle.trim()} onPress={() => void find()} />
          </Row>
          <Row wrap>
            <Chip label={t('Chats')} selected={shownList === 'main'} onPress={() => choose('main')} />
            {folders.map((f) => (
              <Chip key={f.id} label={f.name} selected={shownList === f.id} onPress={() => choose(f.id)} />
            ))}
            <Chip label={t('Archive')} selected={shownList === 'archive'} onPress={() => choose('archive')} />
          </Row>
          <Text variant="caption" tone="muted">
            {state.connection === 'ready' ? '' : `${t('Connecting…')} `}
            {t('Telegram can read your normal chats. Only a chat where you both use ErevosGram encryption is encrypted end to end.')} {t('Erevos is not made by Telegram. It uses the Telegram API.')}
          </Text>
          {note ? <Text tone="muted">{note}</Text> : null}
        </View>
      }
      renderItem={({ item }) => <ChatRow row={item} now={shownAt} hidden={where === 'place'} onOpen={() => open(item)} />}
      ListEmptyComponent={
        <Text tone="muted" style={{ paddingVertical: space.lg }}>
          {shownList === 'archive' ? t('The archive is empty.') : typeof shownList === 'number' ? t('No chats in this folder yet.') : t('No Telegram chats yet.')}
        </Text>
      }
      onEndReached={more}
      onEndReachedThreshold={0.5}
    />
  );
}

type Step = {
  busy: boolean;
  run: (work: () => Promise<unknown>) => Promise<void>;
  phone: string;
  setPhone: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
};

// The card for what signing in asks now. Null while Telegram starts or closes.
function stepOf(auth: TgAuth, s: Step) {
  switch (auth.kind) {
    case 'phone':
      return (
        <Card>
          <Field label={t('Phone number')} hint={t('With the country code, such as +30.')}>
            <Input value={s.phone} onChangeText={s.setPhone} keyboardType="phone-pad" autoCorrect={false} placeholder="+30 …" accessibilityLabel={t('Phone number')} />
          </Field>
          <Button title={t('Send the code')} loading={s.busy} disabled={s.busy || s.phone.replace(/\D/g, '').length < 5} onPress={() => void s.run(() => telegramPhone(s.phone))} />
        </Card>
      );
    case 'code':
      return (
        <Card>
          <Text>
            {auth.via === 'telegram'
              ? t('Telegram sent a code to its app on your other devices. Open Telegram there and read it.')
              : auth.via === 'sms'
                ? t('Telegram sent a code by SMS to {phone}.', { phone: auth.phone })
                : auth.via === 'call'
                  ? t('Telegram will call {phone} and say the code.', { phone: auth.phone })
                  : t('Telegram sent a code to {phone}.', { phone: auth.phone })}
          </Text>
          <Field label={t('Code')}>
            <Input value={s.code} onChangeText={s.setCode} keyboardType="number-pad" autoCorrect={false} maxLength={auth.length || 8} accessibilityLabel={t('Code')} />
          </Field>
          <Row wrap>
            <Button
              title={t('Sign in')}
              loading={s.busy}
              disabled={s.busy || s.code.trim().length < 3}
              onPress={() =>
                void s.run(async () => {
                  await telegramCode(s.code);
                  s.setCode('');
                })
              }
            />
            <Button title={t('Send the code again')} kind="secondary" disabled={s.busy} onPress={() => void s.run(telegramResendCode)} />
          </Row>
        </Card>
      );
    case 'password':
      return (
        <Card>
          <Text>{t('Your account has a two-step password.')}</Text>
          {auth.hint ? <Text tone="muted">{t('Hint: {hint}', { hint: auth.hint })}</Text> : null}
          <Field label={t('Password')}>
            <Input value={s.password} onChangeText={s.setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} accessibilityLabel={t('Password')} />
          </Field>
          <Button
            title={t('Sign in')}
            loading={s.busy}
            disabled={s.busy || !s.password}
            onPress={() =>
              void s.run(async () => {
                await telegramPassword(s.password);
                s.setPassword('');
              })
            }
          />
        </Card>
      );
    case 'other-device':
      return (
        <Card>
          <Text>{t('Telegram asks you to confirm on another device. Open Telegram there, scan the code for this link or open it, and say yes.')}</Text>
          <Text selectable variant="bodyStrong" style={{ fontFamily: 'monospace' }}>
            {auth.link}
          </Text>
        </Card>
      );
    case 'unsupported':
      return (
        <Card>
          <Text>{t('Erevos cannot do this part of signing in yet: a new Telegram account, or signing in by e-mail. Do it once in the official Telegram app first, then come back and sign in here.')}</Text>
        </Card>
      );
    default:
      return null;
  }
}
