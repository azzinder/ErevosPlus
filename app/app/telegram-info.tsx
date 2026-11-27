// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { NetworkChatNotify } from '../components/network-chat-notify';
import { ChatTorSwitch } from '../components/account-tor';
import { PasswordSheet } from '../components/PasswordSheet';
import { AddMemberSheet, AdminSheet } from '../components/telegram-members';
import { Button, Card, Chip, Input, Page, Row, SectionTitle, Text, TextButton, Toggle } from '../components/ui';
import { telegramCallGate } from '../components/telegram-ip';
import { ask } from '../lib/alert';
import { callPermissions } from '../lib/call-permissions';
import { t } from '../lib/i18n';
import { callsOff, callsOffNote } from '../lib/modes';
import { TelegramVideoView } from '../modules/erevos-telegram';
import { useNetworkWhere, whereParams } from '../lib/network-place';
import { nameOf } from '../lib/telegram';
import {
  onTelegramChange,
  runTelegram,
  telegramArchiveChat,
  telegramAutoDelete,
  telegramBlock,
  telegramChatWith,
  defaultRights,
  telegramAddMember,
  telegramMembers,
  telegramRemoveMember,
  telegramSetAdmin,
  type TgRights,
  telegramSetDescription,
  telegramSetTitle,
  type TgMember,
  telegramCall,
  telegramCanCall,
  telegramChatInFolder,
  telegramClearChat,
  telegramDeleteChat,
  telegramInfo,
  telegramMarkUnread,
  telegramMuteChat,
  telegramNow,
  telegramPinChat,
  telegramChatPin,
  telegramSetShots,
  telegramChatTor,
  telegramSetChatTor,
  telegramChatNotify,
  telegramSetChatNotify,
  telegramShots,
  telegramSetChatPin,
  telegramHideChat,
  telegramUnhideChat,
  type TgInfo,
} from '../lib/telegram-store';
import { telegramStatusLine } from '../lib/telegram-view';
import { space } from '../theme/colors';
import { makeChatPin, opensChat } from '../lock/chat-pin';
import { MIN_PIN } from '../lock/hidden';

// What a Telegram chat is (the ErevosGram build only: lib/telegram-store.ts), opened by tapping its
// name in app/telegram-chat.tsx. For a person: when they were last on, their name at Telegram, their
// phone number and what they wrote about themselves, and how many groups we share. For a group or a
// channel: its description, how many are in it, its public link and its invite link. Under that
// what can be done with the chat: mute it, pin it, archive it, mark it read or unread, put it in
// or take it out of the account's Telegram folders (which Telegram changes on all the devices of the
// account), have its new messages delete themselves, call the person, block them, clear its history
// and delete the chat or leave the group or channel. A group or channel also lists its members with
// who is its owner or an admin, and a tap on one opens the chat with them; the owner and the admins can
// change its title and description and remove a member (not an admin, not themselves). Those allowed
// can add someone (a contact, or anyone by their @name), make a member an admin with the rights they
// choose, change an admin's rights or make them a plain member again (components/telegram-members.tsx).
// Opened from a hidden place's hidden chats
// (`hidden=1`) it is that place's own account's chat (lib/network-place.ts).

const autoChoices = () => [
  { seconds: 0, label: t('Off') },
  { seconds: 86400, label: t('1 day') },
  { seconds: 604800, label: t('1 week') },
  { seconds: 2592000, label: t('1 month') },
];

export default function TelegramInfoScreen() {
  const router = useRouter();
  const { id, hidden, kept: keptParam } = useLocalSearchParams<{ id?: string; hidden?: string; kept?: string }>();
  // A chat of the space's account kept in the hidden chats (telegramHideChat) opens from there with `kept`.
  const keptHere = keptParam === '1';
  const where = useNetworkWhere(hidden === '1', keptHere);
  const chatId = Number(id);
  const [now, setNow] = useState(telegramNow(where));
  const [info, setInfo] = useState<TgInfo | null>(null);
  const [busy, setBusy] = useState(false);
  // What asks for a PIN: a new one to lock the chat with, or its own to take it off.
  const [pinAsk, setPinAsk] = useState<'on' | 'off' | null>(null);
  const [hidePin, setHidePin] = useState('');
  const [note, setNote] = useState('');
  const [members, setMembers] = useState<{ members: TgMember[]; me: TgMember['role']; rights?: TgRights } | null>(null);
  const [adminFor, setAdminFor] = useState<TgMember | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');

  useEffect(() => {
    runTelegram();
    setNow(telegramNow(where));
    return onTelegramChange(() => setNow(telegramNow(where)));
  }, [where]);

  const state = now.state;
  const ready = state?.auth.kind === 'ready';
  const chat = state?.chats[chatId];

  useEffect(() => {
    if (!ready || !Number.isFinite(chatId)) return;
    let alive = true;
    telegramInfo(chatId).then(
      (found) => alive && setInfo(found),
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [ready, chatId]);

  const group = chat?.type === 'group' || chat?.type === 'channel';
  const loadMembers = () => {
    if (!ready || !group) return Promise.resolve();
    return telegramMembers(chatId).then(setMembers, () => undefined);
  };
  useEffect(() => {
    void loadMembers();
  }, [ready, chatId, group]);

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

  if (!state || !ready || !chat) {
    return (
      <Page>
        <Text variant="title">Telegram</Text>
        <Text tone="muted">{now.loaded ? t('This Telegram chat is not here any more.') : ''}</Text>
      </Page>
    );
  }

  const isPrivate = chat.type === 'private';
  const person = isPrivate || chat.type === 'secret';
  const channel = chat.type === 'channel';
  const user = person && chat.userId !== undefined ? state.users[chat.userId] : undefined;
  const status = person ? telegramStatusLine(user) : '';
  const username = info?.username || user?.username || '';
  const phone = user?.phone ? (user.phone.startsWith('+') ? user.phone : `+${user.phone}`) : '';
  const unread = !!chat.markedUnread || chat.unread > 0;
  const callTo = isPrivate && chat.userId !== undefined && telegramCanCall() ? chat.userId : undefined;

  // Leaving the chat shuts this screen and the chat's, so it goes back to the start.
  const leaveScreens = () => {
    router.dismissTo('/');
  };

  // A video call asks for the camera too, and starts with it on.
  async function startCall(userId: number, video = false) {
    // INVISIBLE (lib/modes.ts): no calls, and it is said before anything is asked.
    if (callsOff()) throw new Error(callsOffNote());
    if (!(await telegramCallGate(userId, where))) return;
    if (!(await callPermissions(video))) throw new Error(video ? t('Allow the microphone and the camera for a video call.') : t('Allow the microphone to call.'));
    await telegramCall(userId, where, video);
  }

  function clear() {
    const go = (revoke: boolean) => void run(() => telegramClearChat(chatId, revoke));
    ask(t('Clear history'), t('Delete all messages of this chat? This cannot be brought back.'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Delete for me'), style: 'destructive', onPress: () => go(false) },
      ...(isPrivate ? [{ text: t('Delete for both'), style: 'destructive' as const, onPress: () => go(true) }] : []),
    ]);
  }

  function leave() {
    const title = person ? t('Delete chat') : channel ? t('Leave channel') : t('Leave group');
    const go = (revoke: boolean) =>
      void run(async () => {
        await telegramDeleteChat(chatId, revoke);
        leaveScreens();
      });
    ask(title, person ? t('Delete this chat and all its messages?') : t('Leave this chat and delete it from your list?'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: person ? t('Delete for me') : title, style: 'destructive', onPress: () => go(false) },
      ...(isPrivate ? [{ text: t('Delete for both'), style: 'destructive' as const, onPress: () => go(true) }] : []),
    ]);
  }

  function block() {
    if (chat?.blocked) {
      void run(() => telegramBlock(chatId, false));
      return;
    }
    ask(t('Block'), t('They can no longer write to you. You can unblock them here.'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Block'), style: 'destructive', onPress: () => void run(() => telegramBlock(chatId, true)) },
    ]);
  }

  const admin = members?.me === 'owner' || members?.me === 'admin';
  // An owner can make anyone an admin; an admin only with that right, and only change admins they made.
  const canPromote = members?.me === 'owner' || !!members?.rights?.addAdmins;
  const canAdd = members?.me === 'owner' || !!members?.rights?.inviteUsers || (members?.me === 'member' && !channel);
  const promotable = (m: TgMember) => canPromote && m.user !== state.me && m.role !== 'owner' && (m.role !== 'admin' || m.editable === true);

  function saveAdmin(target: TgMember, rights: TgRights | null) {
    setAdminFor(null);
    void run(async () => {
      await telegramSetAdmin(chatId, target.user, rights);
      await loadMembers();
    });
  }

  function addMember(userId: number) {
    setAdding(false);
    void run(async () => {
      await telegramAddMember(chatId, userId);
      await loadMembers();
    });
  }
  const roleLabel = (role: TgMember['role']) => (role === 'owner' ? t('Owner') : role === 'admin' ? t('Admin') : '');

  async function openMember(userId: number) {
    await run(async () => {
      const target = await telegramChatWith(userId);
      router.push({ pathname: '/telegram-chat', params: { id: String(target), ...whereParams(where) } });
    });
  }

  function removeMember(userId: number) {
    ask(t('Remove'), t('Remove {name} from this chat? They are banned from it: they cannot come back, not even by its link, until an admin lets them in Telegram.', { name: nameOf(state!, userId) || '…' }), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Remove'), style: 'destructive', onPress: () => void run(async () => { await telegramRemoveMember(chatId, userId); await loadMembers(); }) },
    ]);
  }

  const locked = !!telegramChatPin(chatId, where);

  // Keeps the chat in the hidden chats its PIN opens (telegramHideChat), then goes home, where it is gone.
  async function hide() {
    const pin = hidePin;
    if (pin.length < MIN_PIN || busy) return;
    setBusy(true);
    setNote('');
    try {
      if (!(await telegramHideChat(chatId, pin))) {
        setNote(t('Wrong PIN.'));
        return;
      }
      setHidePin('');
      router.dismissAll();
      ask(t('Move to hidden chats'), t('Moved to the hidden chats. Type their PIN in the search on the home screen to open them.'), [{ text: t('OK') }]);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  const switchRow = (label: string, on: boolean, change: (next: boolean) => Promise<unknown>) => (
    <Pressable
      onPress={() => void run(() => change(!on))}
      disabled={busy}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: on, disabled: busy }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs }}
    >
      <Text style={{ flex: 1 }}>{label}</Text>
      <Toggle on={on} />
    </Pressable>
  );

  return (
    <Page>
      <Text variant="title">{chat.title}</Text>
      {status ? <Text tone="muted">{status}</Text> : null}
      <Card>
        {person ? (
          <>
            {username ? <Text selectable>{`@${username}`}</Text> : null}
            {phone ? <Text selectable>{phone}</Text> : null}
            {info?.about ? <Text selectable>{info.about}</Text> : null}
            {info?.commonGroups ? <Text tone="muted">{t('Groups in common: {n}', { n: info.commonGroups })}</Text> : null}
          </>
        ) : (
          <>
            {info?.about ? <Text selectable>{info.about}</Text> : null}
            {info?.members !== undefined ? <Text tone="muted">{t('Members: {n}', { n: info.members })}</Text> : null}
            {username ? <Text selectable>{`@${username}`}</Text> : null}
            {username ? <Text selectable>{`https://t.me/${username}`}</Text> : null}
            {info?.invite ? <Text selectable>{info.invite}</Text> : null}
          </>
        )}
        {!info ? <Text tone="faint">…</Text> : null}
      </Card>

      <Card>
        {switchRow(t('Mute notifications'), chat.muted, (next) => telegramMuteChat(chatId, next))}
        {switchRow(t('Pin'), !!chat.pinned, (next) => telegramPinChat(chatId, next))}
        {switchRow(t('Archived'), chat.archive !== undefined, (next) => telegramArchiveChat(chatId, next))}
        {switchRow(t('Block screenshots'), telegramShots(chatId, where), (next) => telegramSetShots(chatId, next, where))}
        <Text variant="caption" tone="faint">
          {t('On this phone only, on Android: Telegram cannot tell the other side to block them, so they can still take screenshots on theirs.')}
        </Text>
        <ChatTorSwitch network="Telegram" on={telegramChatTor(chatId, where)} disabled={busy} onChange={(next) => void run(() => telegramSetChatTor(chatId, next, where))} />
        {where === 'space' ? (
          <Pressable
            onPress={() => setPinAsk(locked ? 'off' : 'on')}
            disabled={busy}
            accessibilityRole="switch"
            accessibilityLabel={t('Lock with a PIN')}
            accessibilityState={{ checked: locked, disabled: busy }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs }}
          >
            <Text style={{ flex: 1 }}>{t('Lock with a PIN')}</Text>
            <Toggle on={locked} />
          </Pressable>
        ) : null}
        <Row wrap>
          <NetworkChatNotify notify={telegramChatNotify(chatId, where)} hidden={where !== 'space' || keptHere} calls={isPrivate} onChange={(next) => telegramSetChatNotify(chatId, next, where)} />
          <Button title={unread ? t('Mark as read') : t('Mark as unread')} kind="secondary" compact disabled={busy} onPress={() => void run(() => telegramMarkUnread(chatId, !unread))} />
          {callTo !== undefined ? <Button title={t('Call')} kind="secondary" compact disabled={busy} onPress={() => void run(() => startCall(callTo))} /> : null}
        {callTo !== undefined && TelegramVideoView ? <Button title={t('Video call')} kind="secondary" compact disabled={busy} onPress={() => void run(() => startCall(callTo, true))} /> : null}
        </Row>
      </Card>

      {state.folders.length ? (
        <>
          <SectionTitle title={t('Telegram folders')} />
          <Card>
            {state.folders.map((f) => (
              <View key={f.id}>{switchRow(f.name, chat.folders?.[f.id] !== undefined, (next) => telegramChatInFolder(chatId, f.id, next))}</View>
            ))}
            <Text variant="caption" tone="faint">
              {t('Telegram changes the folder on all your devices.')}
            </Text>
          </Card>
        </>
      ) : null}

      <SectionTitle title={t('Delete messages automatically')} />
      <Card>
        <Row wrap>
          {autoChoices().map((a) => (
            <Chip key={a.seconds} label={a.label} selected={(chat.autoDelete ?? 0) === a.seconds} disabled={busy} onPress={() => void run(() => telegramAutoDelete(chatId, a.seconds))} />
          ))}
        </Row>
      </Card>

      {group && admin ? (
        <>
          <SectionTitle title={t('Edit')} />
          <Card>
            {editing ? (
              <>
                <Input value={title} onChangeText={setTitle} placeholder={t('Title')} accessibilityLabel={t('Title')} />
                <Input value={about} onChangeText={setAbout} multiline placeholder={t('Description')} accessibilityLabel={t('Description')} />
                <Row wrap>
                  <Button
                    title={t('Save')}
                    compact
                    disabled={busy || !title.trim()}
                    onPress={() =>
                      void run(async () => {
                        if (title.trim() !== chat.title) await telegramSetTitle(chatId, title.trim());
                        if (about.trim() !== (info?.about ?? '')) await telegramSetDescription(chatId, about.trim());
                        setEditing(false);
                        setInfo(await telegramInfo(chatId));
                      })
                    }
                  />
                  <Button title={t('Cancel')} kind="secondary" compact onPress={() => setEditing(false)} />
                </Row>
              </>
            ) : (
              <Button
                title={t('Edit')}
                kind="secondary"
                compact
                onPress={() => {
                  setTitle(chat.title);
                  setAbout(info?.about ?? '');
                  setEditing(true);
                }}
              />
            )}
          </Card>
        </>
      ) : null}

      {group && members && members.members.length ? (
        <>
          <SectionTitle title={t('Members')} />
          <Card>
            {members.members
              .filter((m) => m.role !== 'left' && m.role !== 'banned')
              .map((m) => (
                <Row key={m.user}>
                  <Pressable style={{ flex: 1, paddingVertical: space.xs }} onPress={() => void openMember(m.user)} disabled={busy || m.user === state.me} accessibilityRole="button">
                    <Text numberOfLines={1}>{nameOf(state, m.user) || '…'}</Text>
                    {roleLabel(m.role) ? (
                      <Text variant="caption" tone="muted">
                        {roleLabel(m.role)}
                      </Text>
                    ) : null}
                  </Pressable>
                  {promotable(m) ? <TextButton title={m.role === 'admin' ? t('Rights') : t('Make admin')} onPress={() => setAdminFor(m)} /> : null}
                  {admin && m.role !== 'owner' && m.role !== 'admin' && m.user !== state.me ? <TextButton title={t('Remove')} onPress={() => removeMember(m.user)} /> : null}
                </Row>
              ))}
            {info?.members !== undefined && info.members > members.members.length ? (
              <Text variant="caption" tone="faint">
                {t('Shows {n} of {total}: Telegram gives the most recent.', { n: members.members.length, total: info.members })}
              </Text>
            ) : null}
            {canAdd ? <Button title={t('Add member')} kind="secondary" compact disabled={busy} onPress={() => setAdding(true)} /> : null}
          </Card>
        </>
      ) : null}
      <AdminSheet
        visible={adminFor !== null}
        onClose={() => setAdminFor(null)}
        name={adminFor ? nameOf(state, adminFor.user) || '…' : ''}
        channel={channel}
        rights={adminFor?.rights ?? defaultRights(channel)}
        mine={members?.me === 'owner' ? undefined : members?.rights}
        isAdmin={adminFor?.role === 'admin'}
        onSave={(rights) => adminFor && saveAdmin(adminFor, rights)}
        onDemote={() => adminFor && saveAdmin(adminFor, null)}
      />
      <AddMemberSheet visible={adding} onClose={() => setAdding(false)} where={where} present={(members?.members ?? []).filter((m) => m.role !== 'left' && m.role !== 'banned').map((m) => m.user)} onAdd={addMember} />

      {where === 'space' && !keptHere ? (
        <>
          <SectionTitle title={t('Move to hidden chats')} />
          <Card>
            <Text variant="caption" tone="muted">
              {t('The chat leaves the lists of this space and shows only in the hidden chats its PIN opens. Telegram still has it, on all your devices.')}
            </Text>
            <Input
              value={hidePin}
              onChangeText={setHidePin}
              placeholder={t('PIN of the hidden chats, {n} or more characters', { n: MIN_PIN })}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel={t('PIN of the hidden chats, {n} or more characters', { n: MIN_PIN })}
              onSubmitEditing={() => void hide()}
            />
            <Button title={t('Move')} kind="secondary" compact disabled={busy || hidePin.length < MIN_PIN} onPress={() => void hide()} />
          </Card>
        </>
      ) : null}
      {keptHere ? <Button title={t('Move back to my chats')} kind="secondary" disabled={busy} onPress={() => void run(async () => { await telegramUnhideChat(chatId); setNote(t('Moved back to your chats.')); })} /> : null}
      {person ? <Button title={chat.blocked ? t('Unblock') : t('Block')} kind="secondary" disabled={busy} onPress={block} /> : null}
      <Button title={t('Clear history')} kind="secondary" disabled={busy} onPress={clear} />
      <Button title={person ? t('Delete chat') : channel ? t('Leave channel') : t('Leave group')} kind="secondary" disabled={busy} onPress={leave} />
      {note ? <Text tone="muted">{note}</Text> : null}
      <PasswordSheet
        visible={pinAsk === 'on'}
        title={t('Lock this chat with a PIN')}
        repeat
        hint={t('Asked each time the chat opens. Only this phone knows it.')}
        submitLabel={t('Lock')}
        onClose={() => setPinAsk(null)}
        onSubmit={async (pin) => {
          await telegramSetChatPin(chatId, await makeChatPin(pin));
          setPinAsk(null);
          setNote(t('{name} is locked with a PIN now: it asks for it each time the chat opens.', { name: chat.title }));
        }}
      />
      <PasswordSheet
        visible={pinAsk === 'off'}
        title={t('Type its PIN to take it off')}
        repeat={false}
        submitLabel={t('Take it off')}
        onClose={() => setPinAsk(null)}
        onSubmit={async (pin) => {
          const kept = telegramChatPin(chatId, where);
          if (kept && !(await opensChat(pin, kept))) return false;
          await telegramSetChatPin(chatId, null);
          setPinAsk(null);
          return true;
        }}
      />
    </Page>
  );
}
