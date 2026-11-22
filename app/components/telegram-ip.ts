// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { accountThroughTor } from '../lib/account-tor';
import { t } from '../lib/i18n';
import type { NetworkWhere } from '../lib/network-place';
import { telegramSetChatTor, telegramTorNow } from '../lib/telegram-store';

import { hiddenKeep, ipGate } from './ip-warning';

// Telegram's warnings before this phone's internet address can be seen (lib/ip-warning.ts), each
// said once. TDLib has one connection for all of an account, so whether it goes through Tor now is
// the account's (lib/account-tor.ts), made Always by any chat set «Through Tor». Link previews are
// made by Telegram's servers, never fetched by the phone, so they need none. A hidden place's own
// account keeps its warnings with its hidden chats (hiddenKeep), never in the space's data.

const keepOf = (where: NetworkWhere) => (where === 'space' ? {} : { keep: hiddenKeep() });

/** Before sending in a chat while the account does not go through Tor: «Through Tor» for this chat, which puts the whole account through Tor, is the way not to show the address. */
export function telegramSendGate(chatId: number, where: NetworkWhere): Promise<boolean> {
  if (accountThroughTor(telegramTorNow(where))) return Promise.resolve(true);
  return ipGate(
    { network: 'Telegram', act: 'send', of: `telegram:${chatId}`, own: true, ...keepOf(where) },
    { label: t('Account through Tor'), run: () => telegramSetChatTor(chatId, true, where) },
  );
}

/** Before every call, made or answered: calls never go through Tor, and can go straight between the phones. */
export function telegramCallGate(userId: number, where: NetworkWhere): Promise<boolean> {
  return ipGate({ network: 'Telegram', act: 'call', of: `telegram:${userId}`, ...keepOf(where) });
}

/** Before joining a group or channel by its link while the account does not go through Tor. */
export function telegramJoinGate(link: string, where: NetworkWhere = 'space'): Promise<boolean> {
  if (accountThroughTor(telegramTorNow(where))) return Promise.resolve(true);
  return ipGate({ network: 'Telegram', act: 'join', of: `telegram:${link.slice(0, 120)}`, ...keepOf(where) });
}
