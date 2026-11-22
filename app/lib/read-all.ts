// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { History } from '../lock/history';
import { markSmsRead } from '../modules/erevos-sms';
import type { E2E } from './e2e';
import { plural, t } from './i18n';
import { iconNumberChanged } from './icon-number';
import { showsIn, type InboxRow, type InboxShow, type InboxSms } from './inbox';
import { lookNow } from './look-now';
import { matrixRead } from './matrix-store';
import type { MsgService } from './messenger';
import { msgReadChat } from './messenger-store';
import { readElsewhere } from './notice-count';
import { nostrDmRead } from './nostr-dm-store';
import { sameNumber } from './sms-invite';
import { spaceChats } from './space-chats';
import { spaceGroupsAt } from './space-groups';
import { telegramReadChat } from './telegram-store';
import { xmppRead } from './xmpp-store';

// Mark all as read: the ⋮ menu of the home screen, for the part of the list it shows (app/index.tsx),
// and the chats of app/matrix.tsx, app/xmpp.tsx and app/nostr-chats.tsx. Each chat with messages
// not read is read as its own screen reads it when it opens, so each network hears of it as it would
// then, and of nothing more:
// - An Erevos contact (the open space's only: never a hidden chat, never another space's): their
//   messages are marked read in the history the chat screen and the receiver share
//   (lib/space-chats.ts), the disappearing ones' time starts, and what was read is kept with the
//   contact (E2E.hold) for the next look at the relay to tell their phone (E2E.readDue,
//   lib/receiver.ts sendReceipts), asked for at once (lib/look-now.ts); a chat that appears offline
//   tells it with what it next writes to them, and a message request hears nothing until it is
//   accepted (app/chat.tsx receipt). On the phone, the message that tells them goes to the
//   account's linked devices too, which mark the same messages read (lib/devices.ts sealed); on a
//   linked device it goes through the phone, which marks them read and tells them, and its other
//   devices (lib/devices.ts sendOne). Their number's SMS, which their row counts, are read too.
// - A group: as its screen reads it (lib/groups.ts markRead): its members are told, or, on a
//   linked device, the phone, which tells them.
// - An SMS conversation of the list (not the Archive, Spam or Trash): read on the phone, or through
//   the phone on a linked device given its SMS (modules/erevos-sms markSmsRead, lib/sms-mirror.ts).
// - A Telegram chat (the ErevosGram build): read as Telegram's own apps mark a chat read, up to its
//   last message, its mentions and reactions too, and no more marked unread by hand
//   (lib/telegram-store.ts telegramReadChat); Telegram tells the others.
// - A Matrix room, an XMPP chat or a Nostr chat: read in its store, which sends what the network
//   sends then (Matrix's read receipt, XMPP's chat marker; NIP-17 has none). Invitations, and
//   someone asking to add the account, are no chats to read: they stay until they are answered.
// A chat locked with its PIN or muted is read too: reading shows nothing of it. One that cannot be
// read now is left as it is, and the others are read. Then the Android messages notice
// (lib/background.ts) and the number on Erevos's icon (lib/icon-number.ts) count them no more.

/** A row of a list of chats, as marking it read needs it (lib/inbox.ts InboxRow). */
export type ReadRow = Pick<InboxRow, 'identity' | 'sms' | 'unread'> & Partial<Pick<InboxRow, 'lastSms' | 'network' | 'invited'>>;

/** The rows with messages not read: an invitation, which counts as one, is no chat to read. */
export function toRead<Row extends ReadRow>(rows: readonly Row[]): Row[] {
  return rows.filter((row) => row.unread > 0 && !row.invited);
}

/** The same, of the home screen's rows in one part of its list (lib/inbox.ts showsIn): none in the public feed's. */
export function toReadIn<Row extends ReadRow>(rows: readonly Row[], show: InboxShow): Row[] {
  return toRead(rows.filter((row) => showsIn({ sms: row.sms, lastSms: !!row.lastSms, network: row.network }, show)));
}

/** What a row is the chat of, by its identity (lib/inbox.ts). */
export type ReadKind =
  | { kind: 'contact'; identity: string }
  | { kind: 'group'; id: string }
  | { kind: 'sms'; address: string }
  | { kind: 'matrix'; room: string }
  | { kind: 'xmpp'; jid: string }
  | { kind: 'nostr'; key: string }
  | { kind: 'telegram'; chat: number }
  | { kind: 'msg'; service: MsgService; key: string };

const after = (identity: string, prefix: string) => identity.slice(prefix.length);

export function kindOf(row: ReadRow): ReadKind {
  if (row.network === 'matrix') return { kind: 'matrix', room: after(row.identity, 'matrix:') };
  if (row.network === 'xmpp') return { kind: 'xmpp', jid: after(row.identity, 'xmpp:') };
  if (row.network === 'nostr') return { kind: 'nostr', key: after(row.identity, 'nostr:') };
  if (row.network === 'telegram') return { kind: 'telegram', chat: Number(after(row.identity, 'telegram:')) };
  if (row.network === 'messenger' || row.network === 'signal' || row.network === 'session') return { kind: 'msg', service: row.network, key: after(row.identity, `${row.network}:`) };
  if (row.sms) return { kind: 'sms', address: row.sms };
  if (row.identity.startsWith('group:')) return { kind: 'group', id: after(row.identity, 'group:') };
  return { kind: 'contact', identity: row.identity };
}

/** The open space's chats, as reading them needs them (lib/space-chats.ts). */
export type ReadChats = { e2e: Pick<E2E, 'contacts' | 'phones' | 'hold'>; history: Pick<History, 'mark'> };

/** How each kind of chat is read: the app's own ways, or the checks' (checks/read-all.check.ts). */
export type ReadWays = {
  chats(): Promise<ReadChats>;
  group(id: string): Promise<void>;
  sms(address: string): Promise<void>;
  matrix(room: string): Promise<void>;
  xmpp(jid: string): Promise<void>;
  nostr(key: string): Promise<void>;
  /** A Telegram chat, in the ErevosGram build. */
  telegram?(chat: number): Promise<void>;
  /** A Messenger, Signal or Session chat, in Erevos+. */
  msg?(service: MsgService, key: string): Promise<void>;
};

const APP_WAYS: ReadWays = {
  chats: spaceChats,
  group: async (id) => (await spaceGroupsAt.groups()).markRead(id, spaceGroupsAt.transport),
  sms: markSmsRead,
  // The account the screen on top acts on: a hidden place's own, on its screens (lib/network-place.ts).
  matrix: matrixRead,
  xmpp: xmppRead,
  nostr: nostrDmRead,
  telegram: telegramReadChat,
  msg: msgReadChat,
};

export type ReadAllOptions = {
  /** The SMS conversations of the list, for those of the contacts' numbers (lib/inbox.ts buildInbox). */
  sms?: readonly InboxSms[];
  /** Called once the open space's own chats and its SMS are read, before the other networks answer. */
  onOwnRead?: () => void;
  ways?: ReadWays;
  now?: number;
};

/** How many of the chats were read, and how many could not be now. */
export type ReadAllDone = { read: number; failed: number };

const CONTACT = 'contact:';

// Marks a contact's messages read as their chat does when it shows (app/chat.tsx, markMessages and
// receipt), and keeps what was read for the next look to tell them. Says whether they were marked,
// and whether they are to be told.
async function readContact(chats: ReadChats, contact: { identity: string; request: boolean }, now: number): Promise<{ read: boolean; held: boolean }> {
  let tags: string[];
  try {
    // Theirs, those that show by now (lib/later.ts): a disappearing one starts its time.
    tags = await chats.history.mark(`${CONTACT}${contact.identity}`, false, 2, now);
  } catch {
    return { read: false, held: false };
  }
  // A message request hears nothing back, not even that its message came, until accepted.
  if (tags.length === 0 || contact.request) return { read: true, held: false };
  // Kept with the contact, not in memory alone: a phone put away before the next look still says it.
  // A chat that appears offline keeps it until it next writes to them. Not kept, they are not told.
  const held = await chats.e2e.hold(contact.identity, 'read', tags).then(
    () => true,
    () => false,
  );
  return { read: true, held };
}

// Reads each one after the other; one that fails is left as it is. Returns those read.
async function each<T>(list: readonly T[], read: (item: T) => Promise<unknown>): Promise<T[]> {
  const done: T[] = [];
  for (const item of list) {
    try {
      await read(item);
      done.push(item);
    } catch {
      // Left not read; the others still are.
    }
  }
  return done;
}

/**
 * Marks read every chat of `rows` with messages not read (toRead), each as its screen reads it.
 * The kinds go side by side, so a network that answers slowly holds up no other.
 */
export async function readAll(rows: readonly ReadRow[], { sms = [], onOwnRead, ways = APP_WAYS, now = Date.now() }: ReadAllOptions = {}): Promise<ReadAllDone> {
  const kinds = toRead(rows).map(kindOf);
  const of = <K extends ReadKind['kind']>(kind: K) => kinds.filter((k): k is Extract<ReadKind, { kind: K }> => k.kind === kind);
  const contacts = of('contact').map((k) => k.identity);
  const listed = of('sms').map((k) => k.address);
  let read = 0;
  const count = (n: number) => {
    read += n;
  };

  const own = (async () => {
    const chats = contacts.length > 0 ? await ways.chats().catch(() => null) : null;
    const known = new Map((chats?.e2e.contacts() ?? []).map((c) => [c.identity, c]));
    const readHere: string[] = [];
    let held = false;
    for (const identity of contacts) {
      const contact = known.get(identity);
      // Deleted meanwhile, or the chats could not open: left as it is.
      if (!chats || !contact) continue;
      const done = await readContact(chats, contact, now);
      if (done.read) readHere.push(identity);
      held ||= done.held;
    }
    count(readHere.length);
    // Said with the next look, which does not wait at the relay first.
    if (held) lookNow();
    if (readHere.length > 0) readElsewhere(readHere.map((identity) => `chat:${identity}`));
    // The contacts' rows count the SMS of their numbers (but a group's MMS, which has its own row).
    const phones = new Map((chats?.e2e.phones() ?? []).map((p) => [p.identity, p.phone]));
    const theirs = contacts.flatMap((identity) => {
      const phone = phones.get(identity);
      return phone ? sms.filter((s) => s.unread > 0 && !/[,;]/.test(s.address) && sameNumber(s.address, phone)).map((s) => s.address) : [];
    });
    const smsRead = await each([...new Set([...listed, ...theirs])], (address) => ways.sms(address));
    count(listed.filter((address) => smsRead.includes(address)).length);
    onOwnRead?.();
  })();

  const groups = (async () => {
    const done = await each(of('group'), (k) => ways.group(k.id));
    count(done.length);
    if (done.length > 0) readElsewhere(done.map((k) => `group:${k.id}`));
  })();

  // Each store says itself which of its chats have fewer not read (lib/network-notices.ts).
  const networks = [each(of('matrix'), (k) => ways.matrix(k.room)), each(of('xmpp'), (k) => ways.xmpp(k.jid)), each(of('nostr'), (k) => ways.nostr(k.key)), each(of('telegram'), (k) => (ways.telegram ? ways.telegram(k.chat) : Promise.reject(new Error('no Telegram')))), each(of('msg'), (k) => (ways.msg ? ways.msg(k.service, k.key) : Promise.reject(new Error('no Erevos+'))))].map((done) =>
    done.then((list) => count(list.length)),
  );

  await Promise.all([own, groups, ...networks]);
  iconNumberChanged();
  return { read, failed: kinds.length - read };
}

/** Asks (as lib/alert.ts ask does, given here: it needs React Native) how many chats it is, then marks them read and calls `done`. With none to read, asks nothing. */
export function askReadAll(
  ask: (title: string, message: string, buttons: { text: string; style?: 'cancel'; onPress?: () => void }[]) => void,
  rows: readonly ReadRow[],
  options: ReadAllOptions = {},
  done?: (result: ReadAllDone) => void,
): void {
  const n = toRead(rows).length;
  if (n === 0) return;
  ask(t('Mark all as read'), plural(n, '{n} chat is marked read, as if you opened it.', '{n} chats are marked read, as if you opened each.'), [
    { text: t('Cancel'), style: 'cancel' },
    { text: t('Mark all as read'), onPress: () => void readAll(rows, options).then((result) => done?.(result), () => undefined) },
  ]);
}
