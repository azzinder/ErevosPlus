// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { ask } from '../lib/alert';
import { afterGuide } from '../lib/guide-shown';
import { openHiddenPlace } from '../lib/hidden-contacts';
import { t } from '../lib/i18n';
import { IP_GUIDE, ipGoneOn, ipKey, ipSaid, ipWarningText, type IpFix, type IpKeep, type IpWarning } from '../lib/ip-warning';
import { throughTor } from '../lib/relay';
import { circuitOf } from '../lib/tor-chats';

import { openGuideLink } from './guide';
import { Button, Card, Row, Text, TextButton } from './ui';

// Saying that this phone's internet address may be seen (lib/ip-warning.ts), before it may be:
// asked once (ipGate), or shown in a screen as it stands (IpNotice).

// The questions open now, by what they are kept by: one asked twice at once is asked once.
const asking = new Map<string, Promise<boolean>>();
// When each was last answered with Cancel: what was about to go after it, at once (the next of
// several files shared, or of messages forwarded), is not asked again.
const stopped = new Map<string, number>();
const STOPPED_HOLDS = 2000;

/** Where a warning of the hidden chats open now is kept: their own data, or, should none be open here, memory only (lib/ip-warning.ts IpKeep). */
export function hiddenKeep(): IpKeep {
  const open = openHiddenPlace();
  return open ? { space: open.space, pocket: open.pocket, key: open.key } : 'memory';
}

/** The warning before a call with an Erevos contact (`identity`, hex) goes through a call relay, the same for one made and one answered; `keep` for the hidden chats'. */
export function callIpWarning(identity: string, keep?: IpKeep): IpWarning {
  return { network: 'Erevos', act: 'call', of: circuitOf(identity), ...(keep ? { keep } : {}) };
}

/**
 * Before the first of what is sent to Erevos group `id` (words, a photo, a file, a voice message):
 * its messages go without Tor unless the space's way is Everything, so that the relays that carry
 * them see this phone's internet address is said once for the group. `hidden`: a group of the
 * hidden chats, whose warning is kept with them.
 */
export function groupIpGate(id: string, hidden: boolean): Promise<boolean> {
  if (throughTor()) return Promise.resolve(true);
  return ipGate({ network: 'Erevos', act: 'send', of: `group ${id.slice(0, 48)}`, ...(hidden ? { keep: hiddenKeep() } : {}) });
}

/**
 * Says `warning` before what it is of happens, unless it was said and gone on from already: true
 * to go on, false to stop. A phone's question has three buttons at most: `fix`, when given (a way
 * to go on without showing the address, such as Tor for the chat), which is done and then goes on,
 * else Cancel; Guide, which opens the guide's section on it and asks again once it is closed, so
 * what was about to go (a voice message recorded, a file shared) waits for it and is not lost; and
 * Go on, which goes on and keeps that it was said.
 */
export function ipGate(warning: IpWarning, fix?: IpFix): Promise<boolean> {
  const key = ipKey(warning);
  const open = asking.get(key);
  if (open) return open;
  const asked = askOnce(warning, key, fix).finally(() => asking.delete(key));
  asking.set(key, asked);
  return asked;
}

async function askOnce(warning: IpWarning, key: string, fix?: IpFix): Promise<boolean> {
  if (await ipSaid(warning)) return true;
  if (Date.now() - (stopped.get(key) ?? 0) < STOPPED_HOLDS) return false;
  const { title, message } = ipWarningText(warning);
  for (;;) {
    const choice = await new Promise<'fix' | 'guide' | 'go' | 'stop'>((resolve) => {
      ask(title, message, [
        fix ? { text: fix.label, onPress: () => resolve('fix') } : { text: t('Cancel'), style: 'cancel', onPress: () => resolve('stop') },
        { text: t('Guide'), onPress: () => resolve('guide') },
        { text: t('Go on'), onPress: () => resolve('go') },
      ]);
    });
    if (choice === 'guide') {
      const closed = afterGuide();
      openGuideLink(IP_GUIDE);
      await closed;
      continue;
    }
    if (choice === 'fix' && fix) {
      try {
        await fix.run();
        return true;
      } catch {
        return false;
      }
    }
    if (choice === 'stop') {
      stopped.set(key, Date.now());
      return false;
    }
    await ipGoneOn(warning).catch(() => undefined);
    return true;
  }
}

/** The warning `warning` as it stands, in a screen: its words, `fix` when given, and the guide. */
export function IpNotice({ warning, fix }: { warning: IpWarning; fix?: IpFix }) {
  const { title, message } = ipWarningText(warning);
  return (
    <Card>
      <Text variant="bodyStrong">{title}</Text>
      <Text tone="muted">{message}</Text>
      <Row wrap>
        {fix ? <Button title={fix.label} compact onPress={() => void fix.run()} /> : null}
        <Button title={t('Guide')} kind="secondary" compact onPress={() => openGuideLink(IP_GUIDE)} />
      </Row>
    </Card>
  );
}

/**
 * The quiet line of a chat or group that goes without Tor, above where you write, once the warning
 * of what is sent was said (ipKey: once for the network): that the relays see this phone's internet
 * address, with `fix` beside it when given (Tor for the chat), and the guide.
 */
export function IpQuiet({ fix }: { fix?: IpFix }) {
  return (
    <Row wrap style={{ alignItems: 'center', gap: 4 }}>
      <Text variant="caption" tone="faint">
        {t('Without Tor: the relays see your internet address.')}
      </Text>
      {fix ? <TextButton title={fix.label} onPress={() => void fix.run()} /> : null}
      <TextButton title={t('Guide')} onPress={() => openGuideLink(IP_GUIDE)} />
    </Row>
  );
}
