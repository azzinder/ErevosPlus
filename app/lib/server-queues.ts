// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { E2EData } from '../lock/e2e-data';
import type { RingList } from '../lock/hidden-ring';
import type { WatchList } from '../lock/hidden-watch';
import type { PublicData } from '../lock/public-group-data';
import type { QueuesData } from '../lock/queues-data';
import type { SpaceData } from '../lock/space-data';
import { sameRelay } from './relay';

// Every relay queue a space, or one of its hidden places, keeps, gathered in one place for "Delete
// me from everywhere" (lib/forget-me.ts): what it deletes is this list, and what is not on it stays
// on the relays. So each kind of queue Erevos makes is here (SOURCES), and each file that makes one
// says which kinds it makes (QUEUE_MAKERS): checks/forget-me.check.ts fails when a file makes a
// queue and is not named there, or when a kind is named that this list does not gather.

/** What a queue is for, as gathered here. */
export const SOURCES = [
  // The own queue, as the settings and the last move say it, and the one a move is making.
  'own',
  'next',
  // The queue the contact link names, the groups' and the public groups' (lib/queue-move.ts).
  'link',
  'group',
  'public',
  // Those moved away from, still read for a while or let go of early, not deleted yet.
  'old',
  // The backup relays' queues (lib/spare.ts).
  'spare',
  // Each contact's own queue, the one it took the place of, those made ahead, and those no one is
  // to write to any more, not deleted yet (lib/contact-queues.ts).
  'contact',
  'contact-old',
  'ready',
  'gone',
  // On the primary, the places that fill the device list, now and before (lib/devices.ts).
  'device-filler',
  'device-filler-old',
  // The Matrix and XMPP accounts' queues for notices (lib/matrix-push.ts, lib/xmpp-push.ts).
  'matrix-push',
  'xmpp-push',
  // The doors of the public groups this phone owns (lib/public-doors.ts).
  'door',
  // The space's queue for each pocket of hidden chats, to say a message came while they are closed,
  // and to ring (lock/hidden-watch.ts, lock/hidden-ring.ts): a place's own or one made for nothing.
  'watch',
  'ring',
  // A hidden place's ring queue, as its own settings keep it (SpaceData.ringQueue).
  'place-ring',
] as const;

export type Source = (typeof SOURCES)[number];

/**
 * Each file that makes a relay queue (createQueue, borrowPlace), and the kinds it makes, by its
 * path under app/. A file whose queues are kept nowhere (a screen that tries a relay out) names none.
 */
export const QUEUE_MAKERS: Record<string, readonly Source[]> = {
  'lib/queue-move.ts': ['own', 'next', 'link', 'group', 'public', 'old', 'contact', 'contact-old', 'ready', 'gone'],
  'lib/spare.ts': ['spare'],
  'lib/devices.ts': ['device-filler', 'device-filler-old'],
  'lib/matrix-push.ts': ['matrix-push'],
  'lib/xmpp-push.ts': ['xmpp-push'],
  'lib/public-doors.ts': ['door'],
  'lock/hidden-watch.ts': ['watch'],
  'lock/hidden-ring.ts': ['ring'],
  'app/chat.tsx': ['own', 'place-ring', 'watch', 'ring'],
  'app/devices.tsx': ['own'],
  'components/quick-link.tsx': ['own'],
  'lib/open-place.ts': ['own'],
  'app/relay.tsx': [],
};

/** A queue on a relay, to delete there with the token kept for that relay. */
/** `tor`: on a home relay reached only through Tor (SpareRelay.tor), deleted so too. */
export type ServerQueue = { source: Source; url: string; token: string; recipientHex: string; tor?: boolean };

/** What a space or a hidden place keeps that names queues. Only a space has public groups, and the pockets' watch and ring queues. */
export type KeptPlace = {
  data: SpaceData;
  queues: QueuesData;
  e2e: E2EData | null;
  matrix: { push?: { url: string; recipientHex: string } } | null;
  xmpp: { push?: { url: string; recipientHex: string } } | null;
  publicGroups?: PublicData | null;
  watch?: WatchList;
  rings?: RingList;
};

const isQueueId = (hex: string) => /^[0-9a-f]{48}$/.test(hex);

/** Every queue `kept` names, each once (by relay and recipient id), with the token for its relay where one is kept. */
export function serverQueues(kept: KeptPlace): ServerQueue[] {
  const { data, queues, e2e } = kept;
  // The tokens kept for each relay, the settings' first: a queue named without one is deleted with it.
  const tokens: { url: string; token: string }[] = [];
  const know = (url: string, token: string) => {
    if (url.trim() && token.trim() && !tokens.some((k) => sameRelay(k.url, url))) tokens.push({ url: url.trim(), token: token.trim() });
  };
  know(data.url, data.token);
  for (const spare of [data.spare, ...(data.spare.more ?? [])]) know(spare.url, spare.token);
  for (const k of [queues.now, queues.link, queues.group, queues.public, ...queues.was, ...queues.early]) if (k) know(k.url, k.token);
  for (const w of [...(kept.watch ?? []), ...(kept.rings ?? [])]) if (w) know(w.url, w.token);
  const tokenAt = (url: string) => tokens.find((k) => sameRelay(k.url, url))?.token ?? '';
  // The home relays reached only through Tor: any queue there is reached so too, never straight.
  const torOnly = [data.spare, ...(data.spare.more ?? [])].filter((spare) => spare.tor === true && spare.url.trim());
  const torAt = (url: string) => torOnly.some((spare) => sameRelay(spare.url, url));

  const out: ServerQueue[] = [];
  const add = (source: Source, url: string, recipientHex: string | undefined, token?: string) => {
    if (!url.trim() || !recipientHex || !isQueueId(recipientHex)) return;
    if (out.some((q) => q.recipientHex === recipientHex && sameRelay(q.url, url))) return;
    out.push({ source, url: url.trim(), token: (token ?? '').trim() || tokenAt(url), recipientHex, ...(torAt(url) ? { tor: true } : {}) });
  };

  add('own', data.url, data.ownQueue?.recipientHex, data.token);
  if (queues.now) add('own', queues.now.url, queues.now.queue.recipientHex, queues.now.token);
  // A move under way makes its queue on the relay the space reads on.
  add('next', queues.now?.url ?? data.url, queues.next?.recipientHex);
  if (queues.link) add('link', queues.link.url, queues.link.queue.recipientHex, queues.link.token);
  if (queues.group) add('group', queues.group.url, queues.group.queue.recipientHex, queues.group.token);
  if (queues.public) add('public', queues.public.url, queues.public.queue.recipientHex, queues.public.token);
  for (const old of [...queues.was, ...queues.early]) add('old', old.url, old.queue.recipientHex, old.token);
  for (const spare of [data.spare, ...(data.spare.more ?? [])]) add('spare', spare.url, spare.queue?.recipientHex, spare.token);
  add('place-ring', data.url, data.ringQueue?.recipientHex, data.token);

  for (const contact of e2e?.contacts ?? []) {
    if (!contact.mine) continue;
    add('contact', contact.mine.u, contact.mine.r);
    if (contact.mine.was) add('contact-old', contact.mine.was.u, contact.mine.was.r);
  }
  for (const ready of e2e?.ready ?? []) add('ready', ready.u, ready.r);
  for (const gone of e2e?.gone ?? []) add('gone', gone.u, gone.r);
  const list = e2e?.list;
  for (const [id, r] of Object.entries(list?.q ?? {})) add('device-filler', list?.r?.[id]?.relay ?? data.url, r);
  for (const old of list?.qWas ?? []) add('device-filler-old', old.relay, old.q);

  if (kept.matrix?.push) add('matrix-push', kept.matrix.push.url, kept.matrix.push.recipientHex);
  if (kept.xmpp?.push) add('xmpp-push', kept.xmpp.push.url, kept.xmpp.push.recipientHex);
  for (const group of kept.publicGroups?.groups ?? []) if (group.door) add('door', group.door.relay, group.door.recipient);
  for (const w of kept.watch ?? []) if (w) add('watch', w.url, w.recipientHex, w.token);
  for (const r of kept.rings ?? []) if (r) add('ring', r.url, r.recipientHex, r.token);
  return out;
}
