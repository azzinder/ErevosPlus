// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';

import { QrCode } from './QrCode';
import { Button, Card, Text, TextButton } from './ui';
import type { HistoryChoice, Links } from '../lib/devices';
import { t } from '../lib/i18n';
import { cleanDeviceName } from '../lib/link-code';
import { canQuickLink, QuickChannel, quickSecret } from '../lib/link-nostr';
import { QUICK_LASTS, quickLink, type QuickCode, type QuickGrant, type QuickMessage } from '../lib/link-quick';
import { placeChanged } from '../lib/receiver';
import { createQueue, makeInvite, redeemInvite, toHex } from '../lib/relay';
import { oldToken, ownToken } from '../lib/relay-signin';
import { loadCurrentSpaceData, updateCurrentSpaceData } from '../lock/space-data';

// Linking a computer with the short code (lib/link-quick.ts, lib/link-nostr.ts), the space's only,
// never hidden chats'. On the computer (QuickToPhone): the code at once, nothing typed; the phone
// gives it its relay, with an invite for a token of its own, and it shows the phone its full code
// and takes the code to compare from it, so they match by themselves. On the phone
// (QuickFromComputer): Link, once. Should Nostr not be reached, or the phone not let the computer
// in to its relay, the computer goes back to the way before: the relay, with LPHL's sign-in.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

// How long the phone waits for the computer's answer.
const ANSWER_WAIT = 2 * 60_000;

/**
 * On the computer: the short code for the phone, then the link done by itself. `answer` is the code
 * the phone's first message gave (Links.answerCode), `confirm` takes it; `fallback` goes back to the
 * way before, with why, and the phone's relay when one came.
 */
export function QuickToPhone({
  links,
  name,
  answer,
  confirm,
  fallback,
  onNote,
}: {
  links: Links;
  name: string;
  answer: string | null;
  confirm: (code: string) => Promise<void>;
  fallback: (why: string, relay?: string) => void;
  onNote: (note: string) => void;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [made, setMade] = useState(0);
  const [stage, setStage] = useState<'waiting' | 'access' | 'linking'>('waiting');
  const [compare, setCompare] = useState<string | null>(null);
  const channel = useRef<QuickChannel | null>(null);
  const taken = useRef(false);
  const confirming = useRef(false);

  useEffect(() => {
    if (!canQuickLink()) {
      fallback(t('This build of Erevos has no Nostr.'));
      return;
    }
    let active = true;
    const secret = quickSecret();
    taken.current = false;
    setStage('waiting');
    setCompare(null);
    QuickChannel.open(secret, (message) => void take(message))
      .then((opened) => {
        if (!active) return opened.close();
        channel.current = opened;
        setCode(quickLink({ nostr: opened.key, secret, name: cleanDeviceName(name) || t('Computer') }));
        opened.whenDown((why) => active && !taken.current && fallback(why));
      })
      .catch((error) => active && fallback(errorText(error)));
    // A code is good for half an hour; then a new one.
    const timer = setTimeout(() => active && !taken.current && setMade((n) => n + 1), QUICK_LASTS);
    return () => {
      active = false;
      clearTimeout(timer);
      channel.current?.close();
      channel.current = null;
    };
  }, [made]);

  // The code to compare came from the phone, and the phone's first message gave the same: taken.
  useEffect(() => {
    if (!compare || !answer || confirming.current) return;
    if (answer !== compare) {
      onNote(t('The phone that answered is not the one that read the code. Make a new code, and link again.'));
      return;
    }
    confirming.current = true;
    void confirm(answer)
      .catch((error) => onNote(errorText(error)))
      .finally(() => {
        confirming.current = false;
        channel.current?.close();
      });
  }, [compare, answer]);

  async function take(message: QuickMessage) {
    if (message.t === 'linked') {
      setCompare(message.code);
      return;
    }
    if (message.t !== 'grant' || taken.current) return;
    taken.current = true;
    setStage('access');
    try {
      // Its queue as the space has it now: one made meanwhile, on this screen or another, stays.
      if (!(await loadCurrentSpaceData()).ownQueue) await queueFrom(message);
      const full = await links.makeOffer(name);
      await channel.current?.send(message.to, { t: 'offer', link: full });
      setStage('linking');
    } catch (error) {
      channel.current?.close();
      fallback(t('The phone answered, but this computer could not use its server: {error}', { error: errorText(error) }), message.relay);
    }
  }

  if (stage !== 'waiting') {
    return (
      <>
        <Text>{stage === 'access' ? t('The phone answered. Setting up this computer…') : t('Linking with the phone…')}</Text>
        <Text variant="caption" tone="faint">
          {t('Keep both open for a moment. Nothing has to be typed or compared.')}
        </Text>
      </>
    );
  }
  return (
    <>
      <Text tone="muted">{t('Scan this with the phone that holds the account, then tap Link on the phone. Nothing else.')}</Text>
      {code ? <QrCode text={code} size={220} /> : <Text tone="faint">{t('Making the code…')}</Text>}
      <Text variant="caption" tone="faint">
        {t('The phone sends this computer what it needs through Nostr, end-to-end encrypted. The code works for half an hour.')}
      </Text>
    </>
  );
}

// On the computer: a queue of its own on the phone's relay, with the token the invite makes, or the
// relay's token for all the phone gave, or none.
async function queueFrom(grant: QuickGrant): Promise<void> {
  const url = grant.relay;
  const token = grant.code ? (await redeemInvite(url, grant.code)).token : (grant.tk ?? '');
  const ids = await createQueue({ url, token: token || undefined });
  await updateCurrentSpaceData({
    url,
    token,
    ...(grant.code ? { ownToken: ownToken(url, token) } : {}),
    ownQueue: { recipientHex: toHex(ids.recipientId), senderHex: toHex(ids.senderId) },
  });
  // Read from at once: the phone answers on it, and the code to compare comes with that answer.
  placeChanged();
}

/**
 * On the phone: a computer's short code read. Link gives it the relay, waits for its full code, and
 * links it as Link does with the full code read; then tells it the code to compare.
 */
export function QuickFromComputer({
  links,
  code,
  history,
  choosing,
  done,
  onNote,
}: {
  links: Links;
  code: QuickCode;
  history: () => HistoryChoice;
  choosing: React.ReactNode;
  done: () => void;
  onNote: (note: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const channel = useRef<QuickChannel | null>(null);
  const name = code.name || t('Computer');

  useEffect(() => () => channel.current?.close(), []);

  async function link() {
    setBusy(true);
    onNote('');
    try {
      const data = await loadCurrentSpaceData();
      const url = data.url.trim();
      if (!url) throw new Error(t('Type the server address in Server first: linked devices reach this phone through it.'));
      const token = data.token.trim();
      // An invite for a token of the computer's own, where this phone may invite; else the relay's
      // token for all, typed in here, but never one of this phone's own.
      const invite = token ? await makeInvite({ url, token }, cleanDeviceName(name)).catch(() => null) : null;
      const shared = !invite && token && !oldToken(url, token, data.ownToken) ? token : '';
      let finish: (error?: Error) => void = () => undefined;
      const finished = new Promise<void>((resolve, reject) => {
        finish = (error) => (error ? reject(error) : resolve());
      });
      const opened = await QuickChannel.open(code.secret, (message) => {
        if (message.t !== 'offer') return;
        void (async () => {
          try {
            const asked = await links.prepare(message.link);
            await links.link(history(), t('Phone'));
            await opened.send(code.nostr, { t: 'linked', code: asked.code });
            finish();
          } catch (error) {
            finish(error instanceof Error ? error : new Error(String(error)));
          }
        })();
      });
      channel.current = opened;
      await opened.send(code.nostr, { t: 'grant', relay: url, to: opened.key, ...(invite ? { code: invite.code } : shared ? { tk: shared } : {}) });
      setWaiting(true);
      const timer = setTimeout(() => finish(new Error(t('The computer did not answer. On it, tap Link another way and sign in to the server there, then scan its code again.'))), ANSWER_WAIT);
      try {
        await finished;
      } finally {
        clearTimeout(timer);
      }
      onNote(t('Linked to {name}. The chats go to it now.', { name }));
      done();
    } catch (error) {
      onNote(errorText(error));
    } finally {
      channel.current?.close();
      channel.current = null;
      setWaiting(false);
      setBusy(false);
    }
  }

  return (
    <Card>
      <Text variant="heading">{t('Link {name} to this phone?', { name })}</Text>
      <Text tone="muted">{t('Link only a computer of yours, whose code you scanned just now. It gets the chats of this space and the messages chosen below.')}</Text>
      {choosing}
      {waiting ? <Text tone="faint">{t('Waiting for the computer…')}</Text> : null}
      <Button title={t('Link')} disabled={busy} loading={busy} onPress={() => void link()} />
      <TextButton title={t('Cancel')} onPress={done} />
    </Card>
  );
}
