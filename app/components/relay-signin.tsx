// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, View } from 'react-native';

import { WayCard } from './connect-cards';
import { PersonSign } from './shortcut-tile';
import { Button, Field, Input, Row, Text, TextButton } from './ui';
import { plural, t } from '../lib/i18n';
import { claimSignIn, signInOffer } from '../lib/relay';
import { endSignIn, oldToken, onSignInCode, pendingSignIn, signInLink, startSignIn, type SignIn } from '../lib/relay-signin';
import { currentSpace } from '../lock/keys';
import { loadCurrentSpaceData } from '../lock/space-data';
import { hostOf } from '../lib/relay-host';

// Signing in to the relay with a provider such as LPHL (lib/relay-signin.ts,
// crates/erevos-relay/src/signin.rs): on New chat, one of the ways in for a phone with no relay yet,
// and under the token in For advanced users, shown only when the relay typed there offers it. The system browser signs in on the relay's pages, so the
// password is typed there only; the relay's page then shows a code, typed here, and this phone
// claims a token of its own with it, which goes where the relay's token goes (onToken), sealed in
// the space. Only a sign-in in this phone's own browser shows the code this phone needs, so a
// sign-in link someone else sent, signed in with their account, gives this phone nothing.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

export function RelaySignIn({
  url,
  token,
  onToken,
  onNote,
  card = false,
}: {
  url: string;
  token: string;
  onToken: (token: string, name: string) => void;
  onNote: (note: string) => void;
  /** For a phone with no relay yet: a way in of its own (components/connect-cards.tsx), in plain words, that signs in at a tap. */
  card?: boolean;
}) {
  const space = currentSpace().space;
  const [offer, setOffer] = useState<{ name: string; start: string } | null>(null);
  // Whether the relay answered what it offers, or failed to: a card then says it has no sign-in.
  const [asked, setAsked] = useState(false);
  const [waiting, setWaiting] = useState<SignIn | null>(() => pendingSignIn(space, url));
  const [code, setCode] = useState('');
  // Counts the returns from the browser: the field for the code is drawn again each time, and
  // takes the focus, so the code goes straight in.
  const [back, setBack] = useState(0);
  const [busy, setBusy] = useState(false);
  const claiming = useRef(false);

  // Asked a moment after the address stops changing, so typing it asks nothing of each letter.
  useEffect(() => {
    let on = true;
    setOffer(null);
    setAsked(false);
    setWaiting(pendingSignIn(space, url));
    setCode('');
    if (!url) return;
    const timer = setTimeout(() => {
      void signInOffer(url).then((got) => {
        if (!on) return;
        setOffer(got);
        setAsked(true);
      });
    }, 800);
    return () => {
      on = false;
      clearTimeout(timer);
    };
  }, [url, space]);

  function stop() {
    endSignIn(space);
    setWaiting(null);
    setCode('');
  }

  async function finish(given = code) {
    const signIn = pendingSignIn(space, url);
    if (!signIn) {
      stop();
      onNote(t('The sign-in took too long. Sign in again.'));
      return;
    }
    if (claiming.current) return;
    claiming.current = true;
    setBusy(true);
    try {
      // The token is named as this phone's before only when this phone got it from this relay.
      const old = oldToken(url, token, (await loadCurrentSpaceData()).ownToken);
      const got = await claimSignIn(url, signIn.claim, given, old);
      if (!got) {
        onNote(t('Nothing to finish yet: first sign in on the page the browser opened, then type the code it shows.'));
      } else if ('wrong' in got) {
        setCode('');
        if (got.wrong > 0) {
          onNote(plural(got.wrong, 'That is not the code the page shows: {n} try left.', 'That is not the code the page shows: {n} tries left.'));
        } else {
          stop();
          onNote(t('Too many wrong codes, so that sign-in is over. Sign in again.'));
        }
      } else {
        stop();
        onToken(got.token, got.name);
      }
    } catch (error) {
      onNote(t('The sign-in did not work. {error}', { error: errorText(error) }));
    } finally {
      claiming.current = false;
      setBusy(false);
    }
  }

  // The code the relay's page handed back with its button (app/signin.tsx): finished at once, nothing typed.
  const finishNow = useRef(finish);
  finishNow.current = finish;
  useEffect(() => {
    if (!waiting) return;
    return onSignInCode((given) => {
      setCode(given);
      void finishNow.current(given);
    });
  }, [waiting]);

  // Back from the browser, the field for the code takes the focus.
  useEffect(() => {
    if (!waiting) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setBack((n) => n + 1);
    });
    return () => subscription.remove();
  }, [waiting]);

  async function start() {
    if (!offer) return;
    const signIn = startSignIn(space, url);
    setWaiting(signIn);
    setCode('');
    try {
      // On a phone, the relay's page then has a button that brings the code back here.
      await Linking.openURL(signInLink(offer.start, signIn, Platform.OS === 'android'));
    } catch (error) {
      stop();
      onNote(errorText(error));
    }
  }

  if (!offer) {
    return card && asked ? (
      <Text variant="caption" tone="muted">
        {t('{relay} offers no sign-in, or cannot be reached now. Whoever runs it can give you an invite instead.', { relay: hostOf(url) || url })}
      </Text>
    ) : null;
  }

  const finishing = waiting ? (
    <>
      <Text>
        {Platform.OS === 'android'
          ? t('Sign in on the page the browser opened, then tap Open Erevos there. If nothing opens, type here the code it shows.')
          : t('Sign in on the page the browser opened. It then shows a code: type it here.')}
      </Text>
      <Field label={t('Code from the page')}>
        <Input
          key={back}
          autoFocus={back > 0}
          value={code}
          onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
          onSubmitEditing={() => void finish()}
          placeholder="123456"
          keyboardType="number-pad"
          autoComplete="off"
          autoCorrect={false}
        />
      </Field>
      <Row wrap>
        <Button title={t('Finish signing in')} compact loading={busy} disabled={code.length !== 6} onPress={() => void finish()} />
        <TextButton title={t('Cancel')} onPress={stop} />
      </Row>
    </>
  ) : null;

  if (card) {
    // Tapped again while waiting for the code, the browser opens again, for a sign-in anew.
    return (
      <WayCard
        tint="violet"
        sign={<PersonSign />}
        title={t('Sign in with {name}', { name: offer.name })}
        line={t('With your {name} account, in the browser: you type the password there only, and whoever runs the server sees your user name.', { name: offer.name })}
        open={!!waiting}
        onPress={() => void start()}
      >
        {finishing}
      </WayCard>
    );
  }

  return (
    <View style={{ gap: 6 }}>
      {waiting ? (
        finishing
      ) : (
        <Row wrap>
          <Button title={t('Sign in with {name}', { name: offer.name })} kind="secondary" compact onPress={() => void start()} />
        </Row>
      )}
      <Text variant="caption" tone="muted">
        {t(
          "Signs this phone in to the server with your {name} account, in the browser: you type the password there only, and this phone gets a token of its own, kept in this space. The server's operator sees your {name} user name, and every hour the server asks {name} whether the account may still use it, signing this phone out when it may not, or when {name} cannot be asked for 3 days. Signing in from another space with the same account shows the server that both are yours.",
          { name: offer.name },
        )}
      </Text>
    </View>
  );
}
