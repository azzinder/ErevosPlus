// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { blockingRules, phoneGroups, phoneReady, quickReplies, setBlockingRules, setQuickReplies, type ContactGroup } from '../modules/erevos-phone';

import { utf8Decode, utf8Encode } from './crypto';
import { cleanReplies } from './phone';
import { checkedRules, rulesFrom, rulesJson, type GroupBlock } from './phone-rules';

// The phone module's own settings in backups (lock/backup.ts), on Android: the quick replies a
// call is declined with, and the rules that block calls (lib/phone-rules.ts). The module keeps
// them itself, outside every space, as calls are screened with Erevos locked, so a backup reads
// them from there and a restore puts them back there, in place of the phone's. The backup is
// sealed, so it may name what the module keeps no names of: a blocked contact group is known on
// the phone by its id in the phone's contacts, which on another phone is another group's, so the
// backup holds each one's title and account too, and a restore keeps a group's block only where a
// group of this phone's has the same, under its id here. While Erevos may not read the contacts
// no group is known, and none stays blocked.

const VERSION = 1;

type Named = { id: string; title: string; account: string };

const noGroups = { allowed: false, groups: [] as ContactGroup[] };

/** The phone module's settings, for a backup being made; null where there is no phone module. */
export async function phoneSettingsForBackup(): Promise<Uint8Array | null> {
  if (!phoneReady()) return null;
  const { replies, own } = quickReplies();
  const rules = rulesFrom(blockingRules());
  const named: Named[] = [];
  if (rules.groups.length) {
    const { groups } = await phoneGroups().catch(() => noGroups);
    for (const block of rules.groups) {
      const group = groups.find((g) => g.id === block.id);
      if (group) named.push({ id: group.id, title: group.title, account: group.account });
    }
  }
  return utf8Encode(JSON.stringify({ v: VERSION, replies: own ? replies : [], rules, groups: named }));
}

/** Puts back the phone module's settings a backup holds, in place of the phone's. Nothing
 *  changes where there is no phone module, or nothing to put back. */
export async function putPhoneSettings(bytes: Uint8Array | null): Promise<void> {
  if (!bytes || !phoneReady()) return;
  let value: { v?: unknown; replies?: unknown; rules?: unknown; groups?: unknown };
  try {
    value = JSON.parse(utf8Decode(bytes)) as typeof value;
  } catch {
    return;
  }
  // One of a later kind, from a newer Erevos, as far as it is understood.
  if (!value || typeof value !== 'object' || typeof value.v !== 'number' || value.v < VERSION) return;
  const replies = Array.isArray(value.replies) ? value.replies.filter((reply): reply is string => typeof reply === 'string') : [];
  setQuickReplies(cleanReplies(replies));
  const rules = checkedRules(value.rules);
  const named = (Array.isArray(value.groups) ? value.groups : []) as Partial<Named>[];
  const groups: GroupBlock[] = [];
  if (rules.groups.length) {
    const here = (await phoneGroups().catch(() => noGroups)).groups;
    for (const block of rules.groups) {
      const was = named.find((n) => n?.id === block.id);
      const same = was && here.find((g) => g.title === was.title && g.account === was.account);
      if (same && !groups.some((g) => g.id === same.id)) groups.push({ id: same.id, until: block.until });
    }
  }
  setBlockingRules(rulesJson({ ...rules, groups }));
}
