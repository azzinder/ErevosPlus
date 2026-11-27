// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Platform, Share, View } from 'react-native';

import { QrCode } from './QrCode';
import { Button, Field, Input, Row, Sheet, Text, TextButton } from './ui';
import { confirm } from '../lib/alert';
import type { E2E } from '../lib/e2e';
import { t } from '../lib/i18n';
import { laterDay, laterLabel } from '../lib/later';
import { listInvites, makeInvite, takeBackInvite, type InviteListed, type Relay } from '../lib/relay';
import { inviteLink } from '../lib/relay-invite';

// Invites to the relay (lib/relay.ts, crates/erevos-relay/src/invites.rs), under the token in Relay
// and new contacts: with a token of its own on a relay that invites, this phone makes an invite for
// one more phone, named with random letters there and as typed here, and shows it as a QR code. It shows only when the relay says this
// phone may invite. Nothing of the invites is kept here: the relay lists them each time, and taking
// one back that was used cuts that phone off.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

export function RelayInvites({ relay, e2e = null, onNote }: { relay: Relay | null; e2e?: E2E | null; onNote: (note: string) => void }) {
  // This phone's invites; null when it cannot invite here.
  const [listed, setListed] = useState<InviteListed[] | null>(null);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<{ link: string; name: string; expires: number } | null>(null);

  const url = relay?.url ?? '';
  const token = relay?.token ?? '';
  async function look(active = () => true) {
    if (!relay) {
      setListed(null);
      return;
    }
    try {
      const now = await listInvites(relay);
      if (active()) setListed(now);
    } catch {
      // The relay cannot be reached now: nothing to invite with until it can.
      if (active()) setListed(null);
    }
  }
  useEffect(() => {
    let on = true;
    setNaming(false);
    void look(() => on);
    return () => {
      on = false;
    };
  }, [url, token]);

  if (!relay || !listed) return null;

  async function invite() {
    const typed = name.trim();
    if (!relay || !typed || busy) return;
    setBusy(true);
    try {
      // The relay has a name of random letters for them; the one typed stays here (lib/e2e.ts lineFor).
      const got = await makeInvite(relay, e2e ? await e2e.lineFor(typed) : typed);
      if (!got) {
        onNote(t('This server does not take invites from this phone.'));
        return;
      }
      setMade({ link: inviteLink({ relayUrl: relay.url, code: got.code }), name: typed, expires: got.expires });
      setNaming(false);
      setName('');
      await look();
    } catch (error) {
      onNote(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  async function share(link: string) {
    try {
      // A computer has no share sheet: the link is copied, to paste where it should go.
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(link);
        onNote(t('Invite copied.'));
        return;
      }
      await Share.share({ message: link });
    } catch (error) {
      onNote(errorText(error));
    }
  }

  // Who an invite is for: the name typed here, or the relay's for one made elsewhere or before.
  const shownName = (invite: InviteListed) => e2e?.lineName(invite.name) || invite.name;

  async function takeBack(invite: InviteListed) {
    const sure = invite.used
      ? await confirm(
          t("Take back {name}'s access?", { name: shownName(invite) }),
          t('Their phone can no longer use this server from now on. The phones it invited keep theirs.'),
          t('Take back'),
        )
      : await confirm(t('Take back this invite?'), t('Its QR code no longer lets a phone in.'), t('Take back'));
    if (!sure || !relay) return;
    try {
      onNote((await takeBackInvite(relay, invite.id)) ? t('Taken back.') : t('That invite was gone already.'));
    } catch (error) {
      onNote(errorText(error));
    }
    await look();
  }

  return (
    <View style={{ gap: 6 }}>
      {naming ? (
        <>
          <Field label={t('Who is it for?')}>
            <Input value={name} onChangeText={setName} placeholder={t('Maria')} autoCorrect={false} onSubmitEditing={() => void invite()} />
          </Field>
          <Row wrap>
            <Button title={t('Make the invite')} compact loading={busy} disabled={!name.trim()} onPress={() => void invite()} />
            <TextButton title={t('Cancel')} onPress={() => setNaming(false)} />
          </Row>
        </>
      ) : (
        <Row wrap>
          <Button title={t('Invite to the server')} kind="secondary" compact onPress={() => setNaming(true)} />
        </Row>
      )}
      <Text variant="caption" tone="muted">
        {t(
          "An invite lets one more phone use this server, with a token of its own, which stays even once yours goes. The server's operator sees that you invited it, and for it only a name of random letters and digits: the name you give stays on this phone.",
        )}
      </Text>
      {listed.length > 0 ? (
        <View style={{ gap: 4 }}>
          <Text tone="muted">{t('Your invites')}</Text>
          {listed.map((invite) => (
            <Row key={invite.id} wrap>
              <View style={{ flex: 1, minWidth: 160 }}>
                <Text>{shownName(invite)}</Text>
                <Text variant="caption" tone="muted">
                  {invite.used
                    ? t('Uses the server since {day}', { day: laterDay(invite.used) })
                    : t('Waiting, until {when}', { when: laterLabel(invite.expires) })}
                </Text>
              </View>
              <TextButton title={t('Take back')} onPress={() => void takeBack(invite)} />
            </Row>
          ))}
        </View>
      ) : null}
      <Sheet visible={!!made} onClose={() => setMade(null)} title={made ? t('Invite for {name}', { name: made.name }) : undefined}>
        {made ? <QrCode text={made.link} size={240} /> : null}
        {made ? (
          <Text variant="caption" tone="muted">
            {t(
              "For one phone, until {when}. Let their phone scan it with its camera and open the link in Erevos: it then uses this server with a token of its own, typing nothing. Whoever takes it first has it, so show it to them only.",
              { when: laterLabel(made.expires) },
            )}
          </Text>
        ) : null}
        <Row wrap>
          <Button title={t('Done')} compact onPress={() => setMade(null)} />
          {made ? (
            <Button
              title={Platform.OS === 'web' ? t('Copy the invite') : t('Share the invite')}
              kind="secondary"
              compact
              onPress={() => void share(made.link)}
            />
          ) : null}
        </Row>
      </Sheet>
    </View>
  );
}
