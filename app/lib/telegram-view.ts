// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { plainWords } from './text-style';
import { t } from './i18n';
import { lastSeenText } from './last-seen';
import type { TgStatus, TgUser } from './telegram';
import type { TgMessage } from './telegram';
import { isWire, type Shown } from './telegram-seal';

// What a Telegram message says in one line (the chat list, the home list, a reply's quote, a
// message's menu): never an ErevosGram packet's own text, which is base64 and means nothing to read.

/** What a wire message of ours shows when nothing opened it: it cannot be read here. */
export const unopened = (m: TgMessage): Shown | null => (m.kind === 'text' && isWire(m.text) ? { kind: 'unreadable' } : null);

/** The line for what an ErevosGram packet carried. */
export function sealedLine(shown: Shown): string {
  switch (shown.kind) {
    case 'text':
      return `🔒 ${plainWords(shown.text)}`;
    case 'hello':
      return `🔒 ${t('Encryption is on')}`;
    case 'invite-in':
      return t('They want ErevosGram encryption');
    case 'invite-out':
      return t('Invitation to ErevosGram encryption sent');
    case 'unreadable':
      return `🔒 ${t('Encrypted message')}`;
  }
}

/** The line a message shows: `shown` is what telegramShown says of it (null for an ordinary one). */
export function telegramLine(m: TgMessage, shown: Shown | null = unopened(m)): string {
  if (shown) return sealedLine(shown);
  // Its words as a line says them: no marks, what is hidden hidden (lib/text-style.ts).
  const words = plainWords(m.text);
  const caption = words ? `: ${words}` : '';
  switch (m.kind) {
    case 'text':
      return words;
    case 'photo':
      return `${t('Photo')}${caption}`;
    case 'video':
    case 'animation':
      return `${t('Video')}${caption}`;
    case 'voice':
      return `${t('Voice message')}${caption}`;
    case 'video-note':
      return t('Video message');
    case 'audio':
      return m.fileName ? t('File: {name}', { name: m.fileName }) : `${t('Audio')}${caption}`;
    case 'document':
      return t('File: {name}', { name: m.fileName || t('File') });
    case 'sticker':
      return m.text || t('Sticker');
    case 'call':
      return t('Call');
    case 'poll':
      return `📊 ${m.poll?.question || m.text || t('Poll')}`;
    case 'location':
      return `📍 ${m.text || t('Location')}`;
    case 'contact':
      return `👤 ${m.contact?.name || m.contact?.phone || t('Contact card')}`;
    case 'service':
      return t('Chat update');
    default:
      return t('Message');
  }
}

/**
 * What a chat's header says of a Telegram user: online, the exact time they were last on, or only
 * roughly when they hide it; a bot is a bot. Empty when Telegram says nothing (a deleted account).
 * `now` in milliseconds; Telegram's times are seconds.
 */
export function telegramStatusLine(user: Pick<TgUser, 'bot' | 'deleted' | 'status'> | undefined, now = Date.now()): string {
  if (!user || user.deleted) return '';
  if (user.bot) return t('bot');
  return statusLine(user.status, now);
}

export function statusLine(status: TgStatus | undefined, now = Date.now()): string {
  switch (status?.kind) {
    case 'online':
      // Online until a time that has passed: they went without saying so, as Telegram counts it.
      return status.until * 1000 > now ? t('Online') : lastSeenText(status.until * 1000, now);
    case 'offline':
      return status.was ? lastSeenText(status.was * 1000, now) : t('last seen a long time ago');
    case 'recently':
      return t('last seen recently');
    case 'week':
      return t('last seen within a week');
    case 'month':
      return t('last seen within a month');
    default:
      return t('last seen a long time ago');
  }
}
