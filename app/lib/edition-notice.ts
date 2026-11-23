// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { sha256Bytes, toHex, utf8Encode } from './crypto';
import { EDITION, type Edition } from './edition';
import { t } from './i18n';
import { secureGet, secureSet } from './secure';
import { loadMatrix } from '../lock/matrix-data';
import { loadNostrDm } from '../lock/nostr-dm-data';
import { loadXmpp } from '../lock/xmpp-data';

// The plain Erevos (lib/edition.ts) has no Matrix, XMPP or chats with other Nostr apps. A space
// that had an account on one of them, from a version before the editions or from Erevos+, keeps
// it on the phone, encrypted and unused, and it is there again in Erevos+. Once in each such space
// Erevos says so, the first time it opens there. Which spaces were told is kept as tags made with
// each space's key, so the entry shows neither which spaces there are nor which had accounts.

const TOLD = 'erevos.edition-told';
const MOST = 64;

function tagOf(key: Uint8Array): string {
  const label = utf8Encode('erevos edition told');
  const bytes = new Uint8Array(label.length + key.length);
  bytes.set(label);
  bytes.set(key, label.length);
  return toHex(sha256Bytes(bytes)).slice(0, 32);
}

async function told(): Promise<string[]> {
  try {
    const kept = JSON.parse((await secureGet(TOLD)) ?? '[]') as unknown;
    return Array.isArray(kept) ? kept.filter((tag): tag is string => typeof tag === 'string') : [];
  } catch {
    return [];
  }
}

/** The networks of the space opened with `key` that this edition does not have, by name. */
export async function networksKept(space: number, key: Uint8Array): Promise<string[]> {
  const kept: string[] = [];
  if (await loadMatrix(space, key).catch(() => null)) kept.push('Matrix');
  if (await loadXmpp(space, key).catch(() => null)) kept.push('XMPP');
  if (await loadNostrDm(space, key).catch(() => null)) kept.push('Nostr');
  return kept;
}

/** What to say once in this space, in the plain Erevos, of its accounts kept for Erevos+; null when nothing. */
export async function editionNote(space: number, key: Uint8Array, edition: Edition = EDITION): Promise<string | null> {
  if (edition === 'plus') return null;
  const tag = tagOf(key);
  const before = await told();
  if (before.includes(tag)) return null;
  const kept = await networksKept(space, key);
  await secureSet(TOLD, JSON.stringify([...before, tag].slice(-MOST)));
  if (kept.length === 0) return null;
  return t('Your {networks} account and chats are still on this phone, encrypted, but this Erevos does not have them: they are in Erevos+. To have them again, choose Erevos+ in Settings → General → Updates.', {
    networks: kept.join(', '),
  });
}
