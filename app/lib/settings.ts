// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { EDITION } from './edition';
import { mark } from './i18n';
import { makerContact } from './maker';
import type { Module } from './modules';

// The Settings screens (app/settings/): every setting of Erevos in groups, as the phone's own
// settings are. A group lists its settings; a setting opens its screen, or the list of its parts,
// each of which opens on the screen alone (`?part=`). The words are English, shown with t().
// What shows depends on where Erevos runs (`SettingsPlace`), as the menu's rows did before.

/** Where Erevos runs, as the Settings screens need to know it. */
export type SettingsPlace = {
  /** Not a phone: the web app, the desktop app or Sailfish's. */
  web: boolean;
  /** The web app in a browser (lib/integrity.ts): its signed release, and Web Push. */
  webApp: boolean;
  /** Web Push works here (lib/web-push.ts). */
  push: boolean;
  /** Receiving and ringing in the background (lib/background.ts), or on a computer with the window closed (lib/desktop.ts). */
  background: boolean;
  /** Permissions to check (lib/permissions.ts): a phone, and the web app. */
  checks: boolean;
  /** The phone offers a choice of launcher icons (modules/erevos-icons). */
  launcher: boolean;
  /** The phone has Erevos's widget (modules/erevos-widget). */
  widget: boolean;
  /** The phone has two SIMs. */
  sims: boolean;
  /** The modules on (lib/modules.ts): a setting of one that is off does not show. Every one, when not told. */
  modules?: ReadonlySet<Module>;
};

export type SettingsIcon = 'gear' | 'globe' | 'contrast' | 'bell' | 'lock' | 'signal' | 'phone' | 'stack' | 'stopwatch';

/** A setting that opens a screen, or the language list (`language`). */
export type SettingsLeaf = {
  id: string;
  title: string;
  detail: string;
  href?: string;
  language?: true;
  when?: (place: SettingsPlace) => boolean;
};

/** A setting with parts of its own, each opening alone. */
export type SettingsBranch = Omit<SettingsLeaf, 'href' | 'language'> & { parts: SettingsLeaf[] };

export type SettingsItem = SettingsLeaf | SettingsBranch;

export type SettingsGroup = { id: string; title: string; icon: SettingsIcon; items: SettingsItem[]; when?: (place: SettingsPlace) => boolean };

const phone = (place: SettingsPlace) => !place.web;
// While the module, or one of them, is on.
const uses =
  (...modules: Module[]) =>
  (place: SettingsPlace) =>
    !place.modules || modules.some((m) => place.modules?.has(m));
const phoneUses =
  (...modules: Module[]) =>
  (place: SettingsPlace) =>
    phone(place) && uses(...modules)(place);

export const SETTINGS: SettingsGroup[] = [
  {
    id: 'general',
    title: mark('General'),
    icon: 'gear',
    items: [
      // Its detail is the language chosen, by its own name.
      { id: 'language', title: mark('Language'), detail: '', language: true },
      // Which parts of Erevos are on (lib/modules.ts): the plain Erevos names only the ones it has (lib/edition.ts).
      {
        id: 'modules',
        title: mark('Modules'),
        detail: EDITION === 'erevos' ? mark('Erevos, Phone, SMS and the Collection: the ones you use') : mark('Erevos, Phone, SMS, Nostr, Matrix, XMPP and the Collection: the ones you use'),
        href: '/modules',
        // Erevos Lite has Erevos's own chats alone: nothing to choose.
        when: () => EDITION !== 'lite',
      },
      { id: 'updates', title: mark('Updates'), detail: mark('This version, and Check for updates'), href: '/updates' },
      { id: 'give-app', title: mark('Give Erevos to a phone nearby'), detail: mark('Over Wi-Fi or a hotspot, with no internet'), href: '/give-app', when: phone },
      // What each version changed, by its number (lib/whats-new.ts).
      { id: 'whats-new', title: mark("What's new"), detail: mark('What each version changed'), href: '/whats-new' },
      // The guide's first section, its end: who makes Erevos, where, for whom, why and who pays.
      { id: 'about', title: mark('About Erevos'), detail: mark('Who makes it, for whom and why'), href: '/guide/about' },
      // The guide's Licence: AGPL-3.0-or-later, its additional terms, no warranty, and who made Erevos (AUTHORS.md).
      { id: 'licence', title: mark('Licence'), detail: mark('Free software, its terms, and who made it'), href: '/guide/licence' },
      // The maker as a contact, from the link that comes with the app (lib/maker.ts); none while there is no link.
      { id: 'contact-maker', title: mark('Contact'), detail: mark('Write to the maker of Erevos, in Erevos'), href: '/contact-maker', when: () => makerContact() !== null },
      // The ways to give to Erevos for its running costs (lib/donate.ts).
      { id: 'donate', title: mark('Support Erevos'), detail: mark('Liberapay, PayPal, Monero or Bitcoin'), href: '/donate' },
      {
        id: 'permissions',
        title: mark('Permissions'),
        detail: mark('What Android lets Erevos do, for calls to ring while it is closed'),
        href: '/permissions',
        when: (place) => place.checks && !place.web,
      },
      {
        id: 'browser-permissions',
        title: mark('Permissions'),
        detail: mark('What the browser lets Erevos do: notifications, the microphone, keeping its data'),
        href: '/permissions',
        when: (place) => place.checks && place.web,
      },
    ],
  },
  {
    id: 'look',
    title: mark('Appearance'),
    icon: 'contrast',
    items: [
      { id: 'style', title: mark('Style and colours'), detail: mark('Look, glass, style, theme, colours and letters'), href: '/appearance?part=style' },
      { id: 'wallpaper', title: mark('Wallpaper'), detail: mark('What lies behind the chats and the screens'), href: '/appearance?part=wallpaper' },
      { id: 'bubbles', title: mark('Messages'), detail: mark('The shape of the message bubbles and the size of their text'), href: '/appearance?part=messages' },
      { id: 'icons', title: mark('Launcher icons'), detail: mark("The colours of Erevos's icons on the home screen"), href: '/appearance?part=icons', when: (place) => place.launcher },
      { id: 'widget', title: mark('Widget'), detail: mark("The widget's buttons and their order"), href: '/appearance?part=widget', when: (place) => place.widget },
      // A short buzz for keys, Send and Enter (lib/haptics.ts).
      { id: 'touch', title: mark('Vibrate on touch'), detail: mark('A short buzz for keys, Send and Enter'), href: '/appearance?part=touch', when: phone },
    ],
  },
  {
    id: 'notices',
    title: mark('Notifications'),
    icon: 'bell',
    items: [
      {
        id: 'background',
        title: mark('In the background'),
        detail: mark('Receiving and ringing while Erevos is closed, and the notice for messages'),
        href: '/security?part=background',
        when: (place) => place.background,
      },
      {
        id: 'push',
        title: mark('Notifications while closed'),
        detail: mark('In this space, with no message and no sender in them'),
        href: '/security?part=push',
        when: (place) => place.push,
      },
      // The web app's, with Web Push, and the phone's, with its messages notice (lib/icon-number.ts).
      {
        id: 'icon-number',
        title: mark('Number on the icon'),
        detail: mark("How many messages are not read, on Erevos's icon"),
        href: '/security?part=icon',
        when: (place) => place.push || (place.background && !place.web),
      },
    ],
  },
  {
    id: 'privacy',
    title: mark('Privacy and security'),
    icon: 'lock',
    items: [
      // The three modes at the top of Settings (lib/modes.ts), in the list too, so that the search finds them.
      {
        id: 'direct',
        title: mark('How visible are you?'),
        detail: mark('SPEED, ANONYMOUS or INVISIBLE: who sees your internet address, and how calls go'),
        href: '/direct',
        when: uses('erevos', 'phone', 'collection'),
      },
      // The name the space's contacts and private groups see in place of a code (lib/my-name.ts).
      { id: 'my-name', title: mark('My name'), detail: mark('The name your contacts see in place of a code'), href: '/security?part=myname', when: uses('erevos') },
      // A fingerprint or face unlocks Erevos only on Android (modules/erevos-biometric), so the web,
      // computer and Sailfish apps do not offer it.
      { id: 'lock', title: mark('Lock and second password'), detail: mark('Password, fingerprint or face, second password'), href: '/security?part=lock', when: phone },
      { id: 'lock-web', title: mark('Lock and second password'), detail: mark('Password and second password'), href: '/security?part=lock', when: (place) => !phone(place) },
      { id: 'hidden', title: mark('Hidden chats'), detail: mark('Chats that open only with their own PIN'), href: '/security?part=hidden', when: uses('erevos') },
      { id: 'last-seen', title: mark('Last seen'), detail: mark('Who sees when you last had Erevos open: off in a new space, until you turn it on'), href: '/security?part=lastseen', when: uses('erevos') },
      { id: 'forget-me', title: mark('Delete me from everywhere'), detail: mark('Delete what the servers keep for this space, and stop it'), href: '/forget-me', when: uses('erevos', 'nostr', 'matrix', 'xmpp') },
      { id: 'panic', title: mark('Panic button'), detail: mark('Wipe Erevos at once, from here, a panic app or a panic password'), href: '/panic' },
      { id: 'calculator', title: mark('Calculator in place of Erevos'), detail: mark("Hide Erevos's icon behind a calculator that works"), href: '/appearance?part=icons', when: (place) => place.launcher },
      { id: 'screenshots', title: mark('Screenshots'), detail: mark('Let screenshots and screen recordings of Erevos, or keep them out'), href: '/security?part=screen', when: phone },
      { id: 'web-app', title: mark('This web app'), detail: mark('The signed release it runs, and its updates'), href: '/security?part=web', when: (place) => place.webApp },
    ],
  },
  {
    id: 'ways',
    title: mark('Server and networks'),
    icon: 'signal',
    items: [
      // Every way out at a glance, how each is now, and what of the space's own waits to go (app/ways.tsx).
      { id: 'ways-now', title: mark('Ways'), detail: mark('How your messages go out now, and what waits'), href: '/ways', when: uses('erevos') },
      { id: 'relay', title: mark('Server'), detail: mark('Your server: its address, its token and invites'), href: '/chat?setup=relay', when: uses('erevos') },
      { id: 'home-relay', title: mark('Home server'), detail: mark('A second server contacts write to while yours is down'), href: '/home-relay', when: uses('erevos') },
      { id: 'tor', title: mark('Tor'), detail: mark('Reach the servers through Tor: off, unless changed'), href: '/tor', when: phoneUses('erevos', 'nostr') },
      // Also where there is no Tor: Nostr is reached straight there (lib/nostr.ts).
      { id: 'nostr', title: mark('Nostr'), detail: mark('Texts through public Nostr servers: on, unless changed'), href: '/nostr', when: uses('erevos') },
      { id: 'matrix', title: mark('Matrix'), detail: mark('Chats with people on Matrix: encrypted, not anonymous'), href: '/matrix', when: uses('matrix') },
      { id: 'xmpp', title: mark('XMPP'), detail: mark('Chats with people on XMPP: encrypted, not anonymous'), href: '/xmpp', when: uses('xmpp') },
      { id: 'telegram', title: mark('Telegram'), detail: mark('Chats with people on Telegram: Telegram can read them, unless both use ErevosGram encryption'), href: '/telegram', when: uses('telegram') },
      { id: 'messenger', title: mark('Messenger'), detail: mark('Chats with people on Facebook Messenger: Meta can read those not end-to-end encrypted'), href: '/messenger', when: uses('messenger') },
      { id: 'signal', title: mark('Signal'), detail: mark('Chats with people on Signal: end-to-end encrypted, with your phone number'), href: '/signal', when: uses('signal') },
      { id: 'session', title: mark('Session'), detail: mark('Chats with people on Session: end-to-end encrypted, no phone number'), href: '/session', when: uses('session') },
      { id: 'nostr-chats', title: mark('Nostr chats'), detail: mark('Chats with people on other Nostr apps: encrypted, not anonymous'), href: '/nostr-chats', when: uses('nostr') },
      { id: 'lora', title: mark('LoRa radio'), detail: mark('Text over a Meshtastic radio, kilometres away, without internet'), href: '/lora', when: phoneUses('erevos') },
    ],
  },
  {
    id: 'phone',
    title: mark('Phone and SMS'),
    icon: 'phone',
    when: phoneUses('phone', 'sms'),
    items: [
      { id: 'phone', title: mark('Phone'), detail: mark('The phone app, blocking calls and quick replies'), href: '/phone-settings', when: uses('phone') },
      {
        id: 'sms',
        title: mark('SMS'),
        detail: mark('Erevos as the SMS app, one list for all messages'),
        when: uses('sms'),
        parts: [
          { id: 'app', title: mark('Erevos as the SMS app'), detail: mark('Making it the SMS app, and what Android allows it'), href: '/sms-settings?part=app' },
          { id: 'find', title: mark('Find Erevos on a number'), detail: mark('A hidden invite with the first SMS to a number'), href: '/sms-settings?part=find' },
          { id: 'last', title: mark('SMS when nothing else works'), detail: mark('Texts to Erevos contacts by SMS, encrypted: off unless turned on'), href: '/sms-settings?part=last' },
          { id: 'names', title: mark('Names from your contacts'), detail: mark('Names and pictures in place of numbers'), href: '/sms-settings?part=names' },
          { id: 'devices', title: mark('On my linked devices too'), detail: mark('Your SMS on your computer, answered through this phone'), href: '/sms-settings?part=devices' },
          { id: 'folders', title: mark('Archived, Spam and Trash'), detail: mark("This space's own folders of SMS conversations"), href: '/sms-settings?part=folders' },
          { id: 'spam', title: mark('Spam filter'), detail: mark('Its rules, your words, senders, numbers from abroad'), href: '/sms-settings?part=spam' },
          { id: 'blocked', title: mark('Blocked numbers'), detail: mark("Android's own list, for SMS and calls"), href: '/sms-settings?part=blocked' },
          { id: 'undo', title: mark('Taking an SMS back'), detail: mark('How long an SMS waits before it goes'), href: '/sms-settings?part=undo' },
          { id: 'mms', title: mark('MMS'), detail: mark('Fetched at once, and while roaming'), href: '/sms-settings?part=mms' },
          { id: 'sims', title: mark('Two SIMs'), detail: mark('Which SIM answers a number'), href: '/sms-settings?part=sims', when: (place) => place.sims },
          { id: 'new', title: mark('New SMS'), detail: mark('To a number, or to several for a group MMS'), href: '/sms-settings?part=new' },
        ],
      },
    ],
  },
  {
    id: 'data',
    title: mark('Data and devices'),
    icon: 'stack',
    items: [
      { id: 'backups', title: mark('Backups'), detail: mark('Make one, automatic backups, restore'), href: '/backup' },
      { id: 'backup-pieces', title: mark('Backup pieces'), detail: mark('Your backup password in pieces with friends, and the pieces you keep for them'), href: '/backup-pieces' },
      // Whether the Collection goes into the backups (lib/modules.ts, lock/collection-data.ts).
      { id: 'collection', title: mark('Collection'), detail: mark('Whether your photos and files go into the backups'), href: '/collection-settings', when: phoneUses('collection') },
      { id: 'devices', title: mark('Linked devices'), detail: mark('This account on a computer or in a browser too'), href: '/devices', when: uses('erevos') },
      { id: 'imported', title: mark('Imported chats'), detail: mark('Telegram, WhatsApp and Viber exports'), href: '/imported', when: uses('erevos') },
    ],
  },
  {
    id: 'tests',
    title: mark('For testing'),
    icon: 'stopwatch',
    items: [
      { id: 'relay-test', title: mark('Server test'), detail: mark('For testing a server'), href: '/relay', when: uses('erevos') },
      { id: 'radio-test', title: mark('Radio test'), detail: mark('For testing the nearby link'), href: '/radio', when: phoneUses('erevos') },
    ],
  },
];

export const hasParts = (item: SettingsItem): item is SettingsBranch => 'parts' in item;

const shows = (place: SettingsPlace) => (entry: { when?: (place: SettingsPlace) => boolean }) => !entry.when || entry.when(place);

/** A branch's parts that show here. */
export const partsHere = (item: SettingsBranch, place: SettingsPlace): SettingsLeaf[] => item.parts.filter(shows(place));

/** A group's settings that show here: a branch shows while one of its parts does. */
export const itemsHere = (group: SettingsGroup, place: SettingsPlace): SettingsItem[] =>
  group.items.filter(shows(place)).filter((item) => !hasParts(item) || partsHere(item, place).length > 0);

/** The groups that show here: those with a setting that does. */
export const groupsHere = (place: SettingsPlace): SettingsGroup[] =>
  SETTINGS.filter(shows(place)).filter((group) => itemsHere(group, place).length > 0);

export const findGroup = (id: string | undefined): SettingsGroup | undefined => SETTINGS.find((group) => group.id === id);

export const findItem = (group: SettingsGroup | undefined, id: string | undefined): SettingsItem | undefined => group?.items.find((item) => item.id === id);

/** Whether the three modes (lib/modes.ts) show here: they stand at the top of Settings while a module they are of is on. */
export const directHere = (place: SettingsPlace): boolean => {
  const group = findGroup('privacy');
  return !!group && itemsHere(group, place).some((item) => item.id === 'direct');
};

/** A setting found by a search: the setting, and the titles of where it is, shown before it. */
export type SettingsHit = { leaf: SettingsLeaf; path: string[] };

/** The words, without accents, in small letters, with Greek's final sigma as any other. */
const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ς/g, 'σ');

/** The words of a text, plain: split at anything that is no letter or digit. */
const wordsOf = (text: string) => plain(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

/**
 * The settings that show here where each word of `query` starts a word of their title, detail or
 * place, as `say` (t, in the app) shows them: a branch is found by its parts, each with the branch
 * in its path.
 */
export function searchSettings(query: string, place: SettingsPlace, say: (english: string) => string): SettingsHit[] {
  const words = wordsOf(query);
  if (words.length === 0) return [];
  const hits: SettingsHit[] = [];
  const offer = (leaf: SettingsLeaf, path: string[]) => {
    const text = wordsOf([...path, say(leaf.title), leaf.detail ? say(leaf.detail) : ''].join(' '));
    if (words.every((word) => text.some((found) => found.startsWith(word)))) hits.push({ leaf, path });
  };
  for (const group of groupsHere(place)) {
    for (const item of itemsHere(group, place)) {
      if (hasParts(item)) {
        for (const part of partsHere(item, place)) offer(part, [say(group.title), say(item.title)]);
      } else {
        offer(item, [say(group.title)]);
      }
    }
  }
  return hits;
}
