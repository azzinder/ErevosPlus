// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { pinOf, shotsBlocked, type SmsOwnChange } from '../lib/chat-protect';
import { t } from '../lib/i18n';
import { groupName, smsNumbers } from '../lib/sms-group';
import { SmsLink } from '../lib/sms-link';
import { currentSpace } from '../lock/keys';
import type { SmsOwn } from '../lock/sms-own';
import { canSmsOwnNotices } from '../modules/erevos-sms';
import type { ChatLook } from '../theme/chat-theme';
import { checkedLook } from '../theme/look';

import { ChatLookSheet, ChatScreen } from './chat-look';
import { useChatProtect } from './chat-protect';
import { NetworkChatNotify } from './network-chat-notify';
import { Button, Row, Text } from './ui';

// An SMS conversation's screen (app/sms.tsx) with what it has of its own in the space
// (lock/sms-own.ts): its own look, or the space's (components/chat-look.tsx), as a chat on Matrix,
// XMPP or Nostr has; a PIN of its own, whose gate shows in its place until it is typed, so that
// nothing of it is read or shown meanwhile, and its screenshots blocked (components/chat-protect.tsx);
// and, for a conversation with one number on the phone whose SMS they are, notifications of its own
// (lib/sms-notices.ts). Nothing of it shows until it is known whether it is locked. `children`
// draws the conversation, given the buttons for these.

export function SmsOwnScreen({ to, children }: { to: string; children: (tools: ReactNode, said: string) => ReactNode }) {
  // What it has of its own, as read: undefined until then.
  const [own, setOwn] = useState<SmsOwn | null | undefined>(undefined);
  const [styling, setStyling] = useState(false);
  const [note, setNote] = useState('');
  const link = useRef<SmsLink | null>(null);

  useEffect(() => {
    let live = true;
    setOwn(undefined);
    let open: { space: number; key: Uint8Array } | null = null;
    try {
      open = currentSpace();
    } catch {
      open = null;
    }
    if (!to || !open) {
      setOwn(null);
      return;
    }
    SmsLink.open(open.space, open.key)
      .then((opened) => {
        if (!live) return;
        link.current = opened;
        setOwn(opened.own(to));
      })
      .catch(() => live && setOwn(null));
    return () => {
      live = false;
    };
  }, [to]);

  const save = async (change: SmsOwnChange) => {
    const opened = link.current ?? (await SmsLink.open(currentSpace().space, currentSpace().key));
    link.current = opened;
    await opened.setOwn(to, change);
    setOwn(opened.own(to));
  };

  const numbers = smsNumbers(to);
  const name = numbers.length > 0 ? groupName(numbers) : to;
  const look = useMemo(() => (own?.look ? checkedLook(own.look) : null), [own?.look]);
  const lookChat = useMemo<ChatLook | null>(() => (to ? { look, save: (next) => save({ look: next }) } : null), [look, to]);
  const guard = useChatProtect({
    id: `sms:${to}`,
    name,
    pin: pinOf(own),
    shots: shotsBlocked(own),
    lockable: !!to && own !== undefined,
    save,
    say: setNote,
    onBack: () => (router.canGoBack() ? router.back() : router.replace('/')),
  });
  const tools = (
    <>
      <Row wrap>
        {numbers.length === 1 && canSmsOwnNotices() ? <NetworkChatNotify notify={own?.notify ?? null} calls={false} onChange={(next) => save({ notify: next })} /> : null}
        <Button title={t('Chat look')} kind="secondary" compact onPress={() => setStyling(true)} />
        {guard.buttons}
      </Row>
      <ChatLookSheet visible={styling} onClose={() => setStyling(false)} name={name} chat={lookChat} />
    </>
  );
  return (
    <ChatScreen chat={lookChat} header>
      {own === undefined ? null : (guard.gate ?? children(tools, note))}
    </ChatScreen>
  );
}
