// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { askInvisible } from '../components/mode-picker';
import { Button, Card, Chip, Input, Page, Row, SectionTitle, Text } from '../components/ui';
import { confirm } from '../lib/alert';
import { BRIDGE_CHOICES, NO_BRIDGES, readBridgeLines, type BridgeChoice, type Bridges, type TorRoute } from '../lib/bridges';
import { canTor } from '../lib/core';
import { setDirect } from '../lib/direct';
import { mark, plural, t } from '../lib/i18n';
import { modeOf, modeSaid } from '../lib/modes';
import type { TorWay } from '../lib/relay';
import { applyTor, autoState, NoBridgesError, onAutoState, retryAuto, torStatus, type AutoState, type TorStatus } from '../lib/tor';
import { loadCurrentSpaceData, updateCurrentSpaceData } from '../lock/space-data';

// What of the space goes through Tor (lib/tor.ts): nothing unless changed, its messages, or
// everything, asked first when Tor goes on, as it makes messages slower; how far Tor is, and the
// bridges it goes through where it is blocked (lib/bridges.ts), none unless chosen.

const LOOK_EVERY = 2000;

const WAYS: TorWay[] = ['off', 'messages', 'all'];
const WAY_LABELS: Record<TorWay, string> = {
  messages: mark('Messages'),
  all: mark('Everything'),
  off: mark('Nothing'),
};

const BRIDGE_LABELS: Record<BridgeChoice, string> = {
  none: mark('No bridges'),
  auto: mark('Automatic'),
  obfs4: 'obfs4',
  snowflake: 'Snowflake',
  own: mark('My own'),
};

export default function TorScreen() {
  const [way, setWay] = useState<TorWay | null>(null);
  const [status, setStatus] = useState<TorStatus | null>(null);
  const [note, setNote] = useState('');
  const [bridges, setBridges] = useState<Bridges>(NO_BRIDGES);
  // The choice shown: one's own lines are used only once saved.
  const [picked, setPicked] = useState<BridgeChoice>('none');
  const [draft, setDraft] = useState('');
  const [autoNow, setAutoNow] = useState<AutoState>(autoState);
  useEffect(() => onAutoState(() => setAutoNow(autoState())), []);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadCurrentSpaceData()
      .then((data) => {
        setWay(data.tor);
        setBridges(data.bridges);
        setPicked(data.bridges.use);
        setDraft(data.bridges.own);
      })
      .catch(() => setNote(t('The settings of this space could not open.')));
  }, []);

  const on = way !== null && way !== 'off';
  useEffect(() => {
    if (!on) {
      setStatus(null);
      return;
    }
    let stopped = false;
    const look = () =>
      torStatus()
        .then((next) => !stopped && setStatus(next))
        .catch(() => undefined);
    look();
    const timer = setInterval(look, LOOK_EVERY);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [on]);

  if (!canTor()) {
    return (
      <Page>
        <Text variant="title">Tor</Text>
        <Text tone="muted">{t('This build of Erevos has no Tor yet. It comes with the next build of the app.')}</Text>
      </Page>
    );
  }

  function shown(error: unknown): string {
    if (error instanceof NoBridgesError) {
      return way === 'messages'
        ? t('None of these is a bridge Erevos can use, so Tor stays off and messages go straight.')
        : t('None of these is a bridge Erevos can use, so Tor stays off and messages wait.');
    }
    return error instanceof Error ? error.message : String(error);
  }

  async function choose(next: TorWay) {
    if (next === way) return;
    setNote('');
    // Everything through Tor is INVISIBLE (lib/modes.ts), with no calls: asked first, as at the top
    // of Settings. Tor going on for messages: slower, so asked first too.
    if (next === 'all') {
      if (!(await askInvisible())) return;
    } else if (way === 'off') {
      const ok = await confirm(t('Turn Tor on?'), t('Messages then come and go slower, and the first start of Tor takes a while. Until Tor is ready, messages go straight, as now.'), t('Turn on'));
      if (!ok) return;
    }
    try {
      // Tor on: Direct connections goes off with it (SPEED becomes ANONYMOUS, or INVISIBLE), and
      // stays off until the owner chooses SPEED again, so that turning Tor off later connects nothing
      // directly unasked (lib/direct.ts).
      const data = await loadCurrentSpaceData();
      const direct = next !== 'off' && data.direct;
      await updateCurrentSpaceData(direct ? { tor: next, direct: false } : { tor: next });
      if (direct) setDirect(false);
      setWay(next);
      // The Nostr connections open again the new way as it changes (lib/nostr.ts).
      await applyTor(next, bridges);
      const was = modeOf(data);
      const now = modeOf({ ...data, tor: next, direct: data.direct && !direct });
      if (now !== was) setNote(modeSaid(now));
    } catch (error) {
      setNote(shown(error));
    }
  }

  async function useBridges(next: Bridges) {
    setNote('');
    try {
      // What Automatic learned meanwhile is kept.
      next = { ...next, learned: { ...(await loadCurrentSpaceData()).bridges.learned, ...next.learned } };
      await updateCurrentSpaceData({ bridges: next });
      setBridges(next);
      if (way && way !== 'off') await applyTor(way, next);
      setNote(t('Saved.'));
    } catch (error) {
      setNote(shown(error));
    }
  }

  function pick(choice: BridgeChoice) {
    setPicked(choice);
    if (choice !== 'own') void useBridges({ ...bridges, use: choice });
  }

  const own = readBridgeLines(draft);

  // How Tor reaches its network now, in words, never with this phone's address: for Check my connection.
  const routeName = (route: TorRoute) => (route === 'none' ? t('straight') : route === 'own' ? t('your own bridges') : BRIDGE_LABELS[route]);
  async function checkConnection() {
    setNote('');
    if (!on) {
      setNote(t('Tor is off for this space: messages go straight to the server.'));
      return;
    }
    setChecking(true);
    try {
      if (bridges.use === 'auto') await retryAuto();
      const now = await torStatus();
      setStatus(now);
      const using = autoState().using;
      setNote(
        now?.ready
          ? using
            ? t('Tor is connected, {how}.', { how: routeName(using) })
            : t('Tor is connected.')
          : t('Tor cannot connect from this network. Try Automatic, or bridges of your own.'),
      );
    } catch (error) {
      setNote(shown(error));
    } finally {
      setChecking(false);
    }
  }

  return (
    <Page>
      <Text variant="title">Tor</Text>
      <Card>
        <Text variant="bodyStrong">{t('What goes through Tor')}</Text>
        <Text tone="muted">
          {t(
            "Through Tor, this space reaches its servers through the Tor network. The server then does not see this phone's internet address, and the phone company or the Wi-Fi sees only that Tor is used, not which server. Messages come and go slower, and the first start of Tor takes a while.",
          )}
        </Text>
        <Row wrap>
          {WAYS.map((choice) => (
            <Chip key={choice} label={t(WAY_LABELS[choice])} selected={way === choice} onPress={() => void choose(choice)} />
          ))}
        </Row>
        {way ? (
          <Text tone="muted">
            {way === 'messages'
              ? t(
                  "What you write goes through Tor, and what tells your contacts something, as that a message was read. Pictures, files and voice messages go straight, which is faster: for them the server sees this phone's internet address. While Tor starts, or cannot connect, messages go straight too, so they never wait for it.",
                )
              : way === 'all'
                ? t('Everything goes through Tor, files too, and nothing goes to a server without it: when Tor cannot reach the server, the message waits.')
                : t("Nothing goes through Tor, the way a new space starts: messages go fastest, and the server and the Nostr servers see this phone's internet address.")}
          </Text>
        ) : null}
        <Text tone="muted">
          {way === 'all'
            ? t(
                'With everything through Tor this space is INVISIBLE, and there are no calls, as calls do not go through Tor. Nearby phones and SMS do not use the internet, so Tor has nothing to do with them.',
              )
            : t(
                'Calls do not go through Tor: their sound and picture go straight between the phones, or through the call server. Nearby phones and SMS do not use the internet, so Tor has nothing to do with them.',
              )}
        </Text>
      </Card>
      {on && status ? (
        <Card>
          <Text variant="bodyStrong">{status.ready ? t('Tor is ready') : t('Tor is starting')}</Text>
          <Text variant="caption" tone="faint">
            {status.text}
          </Text>
        </Card>
      ) : null}

      <SectionTitle title={t('Bridges')} />
      <Row wrap>
        {BRIDGE_CHOICES.map((choice) => (
          <Chip key={choice} label={t(BRIDGE_LABELS[choice])} selected={picked === choice} onPress={() => pick(choice)} />
        ))}
      </Row>
      <Card>
        <Text variant="caption" tone="muted">
          {picked === 'none'
            ? t('Tor goes straight to its relays. Where Tor is blocked, choose bridges: Tor then reaches its network only through them.')
            : picked === 'auto'
              ? t('Erevos tries the ways in turn until Tor connects: straight, then the obfs4 bridges, then Snowflake, then your own bridges, if you have any. It remembers the one that worked on Wi-Fi and on mobile data for 30 days, and tries it first.')
            : picked === 'obfs4'
              ? t('The obfs4 bridges Tor Browser comes with: to whoever watches the network, Tor looks like random bytes. Where a censor blocks these too, choose Snowflake or bridges of your own.')
              : picked === 'snowflake'
                ? t("Snowflake goes through volunteers' browsers, over WebRTC, the way a video call does. To find one, Erevos asks Snowflake's broker through a CDN, behind another site's name, and STUN servers tell the phone its own address: they see that address, never your messages. Slower, and hard to block.")
                : t('Bridge lines from bridges.torproject.org, from bridges@torproject.org by email, or from @GetBridgesBot on Telegram, one per line. obfs4, Snowflake, WebTunnel, meek and plain bridges work.')}
        </Text>
        {picked === 'auto' ? (
          <>
            <Row wrap>
              <Chip label={t('My network is watched')} selected={bridges.watched} onPress={() => void useBridges({ ...bridges, watched: !bridges.watched })} />
            </Row>
            <Text variant="caption" tone="muted">
              {t('On, Tor never goes straight: whoever watches the network sees only a bridge, never that Tor is used.')}
            </Text>
            {on && bridges.use === 'auto' ? (
              <Text variant="caption" tone="faint">
                {autoNow.trying
                  ? t('Trying: {how}…', { how: routeName(autoNow.trying) })
                  : autoNow.using
                    ? t('Connected: {how}.', { how: routeName(autoNow.using) })
                    : autoNow.failed
                      ? t('No way worked from this network. Add bridges of your own, from bridges.torproject.org.')
                      : ''}
              </Text>
            ) : null}
          </>
        ) : null}
        {picked === 'own' ? (
          <>
            <Input
              value={draft}
              onChangeText={setDraft}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel={t('Bridge lines')}
              placeholder="obfs4 192.0.2.1:443 0123456789ABCDEF… cert=… iat-mode=0"
              style={{ minHeight: 120, fontSize: 13, textAlignVertical: 'top' }}
            />
            {own.wrong.length > 0 ? (
              <Text variant="caption" tone="muted">
                {t('Not a bridge line Erevos can use: {line}', { line: own.wrong[0] })}
              </Text>
            ) : own.lines.length > 0 ? (
              <Text variant="caption" tone="faint">
                {plural(own.lines.length, '{n} bridge', '{n} bridges')}
              </Text>
            ) : null}
            <Row wrap>
              <Button
                title={t('Use these bridges')}
                kind="secondary"
                compact
                disabled={own.lines.length === 0 || own.wrong.length > 0}
                onPress={() => void useBridges({ ...bridges, use: 'own', own: own.lines.join('\n') })}
              />
            </Row>
            {bridges.use !== 'own' ? (
              <Text variant="caption" tone="faint">
                {t('Not in use until you tap Use these bridges.')}
              </Text>
            ) : null}
          </>
        ) : null}
        <Text variant="caption" tone="muted">
          {way === 'messages'
            ? t('With bridges, Tor never goes straight to its relays: when no bridge answers, messages go to the server without Tor until one does.')
            : t('With bridges, Tor never goes straight to its relays: when no bridge answers, messages wait. Bridges count only while Tor is on.')}
        </Text>
      </Card>
      <Row wrap>
        <Button title={checking ? t('Checking…') : t('Check my connection')} kind="secondary" compact disabled={checking} onPress={() => void checkConnection()} />
      </Row>
      {note ? <Text tone="muted">{note}</Text> : null}
    </Page>
  );
}
