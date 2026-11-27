// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { t } from './i18n';

// How this phone reaches its contacts now, as New chat says it at the top (app/chat.tsx,
// components/connect-cards.tsx): everywhere through its relay, or a linked device (or hidden chats
// linked on their own) through the phone; only part of the way with a relay but no queue on it, or
// through Nostr with no relay: its messages, photos, files and voice messages, with calls too while
// Direct connections are on (lib/direct.ts), and groups never; or
// only nearby. Self-contained on purpose (but for i18n), so it can
// run under plain Node for checks.

/** How far this phone reaches its contacts: everywhere through a relay, only part of the way, or only nearby. */
export type Reach = 'ready' | 'part' | 'none';

export type Connection = {
  /** A linked device, which has the phone's contacts and link. */
  linked: boolean;
  /** The relay's address, as typed. */
  relayUrl: string;
  /** Whether this phone has its queue on that relay. */
  queue: boolean;
  /** Hidden chats, not the space's own. */
  hidden: boolean;
  /** Whether the contact link says where this phone reads on Nostr. */
  nostr: boolean;
  /** Whether this device looks for Erevos nearby (lib/radio.ts HAS_LINKS). */
  nearby: boolean;
  /** A place on the relay lent through a contact's link. */
  lent: boolean;
  /** Whether what is sent goes through a second relay first. */
  via: boolean;
  /** Whether Direct connections are on (lib/direct.ts), never in hidden chats: with no relay, calls then go straight from phone to phone. */
  direct?: boolean;
};

/** What New chat says of `c`: how far it reaches, a title, a line in plain words, and the relay's address with what goes with it. */
export function connectReach(c: Connection): { reach: Reach; title: string; line: string; detail?: string } {
  const host = c.relayUrl.trim().replace(/^wss?:\/\//i, '').replace(/\/+$/, '');
  const detail = c.linked || !host ? undefined : [host, c.lent ? t('lent by a contact') : '', c.via ? t('through a second server') : ''].filter(Boolean).join(' · ');
  if (c.linked) {
    const line = c.hidden
      ? t('These hidden chats are linked to the same hidden chats on your phone: they have their contacts, and their contact link is the phone’s.')
      : t('This device is linked to your phone: it has its contacts, and your contact link is the phone’s.');
    return { reach: 'ready', title: t('Linked to your phone'), line };
  }
  if (c.queue) {
    const line = c.hidden
      ? t('These hidden chats have a queue of their own on it, which the space knows nothing of.')
      : `${t('Everything works: texts, photos, voice messages, calls and groups, end-to-end encrypted.')}${c.nearby ? ` ${t('Contacts near you reach you with no internet too.')}` : ''}`;
    return { reach: 'ready', title: t('Through your server'), line, detail };
  }
  // In plain words (#11): New chat makes the queue by itself (app/chat.tsx), so this shows only
  // while it does, or when it could not.
  if (host) return { reach: 'part', title: t('Getting ready'), line: t('Erevos is making the place where your contacts write to you. If this stays, check the address under For advanced users.') };
  if (c.nostr) {
    return c.hidden
      ? {
          reach: 'part',
          title: t('Through Nostr, with no server'),
          line: t('Texts, stickers and reactions go through Nostr. Photos, voice messages and calls need a server: type its address under For advanced users, then create their queue.'),
        }
      : c.direct
        ? {
            reach: 'part',
            title: t('Messages and calls, for now'),
            line: t('Your contacts reach you with texts, photos, files, voice messages and calls. For groups, and for calls that connect from any network, ask someone who uses Erevos for an invite and tap I have their code.'),
          }
        : {
            reach: 'part',
            title: t('Messages only, for now'),
            line: t('Your contacts reach you with texts, photos, files and voice messages. For calls and groups, ask someone who uses Erevos for an invite and tap I have their code.'),
          };
  }
  if (c.hidden) return { reach: 'none', title: t('No server yet'), line: t('Hidden chats need a server: type its address under For advanced users, then create their queue.') };
  return { reach: 'none', title: t('Only nearby, for now'), line: t('Your contacts reach you only when near, over Wi-Fi or Bluetooth. To be reached from anywhere, ask someone who uses Erevos for an invite and tap I have their code.') };
}
