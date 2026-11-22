// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { AccountTor } from '../lib/account-tor';
import { checkedChatNotify, type ChatNotify } from './chat-notify';
import { sealedFile } from './sealed-file';

// What each Messenger, Signal and Session chat (Erevos+, lib/messenger-store.ts) has of its own
// here: its notifications (chat-notify.ts), muted or with a sound of its own. Their accounts are
// the phone's and show in its first space, so this is kept sealed with that space's key, in FILE
// (sealed-file.ts), and goes with the rest of the phone into a backup (backup.ts). The engines keep
// none of it, nor do the services. With it: Signal's and Messenger's Tor (lib/account-tor.ts: off
// unless turned on, components/msg-account.tsx) and their chats set «Through Tor»
// (components/msg-chat.tsx). And how Messenger is used: by Erevos's own engine, or in its case
// (`messengerWay`, the official page in a closed web view: components/msg-account.tsx).

/** Each chat by its home row (`messenger:` and its key, and so on) and its own notifications. */
export type MsgOwn = Record<string, ChatNotify>;

export const FILE = 'erevos-msg-own';
const BLOCK = 16 * 1024;
/** The chats kept with notifications of their own, at most. */
export const MAX_MSG_OWN = 300;

export function checkedMsgOwn(value: unknown): MsgOwn {
  const kept: MsgOwn = {};
  const v = (value ?? {}) as { notify?: unknown };
  const all = v.notify && typeof v.notify === 'object' ? Object.entries(v.notify as Record<string, unknown>) : [];
  for (const [where, notify] of all.slice(-MAX_MSG_OWN)) {
    if (!/^(messenger|signal|session):[^\s]{1,200}$/.test(where)) continue;
    const checked = checkedChatNotify(notify);
    if (checked) kept[where] = checked;
  }
  return kept;
}

/** The chats of each kept «Through Tor», at most. */
export const MAX_TOR_CHATS = 300;

/**
 * What is kept: each chat's own notifications; Signal's Tor (`signalTor`, 'never' until turned
 * on; a `true` kept by the switch before it is 'always'); the Signal chats set «Through Tor» by
 * their keys (`signalTorChats`), which make the whole account go only through Tor; Messenger's the same
 * (`messengerTor`, `messengerTorChats`), and Session's (`sessionTor`, `sessionTorChats`);
 * `messengerWay`: 'engine' (Erevos speaks Messenger itself, the default) or 'case' (Messenger's own
 * page in Erevos's closed web view, MessengerCaseActivity; the engine then stays off).
 */
export type MessengerWay = 'engine' | 'case';
export type MsgOwnData = { notify: MsgOwn; signalTor: AccountTor; signalTorChats: string[]; messengerTor: AccountTor; messengerTorChats: string[]; sessionTor: AccountTor; sessionTorChats: string[]; messengerWay: MessengerWay };

// As lib/account-tor.ts accountTorOf, without what that file brings with it.
const torOf = (v: unknown): AccountTor => (v === true ? 'always' : v === 'space' || v === 'always' ? v : 'never');

export function checkedMsgOwnData(value: unknown): MsgOwnData {
  const v = (value ?? {}) as { signalTor?: unknown; signalTorChats?: unknown; messengerTor?: unknown; messengerTorChats?: unknown; sessionTor?: unknown; sessionTorChats?: unknown; messengerWay?: unknown };
  const chatsOf = (list: unknown) => [...new Set((Array.isArray(list) ? list : []).filter((c): c is string => typeof c === 'string' && /^[^\s]{1,200}$/.test(c)))].slice(-MAX_TOR_CHATS);
  return { notify: checkedMsgOwn(value), signalTor: torOf(v.signalTor), signalTorChats: chatsOf(v.signalTorChats), messengerTor: torOf(v.messengerTor), messengerTorChats: chatsOf(v.messengerTorChats), sessionTor: torOf(v.sessionTor), sessionTorChats: chatsOf(v.sessionTorChats), messengerWay: v.messengerWay === 'case' ? 'case' : 'engine' };
}

const store = sealedFile({ name: FILE, empty: { notify: {}, signalTor: 'never', signalTorChats: [], messengerTor: 'never', messengerTorChats: [], sessionTor: 'never', sessionTorChats: [], messengerWay: 'engine' } as MsgOwnData, checked: checkedMsgOwnData, block: BLOCK });

/** What the first space keeps for Messenger, Signal and Session, as its key opens it. */
export async function loadMsgOwn(key: Uint8Array): Promise<MsgOwnData> {
  return store.load('space', 0, key);
}

export async function saveMsgOwn(key: Uint8Array, data: MsgOwnData): Promise<void> {
  await store.save('space', 0, key, data);
}
