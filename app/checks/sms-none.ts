// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The SMS module (modules/erevos-sms) for checks under Node: a phone without SMS, which on a
// linked device shows the phone's as lib/sms-mirror.ts gives them, as the module does.
type Mirror = {
  threads(limit: number): Promise<unknown[]>;
  messages(address: string, limit: number): Promise<unknown[]>;
  markRead(address: string): Promise<void>;
  send(address: string, text: string): Promise<number>;
  cards(numbers: string[]): Record<string, { name: string; photo: string }>;
};
let mirror: Mirror | null = null;
const listeners = new Map<string, Set<(event: unknown) => void>>();
export const setSmsMirror = (next: Mirror | null): void => {
  mirror = next;
};
export const smsMirrored = () => mirror !== null;
export const smsMirrorEvent = (name: string, event: unknown): void => {
  for (const listener of [...(listeners.get(name) ?? [])]) listener(event);
};
export const takeSmsInvites = async (): Promise<{ from: string; data: string; at: number }[]> => [];
export const smsStatus = () => (mirror ? { sdk: 0, phone: false, isDefault: true, slots: 0 } : null);
export const smsThreads = async (limit = 200) => (mirror ? mirror.threads(limit) : []);
export const smsMessages = async (address: string, limit = 300) => (mirror ? mirror.messages(address, limit) : []);
export const markSmsRead = async (address: string): Promise<void> => mirror?.markRead(address);
export const contactCards = async (numbers: string[]) => (mirror ? mirror.cards(numbers) : {});
export const blockedNumbers = async (): Promise<string[]> => [];
export const smsReady = () => mirror !== null;
export const sendSms = async (address?: string, text?: string): Promise<number> => {
  if (mirror && address !== undefined && text !== undefined) return mirror.send(address, text);
  throw new Error('This app was built without SMS.');
};
export const laterSmsHolder = () => null;
export const onSmsEvent = (name: string, listener: (event: unknown) => void) => {
  const set = listeners.get(name) ?? new Set();
  listeners.set(name, set);
  set.add(listener);
  return { remove: () => set.delete(listener) };
};
export const smsSpamFilter = (_on: boolean): void => undefined;
export const smsToolsReady = () => false;
export const deleteSmsMessages = async (_ids: string[]): Promise<number> => 0;
export const exportPhoneSms = async (): Promise<Uint8Array | null> => null;
export type SmsPacketPart = { n: number; from: string; data: string; at: number };
export const smsPacketsReady = () => false;
export const sendSmsPacket = async (): Promise<boolean> => {
  throw new Error('This app was built without SMS.');
};
export const smsPacketParts = async (): Promise<SmsPacketPart[]> => [];
export const forgetSmsPacketParts = async (_ns: number[]): Promise<void> => undefined;
export const canSmsOwnNotices = () => false;
export const smsOwnNotices = (_muted: { number: string; until: number }[], _sounds: string[]): boolean => false;
export const smsNoticeDetails = (_on: boolean): void => undefined;
