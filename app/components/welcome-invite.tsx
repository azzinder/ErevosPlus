// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';
import { Platform, Share, StyleSheet, View } from 'react-native';

import { QrCode } from './QrCode';
import { Button, Field, Input, Row, Text, TextButton } from './ui';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { WELCOME_DAYS, type E2E } from '../lib/e2e';
import { t } from '../lib/i18n';
import { laterLabel } from '../lib/later';
import { makeInvite, type Relay } from '../lib/relay';
import { oldToken } from '../lib/relay-signin';
import { useNfcShare } from '../lib/nfc-share';
import { makeShortInvite, nameShortInvite, shortInviteWaits, takeBackShortInvite, waitingShortInvite, type ShortInvite } from '../lib/sms-relay';
import { textInviteLink } from '../lib/text-invite';
import { welcomeLink } from '../lib/welcome';
import { MAX_NAME } from '../lock/e2e-data';
import { currentSpace } from '../lock/keys';
import { loadCurrentSpaceData } from '../lock/space-data';
import { radius, space } from '../theme/colors';
import { useColors } from '../theme/context';

// Invite someone (lib/welcome.ts): one QR code or link, for one person, for 7 days. Their phone
// opens it in Erevos and joins: it takes access of its own to this phone's relay (an invite to it,
// when the relay lets this phone invite), and the two are each other's contacts at once. The name
// typed for them stays here: their access on the relay has a name of random letters (E2E.lineFor).
// On New chat (app/chat.tsx) it shows two ways. Far away is a page: the message that goes, to send
// with any app, how far it has come, and who it is for and the name this phone gives itself, typed
// below or never (E2E.nameInvite). Near me (components/near-me.tsx) has only its QR code, `inline`,
// for the phone beside this one to scan. The invite is made as either opens. The relay lets a phone
// make only a few invites a day, so one opened again soon after, for the same one still waiting,
// shows that one again; Invite someone else makes another.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

/** How long the invite last made shows again when it opens, while no one took it. */
const SHOWN_AGAIN_MS = 15 * 60_000;

// A short invite (lib/sms-relay.ts makeShortInvite, `short`), small enough for any camera, or,
// where the relay lets this phone make none, the long one (lib/welcome.ts), with its secret `hi`.
type Made = { link: string; hi: string; line: string; code: string | null; until: number; access: boolean; at: number; short?: ShortInvite };

// The invite last made while Erevos runs, by space and contact link: never kept anywhere else.
let lastMade: { key: string; made: Made; name: string } | null = null;

export function WelcomeInvite({ visible, inline = false, onPlain, e2e, relay, onOwnLine, contactLink, onNote }: {
  visible: boolean;
  /** On Near me: the invite's QR code and a new one, with nothing around it. */
  inline?: boolean;
  /** With `inline`, when no invite can be made (no internet, say): told, so the contact link's QR
   *  code shows instead, which needs none. */
  onPlain?: () => void;
  e2e: E2E | null;
  /** This phone's relay, with its token of its own; null when it has none to invite with. */
  relay: Relay | null;
  /** Trades the relay's one token in `relay`, typed in, for one of this phone's own: the relay
   *  with it, or null when the relay does not do so (app/chat.tsx, ownLine). */
  onOwnLine: (relay: Relay) => Promise<Relay | null>;
  /** This phone's contact link (lib/contact-code.ts). */
  contactLink: string | null;
  onNote: (note: string) => void;
}) {
  const [name, setName] = useState('');
  const [as, setAs] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState('');
  const [made, setMade] = useState<Made | null>(null);
  // The page: whether its QR code shows, whether the invite still waits for its phone, and one taken back.
  const [qrShown, setQrShown] = useState(false);
  const [waits, setWaits] = useState(true);
  const [back, setBack] = useState(false);
  const colors = useColors();
  const making = useRef(false);
  // The short invite goes by touching phones too, while it shows (lib/nfc-share.ts).
  const nfc = useNfcShare(visible && made?.short ? made.link : null);
  const key = `${currentSpace().space}|${contactLink ?? ''}`;

  // As this phone's QR code, an invite that cannot be made is not said: its contact QR code shows instead.
  useEffect(() => {
    if (visible && inline && failed && onPlain) onPlain();
  }, [visible, inline, failed]);

  // While the page shows: whether a phone took the invite, which this phone learns with its next look at the relay.
  const madeKey = made ? (made.short?.secret ?? made.hi) : '';
  useEffect(() => {
    setWaits(true);
    if (!visible || inline || !made) return;
    let on = true;
    const look = async () => {
      const still = made.short ? await shortInviteWaits(made.short.secret).catch(() => true) : !!e2e?.inviteWaits(made.hi);
      if (on) setWaits(still);
    };
    void look();
    const timer = setInterval(() => void look(), 3000);
    return () => {
      on = false;
      clearInterval(timer);
    };
  }, [visible, inline, madeKey, e2e]);

  // Each time it opens: the invite at once, the one still waiting from a moment ago or a new one.
  useEffect(() => {
    if (!visible) return;
    setFailed('');
    setBack(false);
    setQrShown(false);
    const as = e2e?.invitedAs() ?? '';
    setAs(as);
    const again = lastMade;
    let on = true;
    void (async () => {
      const waits = again && again.key === key && Date.now() - again.made.at < SHOWN_AGAIN_MS
        ? again.made.short
          ? await shortInviteWaits(again.made.short.secret).catch(() => false)
          : !!e2e?.inviteWaits(again.made.hi)
        : false;
      if (!on) return;
      if (again && waits) {
        setName(again.name);
        setMade({ ...again.made, link: linkFor(again.made, as) });
        return;
      }
      setName('');
      setMade(null);
      void make(as, true);
    })();
    return () => {
      on = false;
    };
  }, [visible, e2e, contactLink]);

  function linkFor(invite: Made, as: string): string {
    if (invite.short) return textInviteLink({ ...invite.short.invite, name: as.trim() });
    return contactLink ? welcomeLink(contactLink, { code: invite.code, hi: invite.hi, name: as.trim() }) : invite.link;
  }

  // `again`: the one made here that no one took yet, if there is one, rather than a new one, as the
  // relay keeps only 5 waiting and 10 made a day (#12). Invite someone else makes a new one.
  async function make(as: string, again = false) {
    if (!e2e || !contactLink || making.current) return;
    making.current = true;
    setBusy(true);
    setFailed('');
    try {
      // The short invite first, as an invite by plain SMS is (lib/sms-relay.ts): a QR code any camera
      // reads, and a link that fits an SMS. The long one only where the relay lets this phone make none.
      const kept = again ? await waitingShortInvite().catch(() => null) : null;
      const short = kept ?? (await makeShortInvite('').catch(() => null));
      if (short) {
        const invite: Made = { link: '', hi: '', line: short.line, code: short.invite.code, until: short.invite.expires, access: true, at: Date.now(), short };
        invite.link = linkFor(invite, as);
        lastMade = { key, made: invite, name: '' };
        setMade(invite);
        return;
      }
      // Access of their own to the relay, when it lets this phone invite; good for as long as both last.
      // The relay has a name of random letters for them; who it is for is named here, now or later (lib/e2e.ts lineFor).
      let line = relay?.token ? await e2e.lineFor('') : '';
      let access = relay?.token ? await makeInvite(relay, line) : null;
      // A token typed in, as the relay's one for all, lets no one in: their phone would be a contact
      // the relay refuses. So it is traded for one of this phone's own first, where the relay does
      // so. A token of this phone's own that cannot invite is the relay's choice.
      if (relay?.token && !access && !oldToken(relay.url, relay.token, (await loadCurrentSpaceData()).ownToken)) {
        const own = await onOwnLine(relay);
        if (!own) {
          setFailed(
            t('Your phone cannot let anyone in to your relay yet: it uses a token typed in, not one of its own. On New chat, under For advanced users, sign in to the relay below the Token, or take an invite to it, then make this invite again.'),
          );
          return;
        }
        line = await e2e.lineFor('');
        access = await makeInvite(own, line);
      }
      const hi = await e2e.welcome('', as);
      const until = Math.min(Date.now() + WELCOME_DAYS * 24 * 3600 * 1000, access?.expires ?? Infinity);
      const invite: Made = { link: '', hi, line: access ? line : '', code: access?.code ?? null, until, access: !!access, at: Date.now() };
      invite.link = linkFor(invite, as);
      lastMade = { key, made: invite, name: '' };
      setMade(invite);
    } catch (error) {
      setFailed(t('No invite now. {error}', { error: errorText(error) }));
    } finally {
      making.current = false;
      setBusy(false);
    }
  }

  // Who it is for, as typed: kept here only, for the chat they will be in.
  function keepName() {
    if (!made || !e2e) return;
    const who = name.trim();
    if (lastMade?.made.hi === made.hi) lastMade = { ...lastMade, name: who };
    void e2e.nameInvite(made.hi, who, made.line).catch((error) => onNote(errorText(error)));
    if (made.short) void nameShortInvite(made.short.secret, who).catch((error) => onNote(errorText(error)));
  }

  // The name this phone gives itself goes in the link: the QR code shows it at once.
  function keepAs() {
    if (!made || !e2e) return;
    const link = linkFor(made, as);
    setMade({ ...made, link });
    if (lastMade?.made.hi === made.hi) lastMade = { ...lastMade, made: { ...lastMade.made, link } };
    void e2e.inviteAs(as).catch((error) => onNote(errorText(error)));
  }

  function another() {
    keepName();
    lastMade = null;
    setName('');
    setMade(null);
    setBack(false);
    void make(as);
  }

  // The invite goes with a few words before its link, so whoever gets it knows what it is: the
  // words are the app's, and whoever pastes all of them in Erevos is taken by the link alone (lib/open-link.ts).
  const message = (link: string) => t('Join me on Erevos, where what we write to each other is end-to-end encrypted: {link}', { link });

  async function share(link: string, copy = Platform.OS === 'web') {
    try {
      // A computer has no share sheet: the message is copied, to paste where it should go.
      if (copy) {
        onNote((await copyText(message(link))) ? t('Invite copied.') : t('Not copied.'));
        return;
      }
      await Share.share({ message: message(link) });
    } catch (error) {
      onNote(errorText(error));
    }
  }

  // Sent to the wrong person, or not wanted any more: the link lets no one in from then on.
  async function takeBack() {
    if (!made?.short || busy) return;
    setBusy(true);
    try {
      if (await takeBackShortInvite(made.short)) {
        lastMade = null;
        setMade(null);
        setBack(true);
      } else onNote(t('A phone has taken this invite already: it is not taken back.'));
    } catch (error) {
      onNote(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  if (inline) {
    return made ? (
      <View style={styles.inline}>
        <QrCode text={made.link} size={200} />
        {/* The short invite's link is a web page that offers Erevos first; the long one opens only in Erevos. */}
        <Text variant="caption" tone="muted" style={styles.center}>
          {made.short
            ? t('They scan it with their phone’s camera. With no Erevos yet, it shows them where to get it; then it gets ready by itself, with no relay or codes to type, and you are each other’s contacts.')
            : t('They scan it with their phone’s camera, with Erevos on it already: it gets ready by itself, with no relay or codes to type, and you are each other’s contacts.')}
        </Text>
        {made.short ? (
          <Text variant="caption" tone="muted" style={styles.center}>
            {t('For one person, until {when}. It works when they have Erevos already, too.', { when: laterLabel(made.until) })}
          </Text>
        ) : null}
        {nfc === 'on' ? (
          <Text variant="caption" tone="muted" style={styles.center}>
            {t('Or hold the back of their phone to the back of yours: their phone opens the invite.')}
          </Text>
        ) : null}
        <TextButton title={t('New QR code')} onPress={another} />
      </View>
    ) : (
      <View style={styles.inline}>
        <Text variant="caption" tone="muted" style={styles.center}>
          {failed || t('Making the invite…')}
        </Text>
        {failed && !busy ? <Button title={t('Try again')} compact onPress={() => void make(as)} /> : null}
      </View>
    );
  }

  // How far the invite has come: made, waiting for its phone, and taken.
  const step = (label: string, state: 'done' | 'now' | 'later') => (
    <View style={styles.step} accessible accessibilityLabel={label} accessibilityState={{ selected: state === 'now' }}>
      <View style={[styles.stepDot, { borderColor: state === 'later' ? colors.border : colors.primary, backgroundColor: state === 'done' ? colors.primary : 'transparent' }]} />
      <Text variant={state === 'now' ? 'bodyStrong' : 'body'} tone={state === 'later' ? 'muted' : undefined} style={styles.grow}>
        {label}
      </Text>
    </View>
  );

  return made ? (
    <View style={styles.page}>
      <Text tone="muted">
        {made.short
          ? t('One link, for one person: their phone joins Erevos with it, typing nothing, and you are each other’s contacts at once. With no Erevos yet, it shows them where to get it.')
          : t('One link, for one person: their phone joins Erevos with it, typing nothing, and you are each other’s contacts at once. It opens only on a phone that has Erevos already.')}
      </Text>
      <View style={[styles.bubble, { borderRadius: radius.lg, backgroundColor: colors.primarySoft }]}>
        <Text selectable>{message(made.link)}</Text>
      </View>
      <Row wrap>
        <Button title={Platform.OS === 'web' ? t('Copy the invite') : t('Send with…')} onPress={() => void share(made.link)} />
        {Platform.OS !== 'web' && CAN_COPY ? <Button title={t('Copy')} kind="secondary" onPress={() => void share(made.link, true)} /> : null}
        <Button title={qrShown ? t('Hide the QR code') : t('Its QR code')} kind="secondary" onPress={() => setQrShown(!qrShown)} />
      </Row>
      {qrShown ? (
        <View style={styles.inline}>
          <QrCode text={made.link} size={220} />
        </View>
      ) : null}
      <Text variant="caption" tone="muted">
        {t('For one person, until {when}. Whoever opens it first has it, so send it to them only.', { when: laterLabel(made.until) })}
      </Text>
      {qrShown && nfc === 'on' ? (
        <Text variant="caption" tone="muted">
          {t('Or hold the back of their phone to the back of yours: their phone opens the invite.')}
        </Text>
      ) : qrShown && nfc === 'off' ? (
        <Text variant="caption" tone="muted">
          {t('Turn on NFC in Android\'s settings to give it by touching phones too.')}
        </Text>
      ) : null}
      {made.access ? null : (
        <Text variant="caption" tone="muted">
          {t('Your relay lets this phone invite no one, so their phone uses it only as your contact link lets it: if it needs a token, they need one of their own.')}
        </Text>
      )}
      <View style={[styles.steps, { borderRadius: radius.lg, borderColor: colors.border }]}>
        {step(t('The invite is ready'), 'done')}
        {step(t('Waiting for them to open it'), waits ? 'now' : 'done')}
        {step(t('You are connected'), waits ? 'later' : 'now')}
        <Text variant="caption" tone="muted">
          {waits
            ? t('You may leave this page: once they open it, they show in your chats.')
            : t('They opened the invite: they show in your chats as soon as their phone has joined.')}
        </Text>
      </View>
      <Field label={t('Who is it for?')} hint={t('Their name in your chats. Optional: you can name them once they join, too.')}>
        <Input value={name} onChangeText={setName} onEndEditing={keepName} onSubmitEditing={keepName} placeholder={t('Maria')} maxLength={MAX_NAME} autoCorrect={false} />
      </Field>
      <Field label={t('Your name, for them')} hint={t('Goes in the invite, so their phone names you. Optional.')}>
        <Input value={as} onChangeText={setAs} onEndEditing={keepAs} onSubmitEditing={keepAs} placeholder={t('Your name')} maxLength={MAX_NAME} autoCorrect={false} />
      </Field>
      <Row wrap>
        <TextButton title={t('Invite someone else')} onPress={another} />
        {made.short && waits ? <TextButton title={t('Take this invite back')} onPress={() => void takeBack()} /> : null}
      </Row>
    </View>
  ) : (
    <View style={styles.page}>
      <Text tone="muted">
        {back
          ? t('The invite is taken back: its link lets no one in any more.')
          : t('One link, for one person: their phone joins Erevos with it, typing nothing, and you are each other’s contacts at once. With no Erevos yet, it shows them where to get it.')}
      </Text>
      {busy ? <Text variant="caption" tone="muted">{t('Making the invite…')}</Text> : null}
      {failed ? <Text variant="caption" tone="muted">{failed}</Text> : null}
      <Row wrap>
        {back && !busy ? <Button title={t('New invite')} compact onPress={another} /> : null}
        {failed && !busy ? <Button title={t('Try again')} compact onPress={() => void make(as)} /> : null}
      </Row>
    </View>
  );
}

const styles = StyleSheet.create({
  inline: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: space.sm,
  },
  center: {
    textAlign: 'center',
  },
  page: {
    gap: space.md,
  },
  bubble: {
    padding: space.md,
  },
  steps: {
    gap: space.xs,
    padding: space.md,
    borderWidth: 1,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  grow: {
    flex: 1,
  },
});
