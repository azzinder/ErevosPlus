// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { TextPart } from './links';

// Telegram's own links in a Telegram chat (components/telegram-bubble.tsx): an @name is tappable
// as its t.me address, and a t.me, telegram.me or tg: link opens inside Erevos's Telegram
// (lib/telegram-store.ts telegramLinkTarget), a chat, a message or an invitation, not the browser.

// An @name as Telegram allows one: 4 to 32 letters, digits and _, not inside a word or an address.
const MENTION = /(^|[^\w@/.])@([A-Za-z][A-Za-z0-9_]{3,31})\b/g;

/** The words' @names made tappable as their t.me addresses; web addresses already found stay as they are. */
export function withMentions(parts: TextPart[]): TextPart[] {
  const out: TextPart[] = [];
  for (const part of parts) {
    if (part.url) {
      out.push(part);
      continue;
    }
    let last = 0;
    for (const match of part.text.matchAll(MENTION)) {
      const at = (match.index ?? 0) + match[1].length;
      if (at > last) out.push({ text: part.text.slice(last, at) });
      out.push({ text: `@${match[2]}`, url: `https://t.me/${match[2]}` });
      last = at + match[2].length + 1;
    }
    if (last < part.text.length) out.push({ text: part.text.slice(last) });
  }
  return out;
}

/** Whether a link is Telegram's own: one that Erevos's Telegram opens itself. */
export function isTelegramLink(url: string): boolean {
  return /^tg:/i.test(url) || /^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me|telegram\.dog)\/[^\s]/i.test(url);
}
