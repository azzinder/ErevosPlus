// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { FoundRow } from '../components/found-row';
import { Page, Text } from '../components/ui';
import { hasCore } from '../lib/core';
import { t } from '../lib/i18n';
import { shownName } from '../lib/inbox';
import { canGroup } from '../lib/core';
import { onMatrixChange, runMatrix } from '../lib/matrix-store';
import { foundAt, foundName, groupFindables, starredOf } from '../lib/message-search';
import { useModules } from '../lib/modules';
import { onNostrDmChange, runNostrDm } from '../lib/nostr-dm-store';
import { spaceChats } from '../lib/space-chats';
import { spaceGroups } from '../lib/space-groups';
import { loadSpaceStars, starChatNow, type SpaceStars } from '../lib/starred-networks';
import { latestFirst, starredNow, type StarredRow } from '../lib/stars';
import { onXmppChange, runXmpp } from '../lib/xmpp-store';
import { telegramStarredMessages } from '../lib/telegram-store';
import { telegramLine } from '../lib/telegram-view';
import { forgetStars, onStarsChange, spaceStarPlace } from '../lock/stars-data';

// The starred messages of the open space's chats, the latest first, from the home screen's menu: its
// Erevos chats and groups, and its chats on Matrix, XMPP and Nostr and its SMS (lib/stars.ts), each
// with its network beside its chat's name. A tap opens the chat at the message. A message is
// starred, or not, from its menu in the chat (held down), on this device only. A starred message
// deleted, or of a chat left, goes from among them; one only older than what its chat keeps stays,
// and its chat opens where it was. Hidden chats' starred messages, and those of a hidden place's own
// accounts, are in each chat's details. The space's Telegram chats' follow, asked of Telegram (lib/telegram-store.ts
// telegramStarredMessages), but for those locked with their PIN or kept in hidden chats.

const CONTACT_PREFIX = 'contact:';

export default function StarredScreen() {
  const modules = useModules();
  const erevosOn = modules.has('erevos');
  const [found, setFound] = useState<StarredRow[] | null>(null);
  const [kept, setKept] = useState<SpaceStars | null>(null);
  // Counts the changes of the chats on other networks, so their names and messages follow.
  const [, setChanged] = useState(0);
  // And the space's Telegram's (the ErevosGram build), asked of Telegram as the screen shows.
  const [telegram, setTelegram] = useState<StarredRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void telegramStarredMessages().then(
        (list) =>
          active &&
          setTelegram(
            list.map(({ chat, message }) => ({
              key: `telegram|${message.chatId}|${message.id}`,
              name: `${chat} · Telegram`,
              line: telegramLine(message),
              at: message.date * 1000,
              href: `/telegram-chat?id=${message.chatId}&at=${message.id}`,
            })),
          ),
        () => undefined,
      );
      return () => {
        active = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (!hasCore() || !erevosOn) {
        setFound([]);
        return;
      }
      void Promise.all([spaceChats(), canGroup() ? spaceGroups().catch(() => null) : null])
        .then(([{ e2e, history }, groups]) => {
          if (!active) return;
          const listed = groups?.list() ?? [];
          const names = new Map([
            ...e2e.contacts().map((c): [string, string] => [`${CONTACT_PREFIX}${c.identity}`, shownName(c)]),
            ...listed.map((g): [string, string] => [`group:${g.id}`, g.name]),
          ]);
          const nameOf = (peer: string) => names.get(peer) ?? shownName({ identity: peer.slice(CONTACT_PREFIX.length), name: '' });
          const said = listed.filter((g) => !g.locked).flatMap((g) => groupFindables(g.id, groups!.messages(g.id)));
          // None from a chat locked with its PIN: it shows them once opened with it.
          const locked = new Set(e2e.contacts().filter((c) => c.locked).map((c) => `${CONTACT_PREFIX}${c.identity}`));
          setFound(
            starredOf([...history.messages().filter((m) => !locked.has(m.peer)), ...said]).map((m) => ({
              key: `${m.peer}|${m.tag}`,
              name: foundName(m, nameOf(m.peer)),
              line: m.line,
              at: m.at,
              href: foundAt(m),
            })),
          );
        })
        .catch(() => active && setFound([]));
      return () => {
        active = false;
      };
    }, [erevosOn]),
  );

  // The stars of the chats on other networks and of the SMS, read again as they change.
  useFocusEffect(
    useCallback(() => {
      const place = spaceStarPlace();
      if (!place) {
        setKept({ stars: [], sms: new Map() });
        return;
      }
      let active = true;
      const read = () =>
        void loadSpaceStars(place, modules).then(
          (got) => active && setKept(got),
          () => active && setKept({ stars: [], sms: new Map() }),
        );
      read();
      const off = onStarsChange(read);
      return () => {
        active = false;
        off();
      };
    }, [modules]),
  );

  // Their accounts run, so their chats are here to name the stars by.
  useEffect(() => {
    const changed = () => setChanged((n) => n + 1);
    const offs: (() => void)[] = [];
    if (modules.has('matrix')) {
      runMatrix();
      offs.push(onMatrixChange(changed));
    }
    if (modules.has('xmpp')) {
      runXmpp();
      offs.push(onXmppChange(changed));
    }
    if (modules.has('nostr')) {
      runNostrDm();
      offs.push(onNostrDmChange(changed));
    }
    return () => offs.forEach((off) => off());
  }, [modules]);

  const others = kept ? starredNow(kept.stars, (star) => starChatNow(star, modules, kept.sms)) : null;
  // Those whose message or chat is gone lose their star.
  const goneKey = others?.gone.map((s) => `${s.service}|${s.chat}|${s.id}`).join('\n') ?? '';
  useEffect(() => {
    const place = spaceStarPlace();
    if (!goneKey || !place || !others) return;
    void forgetStars(place, others.gone).catch(() => undefined);
  }, [goneKey]);

  const rows = found && others ? latestFirst([...found, ...others.rows, ...telegram]) : null;
  const now = Date.now();

  return (
    <Page>
      <Text variant="title">{t('Starred messages')}</Text>
      {rows && rows.length === 0 ? <Text tone="muted">{t('No starred messages. Press and hold a message in a chat, then tap Star.')}</Text> : null}
      {(rows ?? []).map((m) => (
        <FoundRow key={m.key} name={m.name} line={m.line} at={m.at} now={now} starred onPress={() => router.push(m.href)} />
      ))}
    </Page>
  );
}
