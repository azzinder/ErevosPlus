// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { useRouter } from 'expo-router';

type Router = ReturnType<typeof useRouter>;

import { confirm } from '../lib/alert';
import { plural, t } from '../lib/i18n';
import { whereParams, type NetworkWhere } from '../lib/network-place';
import { isTelegramLink } from '../lib/telegram-links';
import { telegramJoinInvite, telegramLinkTarget } from '../lib/telegram-store';
import { openLink } from './linked-text';
import { telegramJoinGate } from './telegram-ip';

/**
 * A link tapped in a Telegram chat (app/telegram-chat.tsx, app/telegram-thread.tsx): Telegram's
 * own (lib/telegram-links.ts) opens its chat or message here, or asks to join by its invitation;
 * any other, or one Telegram does not know, asks before it opens in the browser, as in every chat.
 * `here`: the chat on the screen, whose own messages go to in place (`goTo`).
 */
export async function openTelegramLink(
  url: string,
  { router, where, here, goTo, say }: { router: Router; where: NetworkWhere; here?: number; goTo?: (messageId: number) => void; say: (note: string) => void },
): Promise<void> {
  if (!isTelegramLink(url)) {
    openLink(url);
    return;
  }
  try {
    const target = await telegramLinkTarget(url);
    if (!target) {
      openLink(url);
      return;
    }
    if (target.kind === 'chat') {
      if (target.chatId === here && target.at !== undefined && goTo) goTo(target.at);
      else if (target.chatId !== here || target.at !== undefined) router.push({ pathname: '/telegram-chat', params: { id: String(target.chatId), ...(target.at !== undefined ? { at: String(target.at) } : {}), ...whereParams(where) } });
      return;
    }
    const about = target.members ? plural(target.members, '{name}, {n} member.', '{name}, {n} members.', { name: target.title }) : target.title;
    if (!(await confirm(t('Join this Telegram chat?'), about, t('Join')))) return;
    if (!(await telegramJoinGate(target.link, where))) return;
    const joined = await telegramJoinInvite(target.link);
    if (joined) router.push({ pathname: '/telegram-chat', params: { id: String(joined), ...whereParams(where) } });
    else say(t('Asked to join. Its admins let you in.'));
  } catch (error) {
    say(error instanceof Error ? error.message : String(error));
  }
}
