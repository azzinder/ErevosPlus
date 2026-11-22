// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { t } from '../lib/i18n';
import { nameOf } from '../lib/telegram';
import { telegramContacts, telegramFindByName, telegramNow, type TgRights } from '../lib/telegram-store';
import type { NetworkWhere } from '../lib/network-place';
import { space } from '../theme/colors';

import { Button, Input, Row, Sheet, Text, Toggle } from './ui';

// The sheets of a Telegram group's or channel's members (app/telegram-info.tsx): an admin's rights,
// to make a member an admin or change what an admin may do, and someone to add, from the account's
// contacts or found by their @name.

/** The rights a group's admin can have, and a channel's; each with what it is called. */
const rightsShown = (channel: boolean): [keyof TgRights, string][] =>
  channel
    ? [
        ['changeInfo', t('Change channel info')],
        ['postMessages', t('Post messages')],
        ['editMessages', t('Edit messages of others')],
        ['deleteMessages', t('Delete messages of others')],
        ['inviteUsers', t('Add members')],
        ['manageVideoChats', t('Manage live streams')],
        ['addAdmins', t('Add new admins')],
      ]
    : [
        ['changeInfo', t('Change group info')],
        ['deleteMessages', t('Delete messages')],
        ['banUsers', t('Ban members')],
        ['inviteUsers', t('Add members')],
        ['pinMessages', t('Pin messages')],
        ['manageVideoChats', t('Manage video chats')],
        ['addAdmins', t('Add new admins')],
        ['anonymous', t('Stay anonymous')],
      ];

/**
 * What an admin may do, as switches: Save makes them an admin with these rights, and an admin can be
 * made a plain member again. Only rights we have ourselves can be given (`mine`), as Telegram allows.
 */
export function AdminSheet({ visible, onClose, name, channel, rights, mine, isAdmin, onSave, onDemote }: {
  visible: boolean;
  onClose: () => void;
  name: string;
  channel: boolean;
  rights: TgRights;
  mine: TgRights | undefined;
  isAdmin: boolean;
  onSave: (rights: TgRights) => void;
  onDemote: () => void;
}) {
  const [now, setNow] = useState(rights);
  useEffect(() => {
    if (visible) setNow(rights);
  }, [visible]);
  return (
    <Sheet visible={visible} onClose={onClose} title={isAdmin ? t('Admin rights of {name}', { name }) : t('Make {name} an admin', { name })}>
      {rightsShown(channel).map(([key, label]) => {
        const allowed = mine?.[key] !== false;
        return (
          <Pressable
            key={key}
            disabled={!allowed}
            onPress={() => setNow((r) => ({ ...r, [key]: !r[key] }))}
            accessibilityRole="switch"
            accessibilityLabel={label}
            accessibilityState={{ checked: now[key], disabled: !allowed }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs, opacity: allowed ? 1 : 0.5 }}
          >
            <Text style={{ flex: 1 }}>{label}</Text>
            <Toggle on={now[key]} />
          </Pressable>
        );
      })}
      <Button title={isAdmin ? t('Save') : t('Make admin')} onPress={() => onSave(now)} />
      {isAdmin ? <Button title={t('Dismiss admin')} kind="secondary" onPress={onDemote} /> : null}
    </Sheet>
  );
}

/**
 * Someone to add to a group or channel: the account's contacts (the ones already in it left out),
 * narrowed as a name is written, or anyone found by their @name.
 */
export function AddMemberSheet({ visible, onClose, where, present, onAdd }: { visible: boolean; onClose: () => void; where: NetworkWhere; present: number[]; onAdd: (userId: number) => void }) {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<number[]>([]);
  const [note, setNote] = useState('');
  useEffect(() => {
    if (!visible) return;
    setQuery('');
    setNote('');
  }, [visible]);
  useEffect(() => {
    if (!visible) return;
    let alive = true;
    const timer = setTimeout(() => {
      telegramContacts(query.startsWith('@') ? '' : query).then(
        (ids) => alive && setFound(ids),
        (error: unknown) => alive && setNote(error instanceof Error ? error.message : String(error)),
      );
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [visible, query]);
  const state = telegramNow(where).state;
  const nameOfUser = (id: number) => (state ? nameOf(state, id) : '') || '…';

  async function byName() {
    setNote('');
    const chatId = await telegramFindByName(query).catch(() => null);
    const userId = chatId !== null ? telegramNow(where).state?.chats[chatId]?.userId : undefined;
    if (userId === undefined) setNote(t('Nobody with that name.'));
    else onAdd(userId);
  }

  const shown = found.filter((id) => !present.includes(id) && id !== state?.me);
  return (
    <Sheet visible={visible} onClose={onClose} title={t('Add member')}>
      <Row>
        <Input
          style={{ flex: 1 }}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
          placeholder={t('Name or @name')}
          accessibilityLabel={t('Name or @name')}
          onSubmitEditing={() => query.startsWith('@') && void byName()}
        />
        {query.startsWith('@') && query.length > 1 ? <Button title={t('Find')} compact onPress={() => void byName()} /> : null}
      </Row>
      <ScrollView style={{ maxHeight: 360 }}>
        {shown.map((id) => (
          <Pressable key={id} onPress={() => onAdd(id)} accessibilityRole="button" style={{ paddingVertical: space.sm }}>
            <Text numberOfLines={1}>{nameOfUser(id)}</Text>
          </Pressable>
        ))}
        {shown.length === 0 && !query.startsWith('@') ? <Text tone="muted">{t('No contacts to add.')}</Text> : null}
      </ScrollView>
      {note ? <Text tone="muted">{note}</Text> : null}
    </Sheet>
  );
}
