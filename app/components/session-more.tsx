// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ipGate } from './ip-warning';
import { Button, Chip, Input, Row, Sheet, Text } from './ui';
import { ask } from '../lib/alert';
import { t } from '../lib/i18n';
import { callsOff, callsOffNote } from '../lib/modes';
import { threadList } from '../lib/messenger';
import { messengerNow, sessionCall, sessionGroupChange, sessionMembers, sessionNewGroup, type SessionMember } from '../lib/messenger-store';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';

// What only Session has in Erevos+ (components/msg-chat.tsx, components/msg-account.tsx): calls
// in one-to-one chats, as the official Session apps make them (their own screen,
// messenger/.../calls), and its groups: new ones with us as admin, their name, members and admins,
// and leaving them. People join a group by accepting its invitation in their own app.

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** 📞 and 🎥 of a one-to-one Session chat. */
export function SessionCallButtons({ chatKey, name, onError }: { chatKey: string; name: string; onError: (e: unknown) => void }) {
  async function call(video: boolean) {
    try {
      // INVISIBLE (lib/modes.ts): no calls, and it is said before anything is asked.
      if (callsOff()) throw new Error(callsOffNote());
      if (!(await ipGate({ network: 'Session', act: 'call', of: `session:${chatKey}` }))) return;
      if (!(await sessionCall(chatKey, name, video))) onError(new Error(t('Another Session call is on.')));
    } catch (e) {
      onError(e);
    }
  }
  return (
    <Row>
      <Button title={`📞 ${t('Voice call')}`} kind="secondary" compact onPress={() => void call(false)} />
      <Button title={`🎥 ${t('Video call')}`} kind="secondary" compact onPress={() => void call(true)} />
    </Row>
  );
}

/** The one-to-one Session chats, to pick people from for a group. */
function sessionPeople(): { key: string; name: string }[] {
  return threadList(messengerNow('session'))
    .filter((c) => !c.group)
    .map((c) => ({ key: c.key, name: c.name || c.key }));
}

/** People to pick, as chips; the chosen keys in `chosen`. */
function PickPeople({ people, chosen, onChange }: { people: { key: string; name: string }[]; chosen: readonly string[]; onChange: (next: string[]) => void }) {
  if (!people.length) {
    return (
      <Text variant="caption" tone="muted">
        {t('No Session chats yet. Start a chat with each person you want in the group first.')}
      </Text>
    );
  }
  return (
    <Row wrap>
      {people.map((p) => {
        const on = chosen.includes(p.key);
        return <Chip key={p.key} label={p.name} selected={on} onPress={() => onChange(on ? chosen.filter((k) => k !== p.key) : [...chosen, p.key])} />;
      })}
    </Row>
  );
}

/** A new Session group, on the Session page: its name and people from Session chats. */
export function NewSessionGroup({ onOpen }: { onOpen: (key: string) => void }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [chosen, setChosen] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  if (!open) return <Button title={`👥 ${t('New Session group')}`} kind="secondary" onPress={() => setOpen(true)} />;
  async function make() {
    setBusy(true);
    setNote('');
    try {
      const key = await sessionNewGroup(title.trim(), chosen);
      if (!key) throw new Error(t('The group was not made.'));
      setOpen(false);
      setTitle('');
      setChosen([]);
      onOpen(key);
    } catch (e) {
      setNote(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: space.sm }}>
      <Text variant="label">{t('New Session group')}</Text>
      <Input value={title} onChangeText={setTitle} placeholder={t('Group name')} />
      <PickPeople people={sessionPeople()} chosen={chosen} onChange={setChosen} />
      <Text variant="caption" tone="muted">
        {t('Those you pick get an invitation and join when they accept it. You are the admin.')}
      </Text>
      {note ? (
        <Text variant="caption" color={colors.danger}>
          {note}
        </Text>
      ) : null}
      <Row>
        <Button title={t('Cancel')} kind="ghost" compact disabled={busy} onPress={() => setOpen(false)} />
        <Button title={t('Make the group')} compact disabled={busy || !title.trim() || !chosen.length} loading={busy} onPress={() => void make()} />
      </Row>
    </View>
  );
}

/** A Session group's button in its chat: a sheet with its name, members and admins, and leaving. */
export function SessionGroupButton({ chatKey, title, onLeft }: { chatKey: string; title: string; onLeft: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button title={`👥 ${t('Group')}`} kind="secondary" compact onPress={() => setOpen(true)} />
      <Sheet visible={open} onClose={() => setOpen(false)} title={title}>
        {open ? (
          <SessionGroup
            chatKey={chatKey}
            title={title}
            onLeft={() => {
              setOpen(false);
              onLeft();
            }}
          />
        ) : null}
      </Sheet>
    </>
  );
}

function SessionGroup({ chatKey, title, onLeft }: { chatKey: string; title: string; onLeft: () => void }) {
  const colors = useColors();
  const [members, setMembers] = useState<SessionMember[] | null>(null);
  const [name, setName] = useState(title);
  const [adding, setAdding] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const load = () => sessionMembers(chatKey).then(setMembers, (e: unknown) => setNote(errorText(e)));
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatKey]);

  const amAdmin = !!members?.find((m) => m.me)?.admin;
  const inGroup = new Set((members ?? []).map((m) => m.key));
  const others = sessionPeople().filter((p) => !inGroup.has(p.key));

  async function change(op: Parameters<typeof sessionGroupChange>[0], args: Record<string, unknown> = {}) {
    setBusy(true);
    setNote('');
    try {
      await sessionGroupChange(op, chatKey, args);
      if (op === 'leaveGroup') {
        onLeft();
        return;
      }
      if (op === 'addMembers') setAdding([]);
      await load();
    } catch (e) {
      setNote(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  function memberMenu(m: SessionMember) {
    if (!amAdmin || m.me) return;
    // Session cannot take an admin's rights back, nor remove an admin.
    if (m.admin) return;
    ask(m.name || t('Member'), '', [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Make admin'), onPress: () => void change('setAdmin', { person: m.key, admin: true }) },
      { text: t('Remove from the group'), style: 'destructive', onPress: () => void change('removeMember', { person: m.key }) },
    ]);
  }

  return (
    <View style={{ gap: space.md }}>
      {amAdmin ? (
        <Row>
          <Input style={{ flex: 1 }} value={name} onChangeText={setName} placeholder={t('Group name')} />
          <Button title={t('Rename')} compact disabled={busy || !name.trim() || name.trim() === title} onPress={() => void change('renameGroup', { title: name.trim() })} />
        </Row>
      ) : null}
      <Text variant="label">{members ? t('Members ({n})', { n: members.length }) : t('Members')}</Text>
      {members === null ? (
        <Text variant="caption" tone="muted">
          {t('Loading…')}
        </Text>
      ) : (
        <View style={{ gap: space.xs }}>
          {members.map((m) => {
            const notes = [m.me ? t('you') : '', m.admin ? t('admin') : '', m.inviteFailed ? t('invitation not sent') : m.invited ? t('invited') : ''].filter(Boolean).join(' · ');
            return <Button key={m.key || m.name} title={notes ? `${m.name || m.key} · ${notes}` : m.name || m.key} kind="ghost" disabled={!amAdmin || m.me || m.admin} onPress={() => memberMenu(m)} />;
          })}
        </View>
      )}
      {amAdmin ? (
        <View style={{ gap: space.sm }}>
          <Text variant="label">{t('Add people')}</Text>
          <PickPeople people={others} chosen={adding} onChange={setAdding} />
          {adding.length ? <Button title={t('Invite them')} compact disabled={busy} loading={busy} onPress={() => void change('addMembers', { people: adding })} /> : null}
        </View>
      ) : null}
      {note ? (
        <Text variant="caption" color={colors.danger}>
          {note}
        </Text>
      ) : null}
      <Button
        title={`🚪 ${t('Leave the group')}`}
        kind="danger"
        disabled={busy}
        onPress={() =>
          ask(t('Leave the group?'), t('The members will see that you left and you will no longer get its messages. To come back you need a new invitation.'), [
            { text: t('Cancel'), style: 'cancel' },
            { text: t('Leave'), style: 'destructive', onPress: () => void change('leaveGroup') },
          ])
        }
      />
    </View>
  );
}
