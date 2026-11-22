// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { EDITION, inEdition, type Edition } from './edition';
import type { CheckId } from './permission-checks';
import { secureGet, secureSet } from './secure';
import { SHELL } from './shell';

// The parts of Erevos the owner uses (Settings → General → Modules, and the first start's setup,
// components/setup.tsx): Erevos's own end-to-end encrypted chats and calls, the phone, the SMS,
// the chats with Nostr, Matrix and XMPP apps, and the Collection of photos and files (on Android, in
// the desktop app, in a browser, the web app on an iPhone's home screen too, and on Sailfish OS). Any of them, Erevos's own too, at least one that is not the Collection alone.
// One that is off does not start (app/_layout.tsx Receiver) and shows nowhere: not on the home
// screen, in its menu, in Settings, nor its icon among the phone's apps; so Erevos is lighter,
// starts faster and uses less battery. Nothing of it is deleted: its chats, contacts and settings
// are there again when it is on again. On the device, outside every space, as the icons and the
// phone app are, and read before the password, as the Phone may open without it.

export type Module = 'erevos' | 'phone' | 'sms' | 'nostr' | 'matrix' | 'xmpp' | 'telegram' | 'messenger' | 'signal' | 'session' | 'collection';

/** Every module, in the order the setup and Settings show them. */
export const MODULES: readonly Module[] = ['erevos', 'phone', 'sms', 'nostr', 'matrix', 'xmpp', 'telegram', 'messenger', 'signal', 'session', 'collection'];

/** Messenger, Signal and Session: their engines are one module of the app (modules/erevos-messenger). */
export const MSG_MODULES = ['messenger', 'signal', 'session'] as const;

const KEY = 'erevos.modules';

// The platform Erevos runs on: React Native is asked only when it is there, so the checks, in
// plain Node, can load this file.
function platform(): string {
  try {
    return (require('react-native') as typeof import('react-native')).Platform.OS;
  } catch {
    return 'node';
  }
}

// Telegram is only in a build with TDLib, for Android (modules/erevos-telegram, docs/erevosgram.md):
// asked only when React Native is there, so the checks, in plain Node, can load this file.
function telegramBuild(): boolean {
  try {
    return (require('../modules/erevos-telegram') as typeof import('../modules/erevos-telegram')).telegramNative !== null;
  } catch {
    return false;
  }
}

// Messenger, Signal and Session are only in a build with their engines: Erevos+ for Android
// (modules/erevos-messenger). Asked only when React Native is there, as Telegram is.
function messengerBuild(): boolean {
  try {
    return (require('../modules/erevos-messenger') as typeof import('../modules/erevos-messenger')).messengerNative !== null;
  } catch {
    return false;
  }
}

/** The modules of `edition` (lib/edition.ts): every one in Erevos+, Erevos's own chats, the Phone,
 *  the SMS and the Collection in the plain Erevos. */
export function editionModules(edition: Edition = EDITION): Module[] {
  return MODULES.filter((m) => inEdition(m, edition));
}

/**
 * The modules this device can run, of this build's edition (lib/edition.ts): Telegram only in a
 * build with it (Erevos+ for Android with TDLib); the phone and the SMS only on Android; the
 * Collection on Android and in the web build: in the desktop app and on Sailfish OS (`shell`
 * 'electron' or 'sailfish') its chunks are files in the shell's own folder, in a plain browser they
 * are kept in the browser's storage (lib/web-store.ts), as much as it gives.
 */
export function modulesHere(os: string = platform(), _shell: typeof SHELL = SHELL, telegram: boolean = os === 'android' && telegramBuild(), edition: Edition = EDITION): Module[] {
  return editionModules(edition).filter((m) => {
    if (m === 'telegram') return os === 'android' && telegram;
    if (m === 'messenger' || m === 'signal' || m === 'session') return os === 'android' && messengerBuild();
    if (m === 'phone' || m === 'sms') return os === 'android';
    if (m === 'collection') return os === 'android' || os === 'web';
    return true;
  });
}

// The Collection is part of a space, not a way to chat: on its own it would leave nothing to open.
const usable = (list: Iterable<Module>) => [...list].some((m) => m !== 'collection');

// The modules there were before the Collection came (7.0.0). A choice is kept with the modules
// there were when it was made (`known`); one kept as a bare list is from before, and so could not
// name the Collection. A module newer than the choice is on, as every module is before one: a 6.x
// choice of SMS and Erevos has the Collection on after the update, until it is turned off.
const BEFORE_KNOWN: readonly Module[] = ['erevos', 'phone', 'sms', 'nostr', 'matrix', 'xmpp'];

/**
 * The modules kept as `raw` (`{"on": [...], "known": [...]}`, or a bare list from before), those
 * this device can run, with every one newer than the choice; null when nothing usable is kept, as
 * before the owner chose (every module is then on), or when none of them would be on.
 */
export function parseModules(raw: string | null, here: readonly Module[] = modulesHere()): Set<Module> | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    const kept = value && typeof value === 'object' && !Array.isArray(value) ? (value as { on?: unknown; known?: unknown }) : null;
    const list = Array.isArray(value) ? value : kept && Array.isArray(kept.on) ? kept.on : null;
    if (!list) return null;
    const known: readonly unknown[] = Array.isArray(value) ? BEFORE_KNOWN : kept && Array.isArray(kept.known) ? kept.known : MODULES;
    const chosen = new Set(here.filter((m) => list.includes(m) || !known.includes(m)));
    return usable(chosen) ? chosen : null;
  } catch {
    return null;
  }
}

// `known` is the edition's modules: one the plain Erevos does not have is not part of a choice
// made there, so it is on, as a new module is, when the same phone moves to Erevos+.
/** What is kept for `chosen`: the modules this device can run, at least one, with the modules
 *  of this edition; null when none is. */
export function keptModules(chosen: Iterable<Module>, here: readonly Module[] = modulesHere(), edition: Edition = EDITION): string | null {
  const wanted = new Set(chosen);
  const list = here.filter((m) => wanted.has(m));
  return usable(list) ? JSON.stringify({ on: list, known: editionModules(edition) }) : null;
}

// Every module is on until the owner chooses, as for everyone before modules came.
let on: Set<Module> = new Set(modulesHere());
let chosen = false;
let loaded: Promise<void> | null = null;
const changes = new Set<() => void>();
// On a linked device given the phone's SMS (lib/sms-mirror.ts): the SMS are on where this device
// has none of its own, a computer or a browser; on an Android device, as its modules say.
let mirrored = false;

const onNow = (): ReadonlySet<Module> => (mirrored && !modulesHere().includes('sms') ? new Set([...on, 'sms']) : on);

/** Whether the phone's SMS show on this linked device (set by lib/sms-mirror.ts). */
export function setSmsMirrored(next: boolean): void {
  if (next === mirrored) return;
  mirrored = next;
  changes.forEach((listener) => listener());
}

/** Reads the modules chosen, once; again with `again`. */
export function loadModules(again = false): Promise<void> {
  if (loaded && !again) return loaded;
  loaded = secureGet(KEY)
    .then((raw) => {
      const kept = parseModules(raw);
      chosen = kept !== null;
      on = kept ?? new Set(modulesHere());
    })
    .catch(() => undefined);
  return loaded;
}

/** Reads the modules chosen again, as a restored backup put them (lib/backup-settings.ts), and
 *  tells those who follow them when they changed. */
export async function reloadModules(): Promise<void> {
  const before = on;
  await loadModules(true);
  if (before.size !== on.size || [...on].some((m) => !before.has(m))) changes.forEach((listener) => listener());
}

/** Whether the owner chose the modules (the setup, or Settings), or every one is on as before. */
export function modulesChosen(): boolean {
  return chosen;
}

/** Whether `module` is on: on this device, and chosen. */
export function moduleOn(module: Module): boolean {
  return onNow().has(module);
}

/** The modules on, in their order. */
export function modulesOn(): Module[] {
  const now = onNow();
  return MODULES.filter((m) => now.has(m));
}

/** Keeps `next` as the modules on; refused (false) when none of them could be on. */
export async function setModules(next: Iterable<Module>): Promise<boolean> {
  const raw = keptModules(next);
  if (!raw) return false;
  await secureSet(KEY, raw);
  const kept = parseModules(raw) ?? new Set(modulesHere());
  const same = kept.size === on.size && [...kept].every((m) => on.has(m));
  on = kept;
  chosen = true;
  loaded = Promise.resolve();
  if (!same) changes.forEach((listener) => listener());
  return true;
}

/** Calls `listener` each time a module is turned on or off, until the function it gives is called. */
export function onModulesChange(listener: () => void): () => void {
  changes.add(listener);
  return () => {
    changes.delete(listener);
  };
}

/** The modules on, again each time one is turned on or off: for a screen that shows or hides their parts. */
export function useModules(): ReadonlySet<Module> {
  const [now, setNow] = useState<ReadonlySet<Module>>(() => new Set(onNow()));
  useEffect(() => {
    const read = () => setNow(new Set(onNow()));
    read();
    void loadModules().then(read);
    return onModulesChange(read);
  }, []);
  return now;
}

/** The modules named in `text` (a link's "a,b"), those this device can run, in their order. */
export function moduleList(text: string | undefined, here: readonly Module[] = modulesHere()): Module[] {
  const named = new Set((text ?? '').split(','));
  return here.filter((m) => named.has(m));
}

// The screens of each module but Erevos's (app/), by their route's name: one of a module that is
// off shows that it is off instead (app/_layout.tsx), as a link, the widget or a notice may still
// lead there. Contacts, Settings, the password, the backups, the guide and the starred messages
// (those of every network's chats) belong to none.
const SCREENS: Record<Module, readonly string[]> = {
  erevos: ['chat', 'group', 'myself', 'new-group', 'public-group', 'public-groups', 'join', 'c', 'i', 'link', 'welcome', 'text-invite', 'relay', 'relay-invite', 'home-relay', 'devices', 'imported', 'lora', 'radio', 'nostr', 'ways'],
  phone: ['phone', 'phone-settings'],
  sms: ['sms', 'sms-folder', 'sms-settings'],
  nostr: ['nostr-chats', 'nostr-chat', 'nostr-posts', 'public-post'],
  matrix: ['matrix', 'matrix-chat', 'matrix-sso'],
  xmpp: ['xmpp', 'xmpp-chat'],
  telegram: ['telegram', 'telegram-chat'],
  messenger: ['messenger', 'messenger-chat'],
  signal: ['signal', 'signal-chat'],
  session: ['session', 'session-chat'],
  collection: ['collection', 'collection-settings', 'collection-send'],
};

/** The module the screen `route` (its route's name) is part of; null for a screen of every module. */
export function screenModule(route: string): Module | null {
  return MODULES.find((m) => SCREENS[m].includes(route)) ?? null;
}

/** The modules that turned on from `before` to `after`: their permissions are asked for again. */
export function turnedOn(before: Iterable<Module>, after: Iterable<Module>): Module[] {
  const was = new Set(before);
  return MODULES.filter((m) => !was.has(m) && [...after].includes(m));
}

// Which modules need each of the permissions check's items (lib/permission-checks.ts), so the
// setup and the check after a new version ask only for what the modules on use. The messages'
// ones are for every module that brings messages in the background; Erevos's calls for its own.
const MESSAGES: readonly Module[] = ['erevos', 'nostr', 'matrix', 'xmpp', 'messenger', 'signal', 'session'];
const NEEDS: Record<CheckId, readonly Module[] | 'any'> = {
  notices: 'any',
  calls: ['erevos', 'matrix', 'xmpp'],
  messages: MESSAGES,
  fullScreen: ['erevos', 'phone', 'matrix', 'xmpp'],
  battery: MESSAGES,
  restricted: MESSAGES,
  unused: MESSAGES,
  data: MESSAGES,
  maker: MESSAGES,
  microphone: MESSAGES,
  messageSound: MESSAGES,
  lockScreen: 'any',
  dnd: ['erevos', 'matrix', 'xmpp'],
  ringer: ['erevos', 'matrix', 'xmpp'],
  saver: MESSAGES,
  camera: [...MESSAGES, 'collection'],
  nearby: ['erevos'],
  contacts: ['erevos', 'phone', 'sms'],
  alarms: ['erevos'],
  reminders: ['erevos'],
  home: 'any',
  push: MESSAGES,
  storage: 'any',
};

/** Whether one of the modules `of` needs what the check `id` asks for. */
export function checkWanted(id: CheckId, of: Iterable<Module>): boolean {
  const needs = NEEDS[id];
  if (needs === 'any') return true;
  const list = [...of];
  return needs.some((m) => list.includes(m));
}
