// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { Button, Card, Chip, Field, Input, Page, Row, SectionTitle, Text, TextButton } from '../components/ui';
import { canPublicGroup } from '../lib/core';
import { MAX_GROUP_NAME } from '../lib/group-signal';
import { t } from '../lib/i18n';
import type { PublicGroups } from '../lib/public-groups';
import { parseJoinLink } from '../lib/public-rules';
import { spaceGroups, spaceGroupTransport } from '../lib/space-groups';
import { MAX_NAME } from '../lock/e2e-data';
import type { Asking } from '../lock/public-group-data';
import { useTheme } from '../theme/context';

// Public groups (lib/public-groups.ts): make one anyone with its link can ask to join, open a
// group's link that was pasted here, and the requests to join this phone sent, still waiting for
// the owner's phone. A link opened from elsewhere, or its QR code scanned, opens app/join.tsx.
/** How long a burner group lasts: never, a day, three days, a week. */
const BURNER_LASTS = [0, 24 * 3600_000, 3 * 24 * 3600_000, 7 * 24 * 3600_000];
const lastsLabel = (ms: number) => (ms === 0 ? t('Never') : ms === 24 * 3600_000 ? t('After a day') : t('After {n} days', { n: ms / (24 * 3600_000) }));

export default function PublicGroupsScreen() {
  const { colors } = useTheme();
  const [groups, setGroups] = useState<PublicGroups | null>(null);
  const [asking, setAsking] = useState<Asking[]>([]);
  const [name, setName] = useState('');
  const [mine, setMine] = useState('');
  // A burner group: deleted on every phone after this long (ms), or 0 for never.
  const [lasts, setLasts] = useState(0);
  const [approve, setApprove] = useState(false);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    let stop = () => undefined as void;
    let active = true;
    void spaceGroups()
      .then((from) => {
        if (!active) return;
        setGroups(from);
        setAsking(from.asking());
        stop = from.onChange(() => setAsking(from.asking()));
      })
      .catch((error) => setNote(error instanceof Error ? error.message : String(error)));
    return () => {
      active = false;
      stop();
    };
  }, []);

  if (!canPublicGroup()) {
    return (
      <Page>
        <Text variant="title">{t('Public groups')}</Text>
        <Text tone="muted">{t('This build of Erevos has no public groups yet. Update it to make or join one.')}</Text>
      </Page>
    );
  }

  async function make() {
    if (!groups) return;
    setBusy(true);
    setNote('');
    try {
      const id = await groups.createPublic(name, mine, approve, spaceGroupTransport, lasts > 0 ? Date.now() + lasts : 0);
      router.replace(`/public-group?id=${id}`);
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
      setBusy(false);
    }
  }

  function open() {
    const read = parseJoinLink(link);
    if (!read) {
      setNote(t('That is not a group’s link. It starts with erevos://join'));
      return;
    }
    router.push({ pathname: '/join', params: { g: read.group, d: read.door, relay: read.relay, rk: read.relayKey, k: read.key, n: read.name } });
  }

  return (
    <Page>
      <Text variant="title">{t('Public groups')}</Text>
      <Text tone="muted">
        {t('A public group is one anyone with its link or QR code can ask to join, with an owner and admins who moderate it. Its messages are end-to-end encrypted as in any group, and no server learns who is in it.')}
      </Text>

      <SectionTitle title={t('Make a public group')} />
      <Card>
        <Field label={t('Name')} hint={t('Whoever sees the link sees it too.')}>
          <Input value={name} onChangeText={setName} placeholder={t('Group name')} maxLength={MAX_GROUP_NAME} />
        </Field>
        <Field label={t('Your name in it')} hint={t('Members see this, not your contact name nor who you are in your chats.')}>
          <Input value={mine} onChangeText={setMine} placeholder={t('A name for this group')} maxLength={MAX_NAME} />
        </Field>
        <Text variant="label" tone="muted">
          {t('Who comes in')}
        </Text>
        <Row wrap>
          <Chip label={t('Anyone with the link')} selected={!approve} onPress={() => setApprove(false)} />
          <Chip label={t('An admin lets them in')} selected={approve} onPress={() => setApprove(true)} />
        </Row>
        <Text variant="label" tone="muted">
          {t('It ends')}
        </Text>
        <Row wrap>
          {BURNER_LASTS.map((ms) => (
            <Chip key={ms} label={lastsLabel(ms)} selected={lasts === ms} onPress={() => setLasts(ms)} />
          ))}
        </Row>
        {lasts > 0 ? (
          <Text variant="caption" tone="muted">
            {t('A group for one event: when its time is up, every member’s Erevos deletes it, with its messages, photos and files, and its link stops working. Each member is in it under a name and a key made for it alone.')}
          </Text>
        ) : null}
        <Text variant="caption" tone="muted">
          {t('You own the group: your phone lets people in, so they join once Erevos is open on it. Anyone with the link reads what is said from when they join, never what came before.')}
        </Text>
        <Button title={t('Make the public group')} onPress={() => void make()} disabled={busy || !name.trim() || !mine.trim()} loading={busy} />
      </Card>

      <SectionTitle title={t('Join by a link')} />
      <Card>
        <Input value={link} onChangeText={setLink} placeholder="erevos://join?…" autoCapitalize="none" autoCorrect={false} />
        <Button title={t('Open the link')} kind="secondary" onPress={open} disabled={!link.trim()} />
      </Card>

      {asking.length > 0 ? (
        <>
          <SectionTitle title={t('Waiting for an answer')} />
          {asking.map((a) => (
            <Row key={a.group}>
              <Text style={{ flex: 1 }} numberOfLines={1}>
                {a.title || t('A group')} · {a.name}
              </Text>
              <TextButton title={t('Stop asking')} onPress={() => void groups?.stopAsking(a.group)} />
            </Row>
          ))}
          <Text variant="caption" tone="muted">
            {t('The group shows in your chats once its owner’s phone lets you in.')}
          </Text>
        </>
      ) : null}

      {note ? <Text color={colors.danger}>{note}</Text> : null}
    </Page>
  );
}
