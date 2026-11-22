// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The phone module (modules/erevos-phone) for checks under Node: it keeps the quick replies and the
// blocking rules set, and has the phone's contact groups, call history and blocked numbers, in
// memory.
export type ContactGroup = { id: string; title: string; account: string; count: number };

/** A call in the call history, with the fields CallsBackup.kt reads and adds. */
export type MemoryCall = { number: string; date: number; duration: number; type: number; [field: string]: unknown };

/** What the module keeps; `allowed`: whether Erevos may read the contacts; `callLog`: the call
 *  history; `listed`: the blocked numbers, as the phone app or the SMS app may read them;
 *  `restored`: the JSON each restoreCallLog was given. */
export const phone = {
  replies: [] as string[],
  rules: '',
  groups: [] as ContactGroup[],
  allowed: true,
  calls: [] as MemoryCall[],
  blocked: [] as string[],
  callLog: true,
  listed: true,
  restored: [] as string[],
};

/** The module as the phone starts. */
export function clearPhone(): void {
  phone.replies = [];
  phone.rules = '';
  phone.groups = [];
  phone.allowed = true;
  phone.calls = [];
  phone.blocked = [];
  phone.callLog = true;
  phone.listed = true;
  phone.restored = [];
}

export const phoneReady = (): boolean => true;
export const quickReplies = (): { replies: string[]; own: boolean } => (phone.replies.length ? { replies: [...phone.replies], own: true } : { replies: ['The usual one'], own: false });
export const setQuickReplies = (replies: string[]): void => {
  phone.replies = [...replies];
};
export const blockingRules = (): string => phone.rules;
export const setBlockingRules = (json: string): void => {
  phone.rules = json;
};
export const phoneGroups = async (): Promise<{ allowed: boolean; groups: ContactGroup[] }> => (phone.allowed ? { allowed: true, groups: phone.groups } : { allowed: false, groups: [] });

export const callsBackupReady = (): boolean => true;
// The newest first, as Android gives them.
export const backupCallLog = async (): Promise<string | null> =>
  JSON.stringify(phone.callLog ? { allowed: true, calls: [...phone.calls].sort((a, b) => b.date - a.date), ...(phone.listed ? { blocked: phone.blocked } : {}) } : { allowed: false });
export const restoreCallLog = async (json: string): Promise<{ calls: number; blocked: number }> => {
  phone.restored.push(json);
  const given = JSON.parse(json) as { calls: MemoryCall[]; blocked: string[] };
  phone.calls.push(...given.calls);
  const blocked = given.blocked.filter((number) => !phone.blocked.includes(number));
  phone.blocked.push(...blocked);
  return { calls: given.calls.length, blocked: blocked.length };
};

// The spam list's keeping (lib/spam-list.ts): the text last kept.
export const spamKept: { text: string; source: string }[] = [];
// How the spam list stands, as Spam.kt says it: a check sets it, and a list kept dates it now.
export const spamNow = { count: 0, source: '', at: 0, own: 0, warn: true, silence: false, auto: false };
export const spamState = () => ({ ...spamNow });
export const setSpamAuto = (auto: boolean) => {
  spamNow.auto = auto;
};
export const setSpamList = async (text: string, source: string): Promise<number> => {
  spamKept.push({ text, source });
  Object.assign(spamNow, { source, at: Date.now() });
  return text.split('\n').filter(Boolean).length;
};
