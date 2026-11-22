// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { QrCode } from './QrCode';
import { NewSessionGroup } from './session-more';
import { Button, Chip, Input, Page, Row, Text } from './ui';
import { ask } from '../lib/alert';
import { CAN_COPY, copyText } from '../lib/clipboard';
import { plural, t } from '../lib/i18n';
import { SERVICE_NAMES, threadList, type MsgService } from '../lib/messenger';
import { facebookWay, msgMessengerWay, msgSetMessengerWay, openFacebook, openMessengerCase, sessionSignInWay, messengerHere, messengerNow, messengerSignIn, msgCall, msgSearch, msgSignedIn, msgSignOut, msgStartChat, onMessengerChange, msgChatsThroughTor, msgSetTorChoice, msgTorChoice, signalCaptcha, signalSignInWay } from '../lib/messenger-store';
import { AccountTorChoice } from './account-tor';
import { space } from '../theme/colors';
import { useColors } from '../theme/context';
import { editionName } from '../lib/edition';

// A Messenger, Signal or Session account in Erevos+ (app/messenger.tsx, app/signal.tsx,
// app/session.tsx): signing in, its connection, its chats, and signing out. The accounts are the
// phone's, kept by their engines (modules/erevos-messenger), and show in the first space.
//
// - Messenger: its own sign-in page on facebook.com; only its session cookies are kept, never the
//   password. The same sign-in opens Facebook itself (FacebookPage). Messenger is used either by
//   Erevos's own engine (its chats in Erevos's lists) or in its case: Meta's own page, closed in
//   by Erevos (MessengerWayChoice, CaseButton).
// - Signal: a new account with a phone number (Signal's captcha, then the code it sends by SMS or
//   a call, then a name), or this phone linked to the Signal of another one with a QR code.
// - Session: a new account (its 13 recovery words are shown once, to write down), or one brought
//   back with them.

function useMsgState(service: MsgService) {
  const [, setTick] = useState(0);
  useEffect(() => onMessengerChange(() => setTick((n) => n + 1)), []);
  return messengerNow(service);
}

export function MsgAccountScreen({ service }: { service: MsgService }) {
  const router = useRouter();
  const colors = useColors();
  const state = useMsgState(service);
  const [note, setNote] = useState('');
  const fail = (e: unknown) => setNote(e instanceof Error ? e.message : String(e));
  const name = SERVICE_NAMES[service];

  if (!messengerHere()) {
    return (
      <Page>
        <Text variant="title">{name}</Text>
        <Text tone="muted">{t('{service} is part of Erevos+ for Android.', { service: name })}</Text>
      </Page>
    );
  }

  const signedIn = state.signedIn && !state.signInAgain;
  const inCase = service === 'messenger' && msgMessengerWay() === 'case';
  const chats = threadList(state);
  return (
    <Page>
      <Text variant="title">{name}</Text>
      <Text tone="muted">{aboutAccount(service)}</Text>
      {signedIn ? (
        <>
          <Text variant="label">{state.connected || service !== 'messenger' || inCase ? t('Signed in on this phone.') : t('Signed in; connecting…')}</Text>
          {state.status ? (
            <Text variant="caption" tone="muted">
              {state.status}
            </Text>
          ) : null}
          {service === 'session' ? <SessionId /> : null}
          {inCase ? <CaseButton onError={fail} /> : null}
          {service === 'messenger' ? <MessengerWayChoice onError={fail} /> : null}
          {service === 'messenger' ? <FacebookPage chats={state.threads} onError={fail} /> : null}
          <ServiceTor service={service} onError={fail} />
          {inCase ? null : (
            <>
              <Text variant="caption" tone="muted">
                {plural(chats.length, '{n} chat', '{n} chats')}
              </Text>
              <View style={{ gap: space.sm }}>
                {chats.slice(0, 50).map((chat) => (
                  <Button key={chat.key} title={chat.name || chat.key} kind="ghost" onPress={() => router.push({ pathname: `/${service}-chat`, params: { key: chat.key } })} />
                ))}
              </View>
              <NewChat service={service} onOpen={(key) => router.push({ pathname: `/${service}-chat`, params: { key } })} />
            </>
          )}
          {service === 'session' ? <NewSessionGroup onOpen={(key) => router.push({ pathname: '/session-chat', params: { key } })} /> : null}
          <Button
            title={t('Sign out of {service} on this phone', { service: name })}
            kind="danger"
            onPress={() =>
              ask(t('Sign out of {service}?', { service: name }), service === 'session' ? t('Without your 13 recovery words this account cannot come back.') : t('Its chats leave Erevos. You can sign in again.'), [
                { text: t('Cancel'), style: 'cancel' },
                { text: t('Sign out'), style: 'destructive', onPress: () => void msgSignOut(service).catch(fail) },
              ])
            }
          />
        </>
      ) : service === 'messenger' ? (
        <>
          {state.signInAgain ? <Text color={colors.danger}>{t('Messenger asks you to sign in again.')}</Text> : null}
          <MessengerWayChoice onError={fail} />
          <ServiceTor service="messenger" onError={fail} />
          <Text variant="caption" tone="muted">
            {t('Meta may ask to confirm, or lock for a while, an account that signs in through Tor.')}
          </Text>
          <Button title={t('Sign in to Messenger')} onPress={() => void messengerSignIn().catch(fail)} />
        </>
      ) : service === 'signal' ? (
        <SignalSignIn onError={fail} />
      ) : (
        <SessionSignIn onError={fail} />
      )}
      {note ? <Text color={colors.danger}>{note}</Text> : null}
    </Page>
  );
}

/**
 * How Messenger is used here: by Erevos's own engine (the default), or in its case, Meta's own
 * page closed in by Erevos (lib/messenger-store.ts msgSetMessengerWay).
 */
function MessengerWayChoice({ onError }: { onError: (e: unknown) => void }) {
  useMsgState('messenger');
  const way = msgMessengerWay();
  const [busy, setBusy] = useState(false);
  const choose = (next: 'engine' | 'case') => {
    if (busy || next === way) return;
    setBusy(true);
    void msgSetMessengerWay(next)
      .catch(onError)
      .finally(() => setBusy(false));
  };
  return (
    <View style={{ gap: space.xs }}>
      <Text variant="caption" tone="muted">
        {t('How Messenger is used here')}
      </Text>
      <Row wrap>
        <Chip label={t('By Erevos')} selected={way === 'engine'} disabled={busy} onPress={() => choose('engine')} />
        <Chip label={t('In its case')} selected={way === 'case'} disabled={busy} onPress={() => choose('case')} />
      </Row>
      <Text variant="caption" tone="muted">
        {way === 'case'
          ? t('Messenger’s own page, as on a computer, closed in by Erevos: only Meta’s sites load in it, and links out open in your browser without Facebook’s tracking marks. Calls work in it. Erevos still tells you of new messages: a chat with some not read shows on home, and opens in the case.')
          : t('Erevos speaks Messenger itself: your chats are in Erevos’s lists, with its notifications, locks and Collection.')}
      </Text>
    </View>
  );
}

/** Opens Messenger in its case. */
function CaseButton({ onError }: { onError: (e: unknown) => void }) {
  return (
    <>
      <Button title={t('Open Messenger')} onPress={() => void openMessengerCase().catch(onError)} />
      <Text variant="caption" tone="muted">
        {t('Through Tor, if Messenger goes through Tor: then calls do not work, and links out do not open.')}
      </Text>
    </>
  );
}

/**
 * Facebook itself, with the Messenger sign-in (modules/erevos-messenger FacebookActivity). A
 * Messenger link followed there comes back to that chat here. A sign-in from before, made on
 * messenger.com, cannot open it: then a line says to sign in again.
 */
function FacebookPage({ chats, onError }: { chats: Record<string, unknown>; onError: (e: unknown) => void }) {
  const router = useRouter();
  const [way, setWay] = useState<'facebook' | 'messenger' | 'none'>('none');
  useEffect(() => {
    let live = true;
    void facebookWay().then((w) => live && setWay(w), () => undefined);
    return () => {
      live = false;
    };
  }, []);
  if (way === 'none') return null;
  if (way === 'messenger') {
    return (
      <Text variant="caption" tone="muted">
        {t('To open Facebook here too, sign out of Messenger and sign in again: Messenger now signs in on facebook.com.')}
      </Text>
    );
  }
  return (
    <>
      <Button
        title={t('Open Facebook')}
        kind="secondary"
        onPress={() =>
          void openFacebook().then((key) => {
            // A chat not on the list yet opens too: its messages are asked for as it opens.
            if (key) router.push({ pathname: '/messenger-chat', params: { key } });
          }, onError)
        }
      />
      <Text variant="caption" tone="muted">
        {t('Facebook’s own page, with this sign-in. Messenger links there come back here; other links open in your browser, without Facebook’s tracking marks, and never through Tor: the site sees your internet address.')}
      </Text>
    </>
  );
}

function aboutAccount(service: MsgService): string {
  if (service === 'messenger') return t('Your Facebook Messenger chats, spoken by Erevos itself with Meta\'s servers, with no server in between. Meta can read those that are not end-to-end encrypted. Not made by Meta.');
  if (service === 'signal') return t('Your Signal chats: a new account with your phone number, or this phone linked to the Signal of another one. Not made by Signal.');
  return t('Your Session chats: no phone number, only an account of 13 recovery words, through the onion routing of Session\'s nodes. Not made by Session.');
}

/** A chat with someone new: by name or number (Messenger, Signal) or by Session ID or ONS name. */
function NewChat({ service, onOpen }: { service: MsgService; onOpen: (key: string) => void }) {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [opening, setOpening] = useState('');
  async function search() {
    setBusy(true);
    setNote('');
    try {
      if (service === 'session') {
        onOpen(await startChat(service, query.trim()));
        return;
      }
      const people = await msgSearch(service, query.trim());
      setFound(people);
      if (!people.length) setNote(t('No one found.'));
    } catch (e) {
      setNote(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: space.sm }}>
      <Text variant="label">{t('New chat')}</Text>
      <Row>
        <Input
          style={{ flex: 1 }}
          value={query}
          onChangeText={setQuery}
          placeholder={service === 'session' ? t('Session ID or ONS name') : service === 'signal' ? t('Phone number or name') : t('Name')}
          autoCapitalize="none"
          onSubmitEditing={() => void search()}
        />
        <Button title={service === 'session' ? t('Open') : t('Search')} compact disabled={!query.trim() || busy} loading={busy} onPress={() => void search()} />
      </Row>
      {found.map((p) => (
        <Button
          key={p.id}
          title={p.name || p.id}
          kind="secondary"
          loading={opening === p.id}
          disabled={!!opening}
          onPress={() => {
            setOpening(p.id);
            setNote('');
            void startChat(service, p.id, p.name)
              .then(onOpen, (e: unknown) => setNote(e instanceof Error ? e.message : String(e)))
              .finally(() => setOpening(''));
          }}
        />
      ))}
      {note ? (
        <Text variant="caption" tone="muted">
          {note}
        </Text>
      ) : null}
    </View>
  );
}

async function startChat(service: MsgService, person: string, name?: string): Promise<string> {
  const key = await msgStartChat(service, person, name);
  if (!key) throw new Error(t('That chat could not start.'));
  return key;
}

function SessionId() {
  const [id, setId] = useState('');
  useEffect(() => {
    void msgCall<string>('session', 'sessionId').then((v) => setId(String(v ?? '')), () => undefined);
  }, []);
  if (!id) return null;
  return (
    <View style={{ gap: space.sm, alignItems: 'center' }}>
      <Text variant="caption" tone="muted">
        {t('Your Session ID: others start a chat with you by it.')}
      </Text>
      <QrCode text={id} size={200} />
      <Text selectable variant="caption" style={{ fontFamily: 'monospace' }}>
        {id}
      </Text>
      {CAN_COPY ? <Button title={t('Copy')} kind="secondary" compact onPress={() => void copyText(id)} /> : null}
    </View>
  );
}

type SignalStep = 'choose' | 'number' | 'code' | 'name' | 'link';

/**
 * Signal's or Messenger's Tor (lib/account-tor.ts), before signing in too: with it, registering,
 * its captcha, linking and Messenger's sign-in page go through Tor as well, never straight. Calls
 * never go through Tor.
 */
function ServiceTor({ service, onError }: { service: MsgService; onError: (e: unknown) => void }) {
  useMsgState(service);
  return <AccountTorChoice network={SERVICE_NAMES[service]} way={msgTorChoice(service)} chatsThroughTor={msgChatsThroughTor(service)} onChange={(way) => void msgSetTorChoice(service, way).catch(onError)} />;
}

function SignalSignIn({ onError }: { onError: (e: unknown) => void }) {
  const state = useMsgState('signal');
  const [step, setStep] = useState<SignalStep>('choose');
  const [phone, setPhone] = useState('');
  const [voice, setVoice] = useState(false);
  const [code, setCode] = useState('');
  const [given, setGiven] = useState('');
  const [family, setFamily] = useState('');
  const [busy, setBusy] = useState(false);
  const linked = state.signedIn;
  useEffect(() => {
    if (step === 'link' && linked) void msgSignedIn('signal').catch(onError);
  }, [step, linked]);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    try {
      await work();
    } catch (e) {
      onError(e);
    } finally {
      setBusy(false);
    }
  }

  if (step === 'choose') {
    return (
      <View style={{ gap: space.md }}>
        <ServiceTor service="signal" onError={onError} />
        <Button title={t('New Signal account with my phone number')} onPress={() => setStep('number')} />
        <Button
          title={t('Link to Signal on another phone')}
          kind="secondary"
          onPress={() =>
            void run(async () => {
              await msgCall('signal', 'open');
              setStep('link');
              await signalSignInWay();
              await msgCall('signal', 'link', { name: editionName() });
            })
          }
        />
      </View>
    );
  }
  if (step === 'link') {
    return (
      <View style={{ gap: space.md, alignItems: 'center' }}>
        <Text tone="muted">{t('On the other phone, in Signal: Settings → Linked devices → Link a new device, and scan this code.')}</Text>
        {state.linkUrl ? <QrCode text={state.linkUrl} size={260} /> : <Text tone="faint">{t('Waiting for Signal…')}</Text>}
        {state.linkError ? <Text tone="muted">{t('Linking failed: {error}', { error: state.linkError })}</Text> : null}
        <Button title={t('Back')} kind="ghost" onPress={() => setStep('choose')} />
      </View>
    );
  }
  if (step === 'number') {
    return (
      <View style={{ gap: space.md }}>
        <Text tone="muted">{t('Your phone number with its country code, as +30 69…. Signal first asks you to solve a captcha on its own page.')}</Text>
        <Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+30…" />
        <Button title={voice ? t('The code comes by a call') : t('The code comes by SMS')} kind="ghost" onPress={() => setVoice(!voice)} />
        <Button
          title={t('Continue')}
          disabled={!/^\+\d{6,15}$/.test(phone.replace(/\s/g, '')) || busy}
          loading={busy}
          onPress={() =>
            void run(async () => {
              await msgCall('signal', 'open');
              const captcha = await signalCaptcha();
              if (!captcha) return;
              await signalSignInWay();
              await msgCall('signal', 'register', { phone: phone.replace(/\s/g, ''), voice, captcha });
              setStep('code');
            })
          }
        />
      </View>
    );
  }
  if (step === 'code') {
    return (
      <View style={{ gap: space.md }}>
        <Text tone="muted">{t('The code Signal sent to {phone}.', { phone })}</Text>
        <Input value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="123456" />
        <Button title={t('Continue')} disabled={code.trim().length < 6 || busy} loading={busy} onPress={() => void run(async () => {
          await signalSignInWay();
          await msgCall('signal', 'confirm', { code: code.replace(/\D/g, '') });
          setStep('name');
        })} />
      </View>
    );
  }
  return (
    <View style={{ gap: space.md }}>
      <Text tone="muted">{t('The name others see on Signal.')}</Text>
      <Input value={given} onChangeText={setGiven} placeholder={t('First name')} />
      <Input value={family} onChangeText={setFamily} placeholder={t('Last name (optional)')} />
      <Button title={t('Done')} disabled={!given.trim() || busy} loading={busy} onPress={() => void run(async () => {
        await msgCall('signal', 'setProfile', { given: given.trim(), family: family.trim() });
        await msgSignedIn('signal');
      })} />
    </View>
  );
}

function SessionSignIn({ onError }: { onError: (e: unknown) => void }) {
  const [mode, setMode] = useState<'choose' | 'new' | 'back' | 'words'>('choose');
  const [name, setName] = useState('');
  const [words, setWords] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    try {
      // Its Tor first: making or bringing back the account goes the way chosen, never straight unasked.
      await sessionSignInWay();
      await msgCall('session', 'open');
      await work();
    } catch (e) {
      onError(e);
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'choose') {
    return (
      <View style={{ gap: space.md }}>
        <ServiceTor service="session" onError={onError} />
        <Button title={t('New Session account')} onPress={() => setMode('new')} />
        <Button title={t('Bring back an account with its 13 words')} kind="secondary" onPress={() => setMode('back')} />
      </View>
    );
  }
  if (mode === 'words') {
    return (
      <View style={{ gap: space.md }}>
        <Text variant="label">{t('Your 13 recovery words')}</Text>
        <Text tone="muted">{t('Write them down and keep them safe: they are the only way to bring this account back. Anyone with them can read your chats.')}</Text>
        <Text selectable style={{ fontFamily: 'monospace' }}>
          {words}
        </Text>
        <Button title={t('I wrote them down')} onPress={() => void msgSignedIn('session').catch(onError)} />
      </View>
    );
  }
  return (
    <View style={{ gap: space.md }}>
      <Input value={name} onChangeText={setName} placeholder={t('Your name on Session')} />
      {mode === 'back' ? <Input value={words} onChangeText={setWords} placeholder={t('The 13 words, with spaces')} autoCapitalize="none" multiline /> : null}
      <Button
        title={mode === 'new' ? t('Make the account') : t('Bring it back')}
        disabled={busy || (mode === 'back' && words.trim().split(/\s+/).length !== 13)}
        loading={busy}
        onPress={() =>
          void run(async () => {
            if (mode === 'new') {
              const made = await msgCall<{ words?: string }>('session', 'create', { name: name.trim() });
              setWords(String(made?.words ?? ''));
              setMode('words');
            } else {
              await msgCall('session', 'restore', { words: words.trim().toLowerCase(), name: name.trim() });
              await msgSignedIn('session');
            }
          })
        }
      />
    </View>
  );
}
