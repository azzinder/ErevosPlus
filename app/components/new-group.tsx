// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { canGroup } from '../lib/core';
import { t } from '../lib/i18n';
import { MAX_GROUP_NAME } from '../lib/group-signal';
import { useTheme } from '../theme/context';
import { ContactPicker, groupableContacts, type Pick } from './contact-picker';
import { useGroupsWhere } from './groups-at';
import { Button, Card, Field, Input, Text } from './ui';

// A new group: its name, and the contacts asked to join, of the space or of a hidden place
// (components/groups-at.tsx). Whoever makes it is its admin (lib/groups.ts); each contact's phone
// joins by itself once it answers.

/** Makes a group, then hands its id to `onMade`. */
export function NewGroupForm({ onMade }: { onMade: (id: string) => void }) {
  const { colors } = useTheme();
  const { at } = useGroupsWhere();
  const [name, setName] = useState('');
  const [contacts, setContacts] = useState<Pick[] | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    groupableContacts(at.chats).then(setContacts, () => setContacts([]));
  }, [at]);

  if (!canGroup()) return <Text tone="muted">{t('This build of Erevos has no group chats yet. Update it to make one.')}</Text>;

  function toggle(identity: string) {
    setChosen((before) => {
      const next = new Set(before);
      if (next.has(identity)) next.delete(identity);
      else next.add(identity);
      return next;
    });
  }

  async function make() {
    setBusy(true);
    setNote('');
    try {
      const groups = await at.groups();
      onMade(await groups.create(name, [...chosen], at.transport));
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
      setBusy(false);
    }
  }

  return (
    <>
      <Field label={t('Name')} hint={t('Every member sees it.')}>
        <Input value={name} onChangeText={setName} placeholder={t('Group name')} maxLength={MAX_GROUP_NAME} autoFocus />
      </Field>
      <Card>
        <Text variant="bodyStrong">{t('Who to ask')}</Text>
        {contacts === null ? null : contacts.length === 0 ? (
          <Text tone="muted">{t('No contacts yet. Add someone in a chat first, then make a group with them.')}</Text>
        ) : (
          <ContactPicker contacts={contacts} chosen={chosen} onToggle={toggle} />
        )}
      </Card>
      <Text variant="caption" tone="muted">
        {t(
          "You are the group's admin: you add and take out members. Each contact's phone joins by itself the next time Erevos is open there. Messages are end-to-end encrypted for the whole group (MLS), and no server learns who is in it.",
        )}
      </Text>
      {note ? <Text color={colors.danger}>{note}</Text> : null}
      <Button title={t('Make the group')} onPress={make} disabled={busy || !name.trim()} loading={busy} />
    </>
  );
}
