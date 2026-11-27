// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Platform, Share } from 'react-native';

import { Button, Field, Input, Row, Sheet, Text, TextButton } from './ui';
import { contactPageLink } from '../lib/contact-code';
import { t } from '../lib/i18n';

// Link for a website (lib/contact-code.ts, contactPageLink): this phone's contact link as a link to
// a page anyone may open, as on a contact page. It lasts as long as the contact link does, has no
// place on the relay in it, and whoever adds it writes a message request first.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

export function WebsiteLink({ visible, onClose, contactLink, name: given, onNote }: {
  visible: boolean;
  onClose: () => void;
  /** This phone's contact link. */
  contactLink: string | null;
  /** The name this phone gave itself last (lib/e2e.ts, invitedAs), or ''. */
  name: string;
  onNote: (note: string) => void;
}) {
  const [name, setName] = useState('');
  const [failed, setFailed] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(given);
    setFailed('');
  }, [visible]);

  const link = contactLink ? contactPageLink(contactLink, name) : null;

  async function share() {
    if (!link) return;
    setFailed('');
    try {
      // A computer has no share sheet: the link is copied, to paste where it should go.
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(link);
        onNote(t('Link for a website copied.'));
        onClose();
        return;
      }
      await Share.share({ message: link });
    } catch (error) {
      setFailed(errorText(error));
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title={t('Link for a website')}>
      <Text tone="muted">
        {t('A link to put on a web page, such as your contact page: it opens a page that offers Erevos to whoever has no Erevos yet, then adds you. It works for as long as your contact link does.')}
      </Text>
      <Text variant="caption" tone="muted">
        {t('Anyone can see it, so anyone can write to you: what they send comes as a message request, which you accept or refuse, and you can block them. It gives no one a place on your server. New contact link ends it.')}
      </Text>
      <Field label={t('Your name, for them')} hint={t('Shown on the page, and their phone names you with it. Optional.')}>
        <Input value={name} onChangeText={setName} placeholder={t('Your name')} maxLength={40} autoCorrect={false} />
      </Field>
      {link ? null : (
        <Text variant="caption" tone="muted">
          {t('Your contact link has no keys yet, so there is no link for a website.')}
        </Text>
      )}
      {failed ? <Text variant="caption" tone="muted">{failed}</Text> : null}
      <Row wrap>
        <Button title={Platform.OS === 'web' ? t('Copy the link') : t('Share the link')} compact disabled={!link} onPress={() => void share()} />
        <TextButton title={t('Cancel')} onPress={onClose} />
      </Row>
    </Sheet>
  );
}
