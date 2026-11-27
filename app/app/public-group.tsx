// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { clock, dayText } from '../components/chat-thread-lines';
import { askThread } from '../components/group-messages';
import { KeyFace } from '../components/key-face';
import { LinkedText } from '../components/linked-text';
import { messageLine, shareGroupLink } from '../components/public-group';
import { QrCode } from '../components/QrCode';
import { Button, Card, Chip, Field, Input, Page, Row, SectionTitle, Text, TextButton } from '../components/ui';
import { confirm } from '../lib/alert';
import { MAX_GROUP_NAME } from '../lib/group-signal';
import { MAX_GROUP_DESC, type GroupInfo } from '../lib/groups';
import { t } from '../lib/i18n';
import type { PublicGroups, PublicInfo, PublicMember } from '../lib/public-groups';
import { publicName } from '../lib/public-rules';
import { spaceGroups, spaceGroupTransport } from '../lib/space-groups';
import type { GroupMessage } from '../lock/group-data';
import { useTheme } from '../theme/context';

// A public group's link and moderation (lib/public-groups.ts, docs/public-groups.md): the link and
// its QR code for anyone to join by, who asks and waits, the members with who owns the group and
// who are its admins, the bans, and the latest messages, to delete for everyone. What each may do
// shows only to whoever may do it: the owner names admins, changes the link, chooses whether an
// admin lets in each who asks, and hands the group over; admins mute, take out, ban and delete, and
// say what the group is about (its description, which every member sees here).
// Search in this chat and Export chat go to the group's thread and do it there
// (components/group-messages.tsx).

// The latest messages an admin can delete from here.
const DELETABLE = 30;

export default function PublicGroupScreen() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useTheme();
  const [groups, setGroups] = useState<PublicGroups | null>(null);
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [info, setInfo] = useState<PublicInfo | null>(null);
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [chosen, setChosen] = useState('');
  const [rename, setRename] = useState('');
  // What the group is about, as an admin types it.
  const [about, setAbout] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async (from: PublicGroups) => {
    setGroup(from.list().find((g) => g.id === id) ?? null);
    setInfo(from.publicInfo(id));
    setMessages(from.messages(id));
    setMembers(await from.publicMembers(id).catch(() => []));
  }, [id]);

  useEffect(() => {
    let stop = () => undefined as void;
    let active = true;
    void spaceGroups()
      .then((from) => {
        if (!active) return;
        setGroups(from);
        setRename(from.list().find((g) => g.id === id)?.name ?? '');
        setAbout(from.list().find((g) => g.id === id)?.desc ?? '');
        void load(from);
        stop = from.onChange(() => void load(from));
      })
      .catch((error) => setNote(error instanceof Error ? error.message : String(error)));
    return () => {
      active = false;
      stop();
    };
  }, [id, load]);

  const run = async (action: (from: PublicGroups) => Promise<void>, done = '') => {
    if (!groups) return;
    setBusy(true);
    setNote('');
    try {
      await action(groups);
      setNote(done);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  if (!group || !info) {
    return (
      <Page>
        <Text tone="muted">{note || t('This group is not here.')}</Text>
      </Page>
    );
  }

  const out = group.status !== 'in';
  const name = (key: string) => groups?.nameIn(id, key) ?? '';
  const me = members.find((m) => m.me);
  const roleOf = (key: string) => members.find((m) => m.key === key)?.role ?? 'member';
  // The owner moderates anyone else; an admin, members.
  const over = (m: PublicMember) => !m.me && info.admin && m.role !== 'owner' && (info.owner || m.role === 'member');
  const deletable = info.admin
    ? messages
        .filter((m) => !m.note && m.tag && (!m.from || (info.owner ? m.from !== info.me : roleOf(m.from) === 'member')))
        .slice(-DELETABLE)
        .reverse()
    : [];
  const role = (m: PublicMember) => (m.role === 'owner' ? t('owner') : m.role === 'admin' ? t('admin') : '');

  return (
    <Page>
      <Text variant="title">{group.name}</Text>
      <Text tone="muted">
        {out
          ? t('You are not in this group')
          : info.owner
            ? t('A public group you own. Your phone lets people in when Erevos is open on it.')
            : info.admin
              ? t('A public group you are an admin of.')
              : t('A public group. Anyone with its link can ask to join.')}
      </Text>
      {!out && info.ends > 0 ? (
        <Text tone="muted">
          {t('A burner group: it ends on {day} at {time}, and then every member’s Erevos deletes it, with its messages, photos and files.', { day: dayText(info.ends), time: clock(info.ends) })}
        </Text>
      ) : null}
      {group.desc && !(info.admin && !out) ? (
        <Text>
          <LinkedText text={group.desc} />
        </Text>
      ) : null}
      {!out && info.admin ? (
        <Card>
          <Field label={t('Description')}>
            <Input value={about} onChangeText={setAbout} maxLength={MAX_GROUP_DESC} multiline />
          </Field>
          <Button
            title={t('Save')}
            kind="secondary"
            compact
            disabled={busy || about.trim() === group.desc}
            onPress={() => void run((from) => from.describe(id, about, spaceGroupTransport))}
          />
        </Card>
      ) : null}

      {!out && info.link ? (
        <Card>
          <Text variant="bodyStrong">{t('The group’s link')}</Text>
          <View style={{ alignItems: 'center' }}>
            <QrCode text={info.link} size={220} />
          </View>
          <Text selectable variant="mono" style={{ fontSize: 12 }}>
            {info.link}
          </Text>
          <Row wrap>
            <Button title={t('Share the link')} compact onPress={() => void shareGroupLink(info.link).then(setNote, (error) => setNote(String(error)))} />
            {info.owner ? (
              <Button
                title={t('Change the link')}
                kind="secondary"
                compact
                disabled={busy}
                onPress={() =>
                  void confirm(t('Change the link'), t('The link and QR code shared so far stop working. Requests still waiting at the old one are lost.'), t('Change')).then((ok) => {
                    if (ok) void run((from) => from.changeLink(id, spaceGroupTransport), t('The group has a new link. The old one no longer works.'));
                  })
                }
              />
            ) : null}
          </Row>
          <Text variant="caption" tone="muted">
            {t('Whoever has this link can ask to join, and read the group from when they are let in: never what was said before. Share it only where you mean to.')}
          </Text>
        </Card>
      ) : !out ? (
        <Text tone="muted">{t('The link is made once the owner’s phone has a queue for it on its server.')}</Text>
      ) : null}

      {!out && info.owner ? (
        <Card>
          <Text variant="bodyStrong">{t('Who comes in')}</Text>
          <Row wrap>
            <Chip label={t('Anyone with the link')} selected={!info.approve} disabled={busy} onPress={() => info.approve && void run((from) => from.setApprove(id, false, spaceGroupTransport))} />
            <Chip label={t('An admin lets them in')} selected={info.approve} disabled={busy} onPress={() => !info.approve && void run((from) => from.setApprove(id, true, spaceGroupTransport))} />
          </Row>
          <Field label={t('Group name')}>
            <Input value={rename} onChangeText={setRename} maxLength={MAX_GROUP_NAME} />
          </Field>
          <Button
            title={t('Rename')}
            kind="secondary"
            compact
            disabled={busy || !rename.trim() || rename.trim() === group.name}
            onPress={() => void run((from) => from.rename(id, rename, spaceGroupTransport))}
          />
        </Card>
      ) : null}

      {!out && info.admin && info.waiting.length > 0 ? (
        <>
          <SectionTitle title={t('Asking to join')} />
          {info.waiting.map((w) => (
            <Row key={w.key}>
              <KeyFace identity={w.key} name={w.name} size={36} />
              <Text style={{ flex: 1 }} numberOfLines={1}>
                {publicName(w.name, w.key)}
              </Text>
              <TextButton title={t('Let in')} onPress={() => void run((from) => from.letIn(id, w.key, true, spaceGroupTransport))} />
              <TextButton title={t('Turn away')} onPress={() => void run((from) => from.letIn(id, w.key, false, spaceGroupTransport))} />
            </Row>
          ))}
          {!info.owner ? <Text variant="caption" tone="muted">{t('The owner’s phone lets them in once it hears your answer, when Erevos is open on it.')}</Text> : null}
        </>
      ) : null}

      {!out ? (
        <>
          <SectionTitle title={t('Members')} />
          <Text variant="caption" tone="muted">
            {t('{n} in the group. Names are chosen, not proven: the start of each member’s key shows beside it.', { n: members.length })}
          </Text>
          {members.map((m) => (
            <View key={m.key} style={{ gap: 6 }}>
              <Row>
                <KeyFace identity={m.key} name={m.name} size={36} />
                <Text style={{ flex: 1 }} numberOfLines={1}>
                  {m.me ? t('You') : name(m.key)}
                  {role(m) ? `  · ${role(m)}` : ''}
                  {m.muted ? `  · ${t('muted')}` : ''}
                </Text>
                {over(m) ? <TextButton title={chosen === m.key ? t('Done') : t('Moderate')} onPress={() => setChosen(chosen === m.key ? '' : m.key)} /> : null}
              </Row>
              {chosen === m.key && over(m) ? (
                <Row wrap>
                  <Button
                    title={m.muted ? t('Let them write') : t('Mute')}
                    kind="secondary"
                    compact
                    disabled={busy}
                    onPress={() => void run((from) => from.mute(id, m.key, !m.muted, spaceGroupTransport))}
                  />
                  <Button
                    title={t('Take out')}
                    kind="secondary"
                    compact
                    disabled={busy}
                    onPress={() =>
                      void confirm(t('Take out'), t('{name} reads nothing the group says from now on, and can ask to join again by the link.', { name: name(m.key) })).then((ok) => {
                        if (ok) void run((from) => from.takeOut(id, m.key, spaceGroupTransport));
                      })
                    }
                  />
                  <Button
                    title={t('Ban')}
                    kind="secondary"
                    compact
                    disabled={busy}
                    onPress={() =>
                      void confirm(t('Ban'), t('{name} is taken out, and what their phone asks after is turned away.', { name: name(m.key) })).then((ok) => {
                        if (ok) void run((from) => from.ban(id, m.key, true, spaceGroupTransport));
                      })
                    }
                  />
                  {info.owner ? (
                    <Button
                      title={m.role === 'admin' ? t('No longer an admin') : t('Make an admin')}
                      kind="secondary"
                      compact
                      disabled={busy}
                      onPress={() => void run((from) => from.setAdmin(id, m.key, m.role !== 'admin', spaceGroupTransport))}
                    />
                  ) : null}
                  {info.owner ? (
                    <Button
                      title={t('Hand the group over')}
                      kind="secondary"
                      compact
                      disabled={busy}
                      onPress={() =>
                        void confirm(
                          t('Hand the group over'),
                          t('{name} owns the group from then on: their phone lets people in, and the link changes to one on their server. You stay an admin.', { name: name(m.key) }),
                          t('Hand over'),
                        ).then((ok) => {
                          if (ok) void run((from) => from.handOver(id, m.key, spaceGroupTransport));
                        })
                      }
                    />
                  ) : null}
                </Row>
              ) : null}
            </View>
          ))}
          {me?.muted ? <Text color={colors.danger}>{t('An admin muted you in this group.')}</Text> : null}
        </>
      ) : null}

      {!out && info.admin && info.bans.length > 0 ? (
        <>
          <SectionTitle title={t('Banned')} />
          {info.bans.map((b) => (
            <Row key={b.key}>
              <Text style={{ flex: 1 }} numberOfLines={1}>
                {publicName(b.name, b.key)}
              </Text>
              <TextButton title={t('Lift the ban')} onPress={() => void run((from) => from.ban(id, b.key, false, spaceGroupTransport))} />
            </Row>
          ))}
        </>
      ) : null}

      {!out && deletable.length > 0 ? (
        <>
          <SectionTitle title={t('Delete for everyone')} />
          <Text variant="caption" tone="muted">
            {t('Each member’s phone deletes it when it hears. Whoever read it already may have kept a copy.')}
          </Text>
          {deletable.map((m) => (
            <Row key={`${m.from}|${m.tag}`}>
              <Text style={{ flex: 1 }} numberOfLines={2}>
                <Text variant="label" color={colors.accentText}>
                  {m.from ? name(m.from) : t('You')}
                </Text>
                {`  ${messageLine(m)}`}
              </Text>
              <TextButton
                title={t('Delete')}
                onPress={() =>
                  void confirm(t('Delete for everyone'), t('It goes from every member’s phone, as from yours.'), t('Delete')).then((ok) => {
                    if (ok) void run((from) => from.deleteForEveryone(id, m, spaceGroupTransport));
                  })
                }
              />
            </Row>
          ))}
        </>
      ) : null}

      <Row wrap>
        <Button
          title={t('Search in this chat')}
          kind="secondary"
          compact
          onPress={() => {
            askThread(id, 'search');
            router.dismissTo(`/group?id=${id}`);
          }}
        />
        <Button
          title={t('Export chat')}
          kind="secondary"
          compact
          onPress={() => {
            askThread(id, 'export');
            router.dismissTo(`/group?id=${id}`);
          }}
        />
      </Row>

      {note ? <Text tone="muted">{note}</Text> : null}

      {out ? (
        <Button
          title={t('Delete the group here')}
          kind="secondary"
          onPress={() =>
            void confirm(t('Delete the group'), t('Its messages are deleted from this phone.'), t('Delete')).then((ok) => {
              if (ok) void run(async (from) => {
                await from.forget(id);
                router.dismissTo('/');
              });
            })
          }
        />
      ) : (
        <Button
          title={info.owner ? t('Close the group') : t('Leave the group')}
          kind="secondary"
          disabled={busy}
          onPress={() =>
            void confirm(
              info.owner ? t('Close the group') : t('Leave the group'),
              info.owner
                ? t('You own it: closing it takes every member out, and no one can write in it again. To keep it going without you, hand it over first.')
                : t('The owner’s phone takes you out the next time Erevos is open on it. You read nothing the group says after.'),
              info.owner ? t('Close') : t('Leave'),
            ).then((ok) => {
              if (ok) void run((from) => from.leave(id, spaceGroupTransport));
            })
          }
        />
      )}
    </Page>
  );
}
