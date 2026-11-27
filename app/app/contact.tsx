// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { ConnectPicker, useCanConnect } from '../components/connect-picker';
import { Button, Field, Page, Text, TextButton } from '../components/ui';
import { amongPlace, type Among, type Card as ContactCard } from '../lib/contact-book';
import { contactLinkName, linkOfFields, offerContact, parseContact } from '../lib/contact-code';
import { useOpenHiddenPlace } from '../lib/hidden-contacts';
import { t } from '../lib/i18n';
import { linkCard } from '../lib/sealed-contacts';

// Opens from a scanned contact code, erevos://contact?id=...&relay=...&key=... (see lib/contact-code.ts),
// or a contact page's link (CONTACT_PAGE there, opened by pwa/c/), which may name its phone.
// Nothing is added until the person confirms, because any link can open this screen. Or added and
// connected to one of my contacts, whose name it then takes (components/connect-picker.tsx).

export default function Contact() {
  // All of the link, as it reads when pasted: its backup relays and where it reads on Nostr too.
  const fields = useLocalSearchParams<Record<string, string | string[]>>();
  const link = linkOfFields(fields);
  const code = parseContact(link);
  const name = contactLinkName(link);
  // The chats it goes to: open hidden chats beneath take it, so their contacts are offered; else the space's.
  const hiddenOpen = useOpenHiddenPlace();
  const among: Among = hiddenOpen ?? 'space';
  const canConnect = useCanConnect(among);
  const [picking, setPicking] = useState(false);

  if (!code) {
    return (
      <Page>
        <Text variant="title">{t('Not a contact code')}</Text>
        <Text tone="muted">{t('This link does not hold a server sender id that Erevos can use.')}</Text>
        <Button title={t('Close')} onPress={() => router.dismissTo('/')} />
      </Page>
    );
  }

  // Added, linked to the contact chosen, and named after it while it has no name of its own: the
  // chat it goes to does both, for its own contacts only (lib/contact-code.ts, offerFor).
  function addAndConnect(card: ContactCard) {
    const into = amongPlace(among);
    if (!code || !into) return;
    offerContact(code, { place: into, name: card.name, added: (identity) => void linkCard(into, card, identity).catch(() => undefined) });
    setPicking(false);
    router.dismissTo('/chat');
  }

  return (
    <Page>
      <Text variant="title">{t('Add a contact')}</Text>
      {name ? (
        <Field label={t('Name')}>
          <Text selectable>{name}</Text>
        </Field>
      ) : null}
      <Field label={t('Server sender id')}>
        <Text selectable variant="mono" style={{ fontSize: 13 }}>
          {code.senderHex || t('None yet: their phone has no server queue. You reach them nearby, over Wi-Fi or Bluetooth, until it has.')}
        </Text>
      </Field>
      <Field label={t('Server')}>
        <Text selectable variant="mono" style={{ fontSize: 13 }}>
          {code.relayUrl || (code.senderHex ? t('Not given. The chat uses the server this phone already has.') : t('None yet.'))}
        </Text>
      </Field>
      <Field label={t('Keys')}>
        <Text tone="muted">
          {code.key
            ? t('Included. Messages to this contact are end-to-end encrypted.')
            : t('Missing. This code is from an older version of Erevos and cannot be added. Ask for a new one.')}
        </Text>
      </Field>
      <Text tone="muted">
        {t("Add it only if you scanned it from the other person's phone yourself. Then compare the safety number in the chat with theirs.")}
      </Text>
      <Button
        title={t('Add to chat')}
        onPress={() => {
          const into = name ? amongPlace(among) : null;
          offerContact(code, into ? { place: into, name } : undefined);
          router.dismissTo('/chat');
        }}
      />
      {!!code.key && canConnect ? <Button title={t('Add and connect to one of my contacts')} kind="secondary" onPress={() => setPicking(true)} /> : null}
      <TextButton title={t('Cancel')} onPress={() => router.dismissTo('/')} />
      <ConnectPicker visible={picking} among={among} onPick={addAndConnect} onClose={() => setPicking(false)} />
    </Page>
  );
}
