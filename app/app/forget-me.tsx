// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { Button, Card, Chip, Page, Row, SectionTitle, Text } from '../components/ui';
import { confirm } from '../lib/alert';
import { forgetMe, startAgain, stoppedSince, type Count, type ForgetReport } from '../lib/forget-me';
import { t } from '../lib/i18n';
import { useTheme } from '../theme/context';

// Delete me from everywhere (Settings → Privacy and security, lib/forget-me.ts): what the servers
// keep for the open space is deleted, and the space stops until it is started again. The phone
// keeps everything it has; the panic button (app/panic.tsx) is the one that wipes the phone.

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));
const two = (n: number) => String(n).padStart(2, '0');
// When the space was stopped: day/month/year hour:minute.
const whenText = (at: number) => {
  const d = new Date(at);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${two(d.getHours())}:${two(d.getMinutes())}`;
};

const line = (what: string, c: Count) => (c.done + c.gone + c.failed > 0 ? t('{what}: {done} deleted, {gone} gone already, {failed} not reached', { what, done: c.done, gone: c.gone, failed: c.failed }) : '');

export default function ForgetMe() {
  const { colors } = useTheme();
  const [since, setSince] = useState(0);
  const [accounts, setAccounts] = useState(false);
  const [working, setWorking] = useState(false);
  const [report, setReport] = useState<ForgetReport | null>(null);
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null);

  useEffect(() => {
    void stoppedSince().then(setSince, () => undefined);
  }, []);

  async function run(withAccounts: boolean) {
    setWorking(true);
    setNote(null);
    try {
      setReport(await forgetMe(withAccounts));
      setSince(await stoppedSince());
    } catch (error) {
      setNote({ text: errorText(error), bad: true });
    }
    setWorking(false);
  }

  async function start() {
    if (!(await confirm(t('Delete me from everywhere'), t('What the servers keep for this space is deleted for good, and the space stops receiving. Your phone keeps its chats. This cannot be undone.'), t('Go on')))) return;
    if (!(await confirm(t('Are you sure?'), t('Last question: your contacts will not reach you until you start this space again and give them a new contact link.'), t('Delete me')))) return;
    await run(accounts);
  }

  async function again() {
    setWorking(true);
    try {
      await startAgain();
      setSince(0);
      setReport(null);
      setNote({ text: t('Started again. Your queues are made anew and your contacts are told quietly.'), bad: false });
    } catch (error) {
      setNote({ text: errorText(error), bad: true });
    }
    setWorking(false);
  }

  const lines = report
    ? [
        line(t('Server queues'), report.queues),
        line(t('Messages held for later'), report.held),
        line(t('Files waiting'), report.files),
        line(t('Invites not used'), report.invites),
        line(t('Nostr requests'), report.nostr),
      ].filter(Boolean)
    : [];

  return (
    <Page>
      <Text variant="title">{t('Delete me from everywhere')}</Text>
      <Text variant="caption" tone="muted" style={hint}>
        {t('This deletes what the servers keep for this space: its queues on the servers, with the messages waiting in them, the messages and files they hold for you, and your invites not used yet. It also asks the Nostr servers to forget the keys your chats read on. Your phone keeps everything it has.')}
      </Text>
      <Text variant="caption" tone="muted" style={hint}>
        {t('Then this space is stopped: it receives and sends nothing until you tap Start again. Hidden chats that receive while closed are cleared with it; the others when you open them while the space is stopped.')}
      </Text>
      <Text variant="caption" tone="muted" style={hint}>
        {t('It cannot reach what others keep: your contacts, Nostr servers that do not do as asked, files you sent through a file server, and the Matrix and XMPP servers.')}
      </Text>

      {since > 0 ? (
        <>
          <SectionTitle title={t('This space is stopped')} />
          <Card>
            <Text variant="bodyStrong">{t('Stopped since {when}: it receives and sends nothing.', { when: whenText(since) })}</Text>
            <Text variant="caption" tone="muted" style={hint}>
              {t('Start again makes new queues, as after a server lost them, and tells your contacts quietly. Give them a new contact link too.')}
            </Text>
            <Row wrap>
              <Button title={working ? t('One moment…') : t('Start again')} compact onPress={() => void again()} disabled={working} />
              <Button title={t('Delete again')} kind="secondary" compact onPress={() => void run(accounts)} disabled={working} />
            </Row>
          </Card>
        </>
      ) : null}

      <SectionTitle title={t('Delete')} />
      <Card>
        <Row wrap>
          <Chip label={t('Also sign out of Matrix and XMPP, and delete the Nostr account made here')} selected={accounts} onPress={() => setAccounts(!accounts)} />
        </Row>
        {since === 0 ? (
          <Row wrap>
            <Button title={working ? t('One moment…') : t('Delete me from everywhere')} kind="danger" compact onPress={() => void start()} disabled={working} />
          </Row>
        ) : null}
      </Card>

      {report ? (
        <>
          <SectionTitle title={t('What was done')} />
          <Card>
            {lines.map((text) => (
              <Text key={text}>{text}</Text>
            ))}
            {lines.length === 0 ? <Text tone="muted">{t('Nothing was kept on the servers.')}</Text> : null}
            {report.nostr.skipped === 'tor' ? <Text tone="muted">{t('Nostr was not asked: Tor is not ready yet. Wait until it is, and delete again.')}</Text> : null}
            {report.nostr.skipped === 'core' ? <Text tone="muted">{t('Nostr was not asked: this build of Erevos cannot.')}</Text> : null}
            {report.matrix !== undefined ? <Text>{report.matrix ? t('Signed out of Matrix.') : t('Could not sign out of Matrix.')}</Text> : null}
            {report.xmpp !== undefined ? <Text>{report.xmpp ? t('Signed out of XMPP.') : t('Could not sign out of XMPP.')}</Text> : null}
            {report.telegram !== undefined ? <Text>{report.telegram ? t('Signed out of Telegram.') : t('Could not sign out of Telegram.')}</Text> : null}
            {report.nostrAccount === 'vanished' ? <Text>{t('The Nostr account made here was asked to vanish and is forgotten here.')}</Text> : null}
            {report.nostrAccount === 'failed' ? <Text>{t('The Nostr account could not be asked to vanish: it stays.')}</Text> : null}
            {report.nostrAccount === 'brought' ? <Text tone="muted">{t('The Nostr account you brought from another app is left as it is: it is used elsewhere.')}</Text> : null}
            {report.unreached.length > 0 ? (
              <Text variant="label" color={colors.danger}>
                {t('Not reached: {relays}. Delete again when they are.', { relays: report.unreached.join(', ') })}
              </Text>
            ) : null}
          </Card>
        </>
      ) : null}

      {note ? (
        <Text variant="label" color={note.bad ? colors.danger : colors.success}>
          {note.text}
        </Text>
      ) : null}
    </Page>
  );
}

const hint = { fontSize: 14, lineHeight: 20 };
