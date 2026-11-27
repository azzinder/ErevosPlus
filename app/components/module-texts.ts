// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { t } from '../lib/i18n';
import type { Module } from '../lib/modules';
import { editionName } from '../lib/edition';

// What each module is called and what it does (lib/modules.ts), as the first start's setup
// (components/setup.tsx), Settings → General → Modules (app/modules.tsx) and a screen of one that
// is off (app/_layout.tsx) say it.

/** The module's name. */
export function moduleName(module: Module): string {
  switch (module) {
    case 'erevos':
      return editionName();
    case 'phone':
      return t('Phone');
    case 'sms':
      return t('SMS');
    case 'nostr':
      return 'Nostr';
    case 'matrix':
      return 'Matrix';
    case 'xmpp':
      return 'XMPP';
    case 'telegram':
      return 'Telegram';
    case 'messenger':
      return 'Messenger';
    case 'signal':
      return 'Signal';
    case 'session':
      return 'Session';
    case 'collection':
      return t('Collection');
  }
}

/** The modules' names, in a line. */
export function moduleNames(modules: readonly Module[]): string {
  return modules.map(moduleName).join(', ');
}

/** What the module does, in a sentence or two. */
export function moduleAbout(module: Module): string {
  switch (module) {
    case 'erevos':
      return t("Erevos's own chats, groups and calls, end-to-end encrypted, through the server, Nostr, phones nearby or LoRa. No account and no phone number. Hidden chats are part of it.");
    case 'phone':
      return t('Erevos as the phone app: the keypad, the calls and the favourites, and every call on its own screen.');
    case 'sms':
      return t('Erevos as the SMS app: the SMS in the same list as the chats.');
    case 'nostr':
      return t('Chats with other Nostr apps, and the public posts of those you follow.');
    case 'matrix':
      return t('Chats in Matrix rooms, with Element and the other Matrix apps.');
    case 'xmpp':
      return t('Chats with XMPP apps, such as Conversations.');
    case 'telegram':
      return t('Your Telegram chats, through Telegram. Telegram can read them, unless both of you use ErevosGram encryption. Not made by Telegram.');
    case 'messenger':
      return t('Your Facebook Messenger chats, spoken by Erevos itself with Meta\'s servers, with no server in between. Meta can read those that are not end-to-end encrypted. Not made by Meta.');
    case 'signal':
      return t('Your Signal chats: a new account with your phone number, or this phone linked to the Signal of another one. Not made by Signal.');
    case 'session':
      return t('Your Session chats: no phone number, only an account of 13 recovery words, through the onion routing of Session\'s nodes. Not made by Session.');
    case 'collection':
      return t('An encrypted place in every space and hidden place for photos, files and folders.');
  }
}

/** What stops while the module is off, said before it is turned off. */
export function moduleOffNote(module: Module): string {
  switch (module) {
    case 'erevos':
      return t("Erevos's own chats, groups and calls stop on this phone: your contacts' messages and calls do not come while it is off, and your hidden chats do not open. Nothing is deleted.");
    case 'phone':
      return t('The Phone and its icon go. Nothing is deleted.');
    case 'sms':
      return t('The SMS leave the list, and their icon goes. Nothing is deleted.');
    case 'collection':
      return t('The Collection and its icon go. Nothing is deleted: your photos and files are there again when you turn it on.');
    case 'nostr':
    case 'matrix':
    case 'xmpp':
    case 'telegram':
    case 'messenger':
    case 'signal':
    case 'session':
      return t('Its chats leave the list, and their messages do not come while it is off. Nothing is deleted: the account and the chats are there again when you turn it on.');
  }
}
