// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { useEffect, useState } from 'react';

import { setHiddenServices } from './network-notices';
import { secureGet, secureSet } from './secure';

// The order of the services on home, and those hidden from it (components/services.tsx): kept for
// the device, outside the spaces, as the modules are (lib/modules.ts). A hidden service stays on
// but tells of nothing and counts on no icon (lib/network-notices.ts), and its card, its part and its chats under All messages are left out (a
// search still finds them), until it is shown again. All messages is always first and never hidden.
// `start` is the part Erevos opens on from its launcher icon or with no link (app/index.tsx): All
// messages when none was chosen.

const KEY = 'erevos.home-services';

export type ServiceOrder = { order: string[]; hidden: string[]; start?: string };

const NONE: ServiceOrder = { order: [], hidden: [] };
let now: ServiceOrder = NONE;
let loaded: Promise<void> | null = null;
const listeners = new Set<(order: ServiceOrder) => void>();

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.length <= 64).slice(0, 64) : []);

/** What was kept, read once; anything that is not a list of names counts as nothing kept. */
export function readServiceOrder(raw: string | null): ServiceOrder {
  if (!raw) return NONE;
  try {
    const kept = JSON.parse(raw) as { order?: unknown; hidden?: unknown; start?: unknown };
    const start = typeof kept.start === 'string' && kept.start.length > 0 && kept.start.length <= 64 && kept.start !== 'all' ? kept.start : undefined;
    return { order: strings(kept.order), hidden: strings(kept.hidden).filter((key) => key !== 'all'), ...(start ? { start } : {}) };
  } catch {
    return NONE;
  }
}

function load(): Promise<void> {
  loaded ??= secureGet(KEY).then(
    (raw) => {
      now = readServiceOrder(raw);
      setHiddenServices(now.hidden);
      for (const listener of listeners) listener(now);
    },
    () => undefined,
  );
  return loaded;
}

async function keep(next: ServiceOrder): Promise<void> {
  now = next;
  setHiddenServices(now.hidden);
  for (const listener of listeners) listener(now);
  await secureSet(KEY, JSON.stringify(next)).catch(() => undefined);
}

/** Reads what was kept, so a hidden service is silent from the start (lib/background.ts). */
export function loadServiceOrder(): Promise<void> {
  return load();
}

/** The order and the hidden ones, read again whenever they change. */
export function useServiceOrder(): ServiceOrder {
  const [order, setOrder] = useState(now);
  useEffect(() => {
    listeners.add(setOrder);
    void load();
    setOrder(now);
    return () => {
      listeners.delete(setOrder);
    };
  }, []);
  return order;
}

/**
 * The services in the order chosen: All messages first, then each in its place in `order`, and
 * those never moved after them in the order they come (`keys`). `shown` leaves the hidden out.
 */
export function arrangeServices<T extends string>(keys: readonly T[], kept: ServiceOrder): { shown: T[]; hidden: T[] } {
  const rank = (key: T, at: number) => (key === 'all' ? -1 : kept.order.includes(key) ? kept.order.indexOf(key) : 1000 + at);
  const sorted = keys.map((key, at) => ({ key, at: rank(key, at) })).sort((a, b) => a.at - b.at).map((one) => one.key);
  return { shown: sorted.filter((key) => key === 'all' || !kept.hidden.includes(key)), hidden: sorted.filter((key) => key !== 'all' && kept.hidden.includes(key)) };
}

/** Moves a service one place earlier (-1) or later (1) among those shown (`shown`, as arranged). */
export function moveService(shown: readonly string[], key: string, by: -1 | 1): Promise<void> {
  const list = shown.filter((k) => k !== 'all');
  const at = list.indexOf(key);
  const to = at + by;
  if (at < 0 || to < 0 || to >= list.length) return Promise.resolve();
  [list[at], list[to]] = [list[to], list[at]];
  // The hidden keep their places among the rest, after those shown.
  const rest = now.order.filter((k) => !list.includes(k));
  return keep({ ...now, order: [...list, ...rest] });
}

export function hideService(key: string, hidden: boolean): Promise<void> {
  if (key === 'all') return Promise.resolve();
  const others = now.hidden.filter((k) => k !== key);
  // A hidden part is not opened on: All messages is, until it shows again and is chosen again.
  const start = hidden && now.start === key ? undefined : now.start;
  return keep({ order: now.order, hidden: hidden ? [...others, key] : others, ...(start ? { start } : {}) });
}

/** The part Erevos opens on (`start`): All messages ('all') when none was chosen. */
export function startPart(kept: ServiceOrder): string {
  return kept.start && !kept.hidden.includes(kept.start) ? kept.start : 'all';
}

/** Chooses the part Erevos opens on; 'all' for All messages. */
export function startOn(key: string): Promise<void> {
  const rest: ServiceOrder = { order: now.order, hidden: now.hidden };
  return keep(key === 'all' ? rest : { ...rest, start: key });
}

/** The service a chat is of, for leaving a hidden one's chats out of All messages: its network's, the
 *  SMS for an SMS conversation, and Erevos for every contact's chat and group (lib/inbox.ts rowOn). */
export function servicePart(row: { sms: string; network?: string }): string {
  return row.network ?? (row.sms !== '' ? 'sms' : 'erevos');
}

/**
 * Whether a chat shows under All messages while the services in `hidden` are hidden: not when its
 * service is, unless it is a Telegram chat in one of the account's folders chosen for home whose
 * tab still shows (`tg:` and its id), which stands as a service of its own.
 */
export function inAllMessages(row: { sms: string; network?: string; tgFolders?: number[] }, hidden: readonly string[]): boolean {
  if (!hidden.includes(servicePart(row))) return true;
  return !!row.tgFolders?.some((id) => !hidden.includes(`tg:${id}`));
}
