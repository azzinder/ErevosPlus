// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Field, Input, Page, Text, Toggle } from '../components/ui';
import { canTor } from '../lib/core';
import { CouponWaitError } from '../lib/coupons';
import { t } from '../lib/i18n';
import { dropPair, pairHere, takePair } from '../lib/pair';
import { sameRelay } from '../lib/relay';
import { forgetSpare, homeRelays, readySpare, setSpareRelays, spaceSpare } from '../lib/spare';
import { loadCurrentSpaceData, MORE_SPARES, updateCurrentSpaceData, type SpareRelay } from '../lock/space-data';
import { space } from '../theme/colors';

// The space's home relays (lib/spare.ts): a second relay with a queue of its own, which contacts
// write to while the main relay cannot be reached, and up to MORE_SPARES more, tried in order. On
// Android, with Automatically from your relay on, a space with none takes the one its relay is
// paired with by itself, only through Tor (lib/pair.ts); removing the home relay here turns it off.

// `tor`: reached only through Tor. `got`: what the line's token is, as kept: one from a coupon, or a
// coupon signed and waiting. `auto`: Erevos set it from the relay's pair.
type Line = { url: string; token: string; tor: boolean; got?: 'coupon' | 'pending'; auto?: boolean };

const EMPTY: Line = { url: '', token: '', tor: false };

// A kept home relay as a line: a token from a coupon is not shown, as Erevos keeps it by itself.
function lineOf(one: SpareRelay): Line {
  const got = one.pending ? 'pending' : one.coupon !== undefined ? 'coupon' : undefined;
  return { url: one.url, token: one.coupon !== undefined ? '' : one.token, tor: one.tor === true, ...(got ? { got } : {}), ...(one.auto ? { auto: true } : {}) };
}

export default function HomeRelay() {
  const [lines, setLines] = useState<Line[]>([EMPTY]);
  const [ready, setReady] = useState(false);
  const [note, setNote] = useState('');
  const [mainUrl, setMainUrl] = useState('');
  const [pairOn, setPairOn] = useState(false);

  useEffect(() => {
    loadCurrentSpaceData()
      .then((data) => {
        setMainUrl(data.url);
        setPairOn(data.pairHome);
        const kept = homeRelays(data.spare).map(lineOf);
        setLines(kept.length > 0 ? kept : [EMPTY]);
        setReady(!!data.spare.url && !!data.spare.queue);
      })
      .catch(() => setNote(t('The settings of this space could not open.')));
  }, []);

  // Another address typed is the owner's own, no longer the one from the relay.
  function change(at: number, patch: Partial<Line>) {
    setLines((now) => now.map((line, i) => (i === at ? { ...line, ...patch, ...(patch.url !== undefined && patch.url.trim() !== line.url.trim() ? { auto: false } : {}) } : line)));
  }

  // The home relays as kept now, as lines.
  async function reload() {
    const kept = homeRelays((await loadCurrentSpaceData()).spare).filter((one) => one.url.trim()).map(lineOf);
    setLines(kept.length > 0 ? kept : [EMPTY]);
  }

  // The queues on the home relays made now, or the coupon on its way, said in the note.
  async function makeReady() {
    try {
      await readySpare();
      setReady(true);
      setNote(t('Your queue on the home server is ready. Contacts learn it from your next message, or from your contact link.'));
    } catch (error) {
      if (error instanceof CouponWaitError) {
        setLines((now) => now.map((line) => (line.tor && !line.token.trim() ? { ...line, got: 'pending' } : line)));
        setNote(error.message);
        return;
      }
      setNote(
        t('Saved, but the home server could not be reached: {reason}. It is tried again with each look.', {
          reason: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  }

  // Automatically from your relay: turned on, the relay's pair is taken now when there is no home relay;
  // turned off, the one taken so goes.
  async function switchPair() {
    const on = !pairOn;
    setNote('');
    try {
      await updateCurrentSpaceData({ pairHome: on });
    } catch {
      setNote(t('The settings of this space could not open.'));
      return;
    }
    setPairOn(on);
    if (!on) {
      // Off: the home relay taken from the relay goes, so nothing of it goes through Tor.
      if (await dropPair(spaceSpare()).catch(() => false)) {
        forgetSpare(spaceSpare());
        setReady(false);
        await reload().catch(() => undefined);
      }
      return;
    }
    if (!(await takePair(spaceSpare(), true).catch(() => false))) {
      const data = await loadCurrentSpaceData().catch(() => null);
      if (data && !data.spare.url.trim()) setNote(t('Your server names no home server for this phone, or could not be reached.'));
      return;
    }
    forgetSpare(spaceSpare());
    setReady(false);
    await reload().catch(() => undefined);
    await makeReady();
  }

  async function save() {
    setNote('');
    const given = lines.map((line) => ({ url: line.url.trim(), token: line.token, tor: line.tor })).filter((line) => line.url);
    for (const { url } of given) {
      if (!/^wss?:\/\/[^\s/?#]+(\/[^\s]*)?$/i.test(url)) {
        setNote(t('A server address starts with ws:// or wss://.'));
        return;
      }
      if (sameRelay(url, mainUrl)) {
        setNote(t('That is your server already. A home server is another one.'));
        return;
      }
    }
    if (given.some((line, i) => given.findIndex((other) => sameRelay(other.url, line.url)) !== i)) {
      setNote(t('Each home server is a different one.'));
      return;
    }
    try {
      const had = homeRelays((await loadCurrentSpaceData()).spare).some((one) => one.url.trim());
      await setSpareRelays(given);
      setReady(false);
      await reload();
      if (given.length === 0) {
        // Removed by hand: none is taken from the relay again, unless turned on again.
        if (had && pairOn) {
          await updateCurrentSpaceData({ pairHome: false });
          setPairOn(false);
        }
        setNote(t('No home server. Contacts write only to your server.'));
        return;
      }
    } catch (error) {
      setNote(
        t('Saved, but the home server could not be reached: {reason}. It is tried again with each look.', {
          reason: error instanceof Error ? error.message : String(error),
        }),
      );
      return;
    }
    await makeReady();
  }

  return (
    <Page>
      <Text variant="title">{t('Home server')}</Text>
      <Card>
        <Text tone="muted">
          {t(
            'A second server with a queue of its own, for example one at home on a Raspberry Pi or an old computer. Your contact link and every message say it beside your server, so contacts write there while your server cannot be reached, and what you send goes through it when yours is down. Erevos takes what comes there with each look.',
          )}
        </Text>
        <Text tone="muted">
          {canTor()
            ? t(
                "Whoever runs it sees what your server sees: this phone's address when it takes messages, unless it is set to Only through Tor below, and when and how much comes. Hidden chats do not use it: each hidden place can have its own, set while it is open.",
              )
            : t(
                "Whoever runs it sees what your server sees: this phone's address when it takes messages, and when and how much comes. Hidden chats do not use it: each hidden place can have its own, set while it is open.",
              )}
        </Text>
        {lines.map((line, at) => (
          <View key={at}>
            <Field label={at === 0 ? t('Home server address') : t('Another home server ({n})', { n: at + 1 })}>
              <Input
                value={line.url}
                onChangeText={(url) => change(at, { url })}
                placeholder="wss://relay.at-home.example"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </Field>
            <Field label={t('Token (optional)')}>
              <Input
                value={line.token}
                onChangeText={(token) => change(at, { token })}
                placeholder={line.tor ? t('None: a coupon from your server') : t('Token, if the server needs one')}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </Field>
            {canTor() ? (
              <Pressable
                onPress={() => change(at, { tor: !line.tor })}
                accessibilityRole="switch"
                accessibilityState={{ checked: line.tor }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{t('Only through Tor')}</Text>
                  <Text variant="caption" tone="muted">
                    {t(
                      "This server never sees your phone's address, whatever Tor is set to for the rest. With no token typed, it gives one for a coupon your server signs blind, if it takes them: then neither server can tell whose it is.",
                    )}
                  </Text>
                </View>
                <Toggle on={line.tor} />
              </Pressable>
            ) : null}
            {line.auto ? (
              <Text variant="caption" tone="faint">
                {t('Set by itself from your server.')}
              </Text>
            ) : null}
            {line.tor && !line.token.trim() && line.got === 'coupon' ? (
              <Text variant="caption" tone="faint">
                {t('Its token came with a coupon. Erevos takes a new one by itself before it ends.')}
              </Text>
            ) : null}
            {line.tor && !line.token.trim() && line.got === 'pending' ? (
              <Text variant="caption" tone="faint">
                {t('A coupon is signed. The token comes from the home server within the hour.')}
              </Text>
            ) : null}
          </View>
        ))}
        {lines.length <= MORE_SPARES && lines[lines.length - 1].url.trim() ? (
          <Button title={t('Add another home server')} kind="secondary" compact onPress={() => setLines((now) => [...now, EMPTY])} />
        ) : null}
        <Text variant="caption" tone="muted">
          {t(
            'With more than one, contacts try them in this order, and Erevos takes what comes on each. Each one more makes your contact link a little longer, and its QR code a little denser.',
          )}
        </Text>
        {pairHere() ? (
          <Pressable
            onPress={() => void switchPair()}
            accessibilityRole="switch"
            accessibilityState={{ checked: pairOn }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t('Automatically from your server')}</Text>
              <Text variant="caption" tone="muted">
                {t(
                  'When your server names a server paired with it, a space with no home server takes that one by itself, only through Tor, with its token from a coupon. Removing the home server here turns this off.',
                )}
              </Text>
            </View>
            <Toggle on={pairOn} />
          </Pressable>
        ) : null}
        <Button title={t('Save')} onPress={() => void save()} />
        {ready ? <Text variant="caption" tone="faint">{t('Your queue there is ready.')}</Text> : null}
      </Card>
      {note ? <Text tone="muted">{note}</Text> : null}
    </Page>
  );
}
