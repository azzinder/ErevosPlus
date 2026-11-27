// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { Button, Card, Chip, Input, Page, Row, SectionTitle, Text } from '../components/ui';
import { canNostr, canNostrTor } from '../lib/core';
import { setDirect } from '../lib/direct';
import { t } from '../lib/i18n';
import { modeSaid } from '../lib/modes';
import { nostrOf, nostrStates, onNostrStates, setNostr, type NostrRelayState } from '../lib/nostr';
import type { TorWay } from '../lib/relay';
import { isNostrRelay, MAX_NOSTR_RELAYS } from '../lock/e2e-data';
import { loadCurrentSpaceData, NOSTR_RELAYS, updateCurrentSpaceData, type NostrSetting } from '../lock/space-data';

// Whether the space's texts go through Nostr (lib/nostr.ts), on unless changed; whether Nostr goes
// through Tor by its own switch, off unless turned on, besides the space's Tor way; the Nostr
// relays it reads on: the first three unless changed, and any of one's own; and what each relay
// did last since Erevos started, so a test shows where a text went and why. Where there is no Tor
// (the web app, the computer app, Sailfish OS's), Nostr is reached straight, and the switch shows
// only while it is on, as a phone's backup may bring it, to turn it off.

const pad = (n: number) => String(n).padStart(2, '0');

// The setting with Nostr's own Tor switch off: left out, as at first.
const withoutTor = ({ tor: _tor, ...rest }: NostrSetting): NostrSetting => rest;
const clock = (at: number) => {
  const d = new Date(at);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// What a relay did last, in a line or two.
function stateLines(state: NostrRelayState | undefined, ours: boolean): string[] {
  const { sent, read } = state ?? {};
  const lines = [
    sent
      ? sent.took
        ? t('Took the last text {seconds} s after it was sent, at {time}.', { seconds: (sent.ms / 1000).toFixed(1), time: clock(sent.at) })
        : t('Did not take the last text, at {time}. {why}', { time: clock(sent.at), why: sent.why ?? '' })
      : t('No text given to it since Erevos started.'),
  ];
  if (read) lines.push(read.reading ? t('Read on since {time}.', { time: clock(read.at) }) : t('Could not be read on, at {time}. {why}', { time: clock(read.at), why: read.why ?? '' }));
  else if (ours) lines.push(t('Not read on yet.'));
  return lines;
}

export default function NostrScreen() {
  const [setting, setSetting] = useState<NostrSetting | null>(null);
  const [tor, setTor] = useState<TorWay | null>(null);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [states, setStates] = useState(nostrStates);

  useEffect(() => onNostrStates(() => setStates(nostrStates())), []);

  useEffect(() => {
    loadCurrentSpaceData()
      .then((data) => {
        setSetting(data.nostr);
        setTor(data.tor);
      })
      .catch(() => setNote(t('The settings of this space could not open.')));
  }, []);

  if (!canNostr()) {
    return (
      <Page>
        <Text variant="title">Nostr</Text>
        <Text tone="muted">{t('This build of Erevos has no Nostr yet. It comes with the next build of the app.')}</Text>
      </Page>
    );
  }

  async function keep(next: NostrSetting, said = '') {
    setNote('');
    try {
      // Nostr through Tor on: Direct connections goes off with it (SPEED becomes ANONYMOUS), and stays
      // off until the owner chooses SPEED again (lib/direct.ts), as with the space's Tor way.
      const direct = next.tor === true && setting?.tor !== true && (await loadCurrentSpaceData()).direct;
      await updateCurrentSpaceData(direct ? { nostr: next, direct: false } : { nostr: next });
      if (direct) setDirect(false);
      setSetting(next);
      setNostr(nostrOf(next), next.tor === true);
      setNote(direct ? modeSaid('anonymous') : said || t('Saved.'));
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  function add() {
    if (!setting) return;
    const address = draft.trim().replace(/\/+$/, '');
    if (!isNostrRelay(address)) {
      setNote(t('A Nostr server address starts with wss://.'));
      return;
    }
    if (setting.relays.includes(address)) {
      setNote(t('That server is on the list already.'));
      return;
    }
    if (setting.relays.length >= MAX_NOSTR_RELAYS) {
      setNote(t('Five servers at most: remove one first.'));
      return;
    }
    setDraft('');
    void keep({ ...setting, relays: [...setting.relays, address] });
  }

  const relays = setting?.relays ?? [];
  const firsts = relays.join(' ') === NOSTR_RELAYS.join(' ');
  // This build reaches Nostr through Tor: on Android. Elsewhere only straight (lib/nostr.ts).
  const torHere = canNostrTor();
  const shown = [...relays, ...[...states.keys()].filter((url) => !relays.includes(url))];

  return (
    <Page>
      <Text variant="title">Nostr</Text>
      <Card>
        <Text variant="bodyStrong">{t('Texts through Nostr')}</Text>
        <Text tone="muted">
          {t(
            'What you write to a contact whose Erevos reads on Nostr too goes through your servers first: your server, then their home servers, then your home server. Only when none of them takes it does it go through public Nostr servers. There it is end-to-end encrypted as always, and sealed once more for a key your contact gave this chat alone, by a key made for that message alone: the Nostr servers see neither who wrote it nor to whom, and your server does not see what went that way.',
          )}
        </Text>
        <Row wrap>
          <Chip label={t('On')} selected={setting?.on === true} onPress={() => setting && void keep({ ...setting, on: true })} />
          <Chip label={t('Off')} selected={setting?.on === false} onPress={() => setting && void keep({ ...setting, on: false })} />
        </Row>
        {torHere || setting?.tor === true ? (
          <>
            <Text variant="bodyStrong">{t('Nostr through Tor')}</Text>
            <Row wrap>
              {torHere ? <Chip label={t('On')} selected={setting?.tor === true} onPress={() => setting && void keep({ ...setting, tor: true })} /> : null}
              <Chip label={t('Off')} selected={setting !== null && setting.tor !== true} onPress={() => setting && void keep(withoutTor(setting))} />
            </Row>
          </>
        ) : null}
        {tor && setting && torHere ? (
          <Text tone="muted">
            {tor !== 'off'
              ? t("Tor is on for this space, so Erevos reaches the Nostr servers through Tor: they do not see this phone's internet address.")
              : setting.tor === true
                ? t("Erevos reaches the Nostr servers through Tor, and starts Tor for it: they do not see this phone's internet address. While Tor starts, a text that goes there waits.")
                : t("Tor is off for this space, so Erevos reaches the Nostr servers straight: they see this phone's internet address, as your server does, but still neither who wrote a text nor to whom.")}
          </Text>
        ) : null}
        {tor && setting && !torHere ? (
          <Text tone="muted">
            {setting.tor === true
              ? t('Nostr through Tor is on, and this device has no Tor: Erevos reaches no Nostr server here. Turn it off to reach them straight.')
              : tor === 'all'
                ? t('This space sends everything through Tor, which this device does not have: Erevos reaches no Nostr server here. Choose SPEED or ANONYMOUS at the top of Settings to reach them straight.')
                : t('This device has no Tor, so Erevos reaches the Nostr servers straight: they see its internet address, as your server does, but still neither who wrote a text nor to whom.')}
          </Text>
        ) : null}
        {torHere ? <Text tone="muted">{t('A chat set to "Through Tor" reaches the Nostr servers only through Tor, whatever this switch says.')}</Text> : null}
        <Text tone="muted">
          {t(
            "A text that went through Nostr goes through your server again should your contact's phone not say within five minutes that it came, and they see it once. While Tor starts, or when no Nostr server takes it either, it waits and goes again, as any message does.",
          )}
        </Text>
        <Text tone="muted">
          {t(
            'Pictures, files, voice messages, calls, reactions, and the marks that a message came or was read go through your server, as before.',
          )}
        </Text>
        <Text tone="muted">
          {t(
            'Hidden chats read on Nostr too, while they are open. Closed, they still show "New message": with each text through Nostr, your contact also sends your server a bell that says nothing.',
          )}
        </Text>
      </Card>

      <SectionTitle title={t('Nostr servers')} />
      <Card>
        <Text variant="caption" tone="muted">
          {t('Your contacts are told the servers you read on, and write to you there. One that takes it is enough.')}
        </Text>
        {relays.map((relay) => (
          <Row key={relay}>
            <Text style={{ flex: 1 }}>{relay}</Text>
            <Button
              title={t('Remove')}
              kind="secondary"
              compact
              disabled={relays.length <= 1}
              onPress={() => setting && void keep({ ...setting, relays: relays.filter((r) => r !== relay) })}
            />
          </Row>
        ))}
        <Input
          value={draft}
          onChangeText={setDraft}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          accessibilityLabel={t('Nostr server address')}
          placeholder="wss://relay.example.org"
        />
        <Row wrap>
          <Button title={t('Add')} kind="secondary" compact disabled={!draft.trim()} onPress={add} />
          {!firsts ? (
            <Button title={t('The first servers again')} kind="secondary" compact onPress={() => setting && void keep({ ...setting, relays: NOSTR_RELAYS })} />
          ) : null}
        </Row>
      </Card>

      <SectionTitle title={t('What the servers did last')} />
      <Card>
        <Text variant="caption" tone="muted">
          {t("Since Erevos started, kept on this phone only, and only for as long as it runs: whether each server took the last text it was given, and whether it is read on. Your contacts' servers show here too once a text went to them.")}
        </Text>
        {shown.map((url) => (
          <Text key={url} variant="caption">
            {[url, ...stateLines(states.get(url), relays.includes(url))].join('\n')}
          </Text>
        ))}
      </Card>
      {note ? <Text tone="muted">{note}</Text> : null}
    </Page>
  );
}
