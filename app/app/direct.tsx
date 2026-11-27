// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { openGuideLink } from '../components/guide';
import { ModePicker, useMode } from '../components/mode-picker';
import { Button, Card, Chip, Field, Input, Page, Row, SectionTitle, Text } from '../components/ui';
import { askHelpers } from '../lib/call';
import { callHelpers, helpersTyped } from '../lib/direct';
import { t } from '../lib/i18n';
import { MODE_NAMES } from '../lib/modes';
import { useModules } from '../lib/modules';
import { rtc } from '../lib/webrtc';
import { loadCurrentSpaceData, STUN_MOST, updateCurrentSpaceData } from '../lock/space-data';

// How visible are you? The three modes (lib/modes.ts) and what each changes in plain words: who sees
// this phone's internet address, and how calls go; what none of them changes; and, with SPEED, the
// helper servers a call straight between two phones asks (lib/direct.ts), with a check that they answer.

/** How long the check waits for one helper server, milliseconds. */
const CHECK_WAIT_MS = 3_000;

const shown = (helper: string) => helper.replace(/^stun:/, '');
const listed = (helpers: readonly string[]) => helpers.map(shown).join(', ');

type Kept = { stun?: string; url: string };

export default function DirectScreen() {
  const on = useMode() === 'speed';
  const modules = useModules();
  const [kept, setKept] = useState<Kept | null>(null);
  // "My own" chosen: typed, used only once saved.
  const [own, setOwn] = useState(false);
  const [draft, setDraft] = useState('');
  const [note, setNote] = useState('');
  const [checking, setChecking] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    loadCurrentSpaceData()
      .then((data) => {
        setKept({ url: data.url, ...(data.stun === undefined ? {} : { stun: data.stun }) });
        setOwn(!!data.stun);
        setDraft(data.stun ?? '');
      })
      .catch(() => setNote(t('The settings of this space could not open.')));
  }, []);

  // The helper servers typed (`stun`), none (''), or the usual ones (left out).
  async function keep(stun: string | undefined) {
    if (!kept) return;
    setNote('');
    setAnswers([]);
    try {
      // Left out, it is not kept at all: the build's own are asked again.
      await updateCurrentSpaceData({ stun });
      setKept({ url: kept.url, ...(stun === undefined ? {} : { stun }) });
      setNote(t('Saved.'));
    } catch (error) {
      setNote(error instanceof Error ? error.message : String(error));
    }
  }

  function save() {
    const typed = helpersTyped(draft);
    if (!typed || typed.length === 0 || draft.length > STUN_MOST) {
      setNote(t('A helper server is written as stun.example.org or stun.example.org:3478, three at most, apart by commas.'));
      return;
    }
    const stun = listed(typed);
    setDraft(stun);
    void keep(stun);
  }

  // Asks as a call does: each of the first ones, and the reserve only when none of them answered.
  async function check() {
    if (!kept || checking) return;
    setChecking(true);
    setNote('');
    setAnswers([]);
    const lines: string[] = [];
    try {
      const groups = callHelpers(kept);
      let answered = false;
      for (const group of groups) {
        if (answered) {
          lines.push(t('The reserve was not asked, as one of the first answered.'));
          break;
        }
        for (const helper of group) {
          const took = await askHelpers(rtc, [helper], CHECK_WAIT_MS);
          if (took === 'cannot') {
            setNote(t('This device cannot ask a helper server outside a call.'));
            return;
          }
          answered = answered || took !== null;
          lines.push(took === null ? t('{server}: did not answer.', { server: shown(helper) }) : t('{server}: answered in {ms} ms.', { server: shown(helper), ms: took }));
          setAnswers([...lines]);
        }
      }
      if (!answered) lines.push(t('None answered. Is this phone on the internet? With no helper, a direct call connects only where the two phones find each other by themselves, as on the same Wi-Fi.'));
      setAnswers([...lines]);
    } finally {
      setChecking(false);
    }
  }

  const groups = kept ? callHelpers(kept) : [];
  const choice = own ? 'own' : kept?.stun === '' ? 'none' : 'usual';

  return (
    <Page>
      <Text variant="title">{t('How visible are you?')}</Text>
      <Text tone="muted">{t("Your address here is this phone's internet address (IP address): whoever sees it can tell roughly where the phone is, and on which network.")}</Text>
      <ModePicker />

      <SectionTitle title={MODE_NAMES.speed} />
      <Card>
        <Text>{t('Erevos does not ask before the things below: it does them at once.')}</Text>
        <Text>{t('A call or video call with a contact goes straight from phone to phone where it can, the fastest way, and through a call server where it cannot.')}</Text>
        <Text>{t('Calls and video calls work with a contact when no server is between you two, too: the call is set up through Nostr and goes straight from phone to phone.')}</Text>
        <Text tone="muted">{t('Group calls do not go straight over the internet: they go through the call server, or between phones on the same Wi-Fi.')}</Text>
        <Text variant="bodyStrong">{t('Who sees your internet address then')}</Text>
        <Text tone="muted">{t("The servers that carry what you send and your calls: yours, your contact's, and one a contact invites you to.")}</Text>
        <Text tone="muted">{t("Your contact's phone, in a call, and the helper servers, which tell each phone its own address.")}</Text>
        <Text tone="muted">{t('A server your contact chose for a file.')}</Text>
        <Text tone="muted">{t('The public Nostr servers, when two phones pair by a code of 8 digits.')}</Text>
        {modules.has('collection') ? <Text tone="muted">{t('A radio station or a TV channel of the Collection, while it plays.')}</Text> : null}
        {modules.has('phone') ? <Text tone="muted">{t('The site the list of spam numbers comes from, in Phone.')}</Text> : null}
        <Text>{t('None of them sees what you write or say: that stays end-to-end encrypted.')}</Text>
      </Card>

      <SectionTitle title={MODE_NAMES.anonymous} />
      <Card>
        <Text>{t('Before each of the things listed under SPEED, Erevos says once who would see your address, and you choose whether to go on.')}</Text>
        <Text>{t("Calls go only through a call server, which hides each phone's address from the other, or between two phones on the same Wi-Fi.")}</Text>
        <Text>{t('A call from a contact with no server between you two does not ring here: the chat shows it as missed.')}</Text>
        <Text tone="muted">{t('Tor for messages only, or Nostr through Tor, chosen on their own screens, keep this space ANONYMOUS.')}</Text>
      </Card>

      <SectionTitle title={MODE_NAMES.invisible} />
      <Card>
        <Text>{t('Everything of this space goes through Tor: messages, files and Nostr. The servers see an address of Tor, never yours, and your contacts see none.')}</Text>
        <Text>{t("There are no voice or video calls, as calls do not go through Tor: trying one says why, and a contact's call does not ring here. The chat shows it as missed.")}</Text>
        <Text tone="muted">{t('Messages and files come and go slower, and the first start of Tor takes a while. How Tor connects, and its bridges, are under Settings, Server and networks, Tor.')}</Text>
        <Text tone="muted">{t('Before anything that cannot go through Tor and would show your address, Erevos still asks first.')}</Text>
      </Card>

      <SectionTitle title={t('What none of them changes')} />
      <Card>
        <Text tone="muted">{t('Messages stay end-to-end encrypted in all three: no server, and no one on the way, reads them.')}</Text>
        <Text tone="muted">{t('Hidden chats, and chats set to "Through Tor", never connect directly and still ask.')}</Text>
        <Text tone="muted">{t("Erevos still asks before it opens a web link or shows a link's preview, and before it brings the messages of a phone beside this one from a server this phone does not use.")}</Text>
      </Card>

      <SectionTitle title={t('Good to know')} />
      <Card>
        <Text tone="muted">{t('A call cannot always go straight: some networks, mobile ones above all, let nothing in from outside. It then goes through a call server, which connects from any network. Where neither of you has a call server, Erevos says that the call could not connect directly.')}</Text>
        <Text tone="muted">{t('An Erevos older than this one rings for such a call, and then cannot connect.')}</Text>
        <Text tone="muted">{t('A phone with no server hears such a call only while Erevos reads on Nostr: left to sleep to spare the battery, it may miss one.')}</Text>
      </Card>

      {on ? (
        <>
          <SectionTitle title={t('Helper servers, for advanced users')} />
          <Card>
            <Text tone="muted">
              {t('To call straight from phone to phone, each phone asks a helper server what its own internet address is. The helper sees that address, once a call, and nothing of the call itself.')}
            </Text>
            <Row wrap>
              <Chip
                label={t('The usual ones')}
                selected={choice === 'usual'}
                onPress={() => {
                  setOwn(false);
                  if (kept?.stun !== undefined) void keep(undefined);
                }}
              />
              <Chip
                label={t('My own servers')}
                selected={choice === 'own'}
                onPress={() => {
                  setNote('');
                  setOwn(true);
                }}
              />
              <Chip
                label={t('No helper')}
                selected={choice === 'none'}
                onPress={() => {
                  setOwn(false);
                  if (kept?.stun !== '') void keep('');
                }}
              />
            </Row>
            {choice === 'own' ? (
              <Field hint={t('Three at most, apart by commas. Only these are asked, with no reserve. Used once saved.')}>
                <Input
                  value={draft}
                  onChangeText={setDraft}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  maxLength={STUN_MOST}
                  accessibilityLabel={t('Helper servers of your own')}
                  placeholder="stun.example.org:3478"
                />
              </Field>
            ) : null}
            {choice === 'own' ? (
              <Row wrap>
                <Button title={t('Save')} kind="secondary" compact disabled={!draft.trim()} onPress={save} />
              </Row>
            ) : null}
            <Text variant="caption" tone="muted">
              {groups.length === 0
                ? t('No helper server is asked now: a direct call connects only where the two phones find each other by themselves, as on the same Wi-Fi.')
                : groups.length === 1
                  ? t('Asked now: {servers}.', { servers: listed(groups[0]) })
                  : t('Asked now: {first}. Only when none of them answers: {reserve}.', { first: listed(groups[0]), reserve: listed(groups[1]) })}
            </Text>
            <Row wrap>
              <Button title={checking ? t('Checking…') : t('Check now')} kind="secondary" compact disabled={!kept || checking || groups.length === 0} onPress={() => void check()} />
            </Row>
            {answers.length > 0 ? <Text variant="caption">{answers.join('\n')}</Text> : null}
            <Text variant="caption" tone="faint">
              {t("The check asks them as a call does, so those it asks see this phone's internet address, as in a call.")}
            </Text>
          </Card>
        </>
      ) : null}

      {note ? <Text tone="muted">{note}</Text> : null}
      <Button title={t('Guide')} kind="secondary" onPress={() => openGuideLink('#direct')} />
    </Page>
  );
}
