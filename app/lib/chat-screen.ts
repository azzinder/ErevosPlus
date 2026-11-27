// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// What the chat screen (app/chat.tsx) and the lines of its thread (components/chat-thread-lines.tsx)
// share: a message as the screen holds it, what stands under it, and the screen's set times.

import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { CALL_LINE } from './calls';
import { type VoiceRef } from '../lock/voice-clips';
import { type FileRef } from '../lock/attachment-files';
import { laterLabel } from './later';
import { type ContactInfo } from './e2e';
import { WAITING, type Mark, type Parts } from '../lock/history';
import { type HeldAt } from './relay';
import { t, plural, mark } from './i18n';

// `tag` names a message with a contact on both phones (lock/history.ts).
// `until`: when it disappears, milliseconds, or 0. `lasts`: seconds it lasts once read, while it
// waits for that. `mark`: as lock/history.ts keeps it.
// `at`: when it was sent or came, milliseconds. `voice`: where a voice message's sound is.
// `file`: where a photo or file is, or where to take it from. `held`: ours sent for later, the
// relay that holds it till `at`. `quiet`: ours that waits, to go without sound. `sending`: ours
// shown the moment Send is pressed, on screen only, until what went or waits shows instead. Its
// Parts: what else it is or carries (lock/history.ts), such as the message it answers and the
// reactions to it.
export type Message = {
  id: number;
  peer: string;
  text: string;
  mine: boolean;
  tag: string;
  until: number;
  lasts: number;
  mark: Mark;
  at: number;
  voice?: VoiceRef;
  file?: FileRef;
  held?: HeldAt;
  heldFor?: string;
  quiet?: boolean;
  sending?: boolean;
} & Parts;

export const MARKS = ['✓', '✓✓', '✓✓✓'];

// What a phone still has to tell a contact's: which of their messages came, and were read.
export type Receipts = Record<string, { got: string[]; read: string[] }>;

// A call's line in the chat is this phone's own note, so it has no marks.
export const isCallLine = (text: string) => text.startsWith(CALL_LINE);

// How often the chat looks at the relay, milliseconds: more often during a call, so it sets up quickly.
export const LOOK_EVERY = 3000;
export const LOOK_IN_CALL = 700;
// With no relay, how often what waits for Nostr is tried, while the app shows and while it does not.
export const NOSTR_LOOK = 5000;
export const NOSTR_LOOK_AWAY = 60_000;

// How long a note under the messages stays, milliseconds.
export const NOTE_SHOWN = 8000;

// How often an open chat asks a contact whether their phone is open, milliseconds.
export const ASK_EVERY = 60 * 1000;

// How often, at most, typing is said to a contact, and how long it shows after the last word of it.
export const TYPING_EVERY = 4000;
export const TYPING_SHOWS = 6000;

// Messages opened from the relay in one look at it, at most: a minute's voice message comes in one.
export const RECEIVE_BATCH = 50;
// A ticket kept for our link is used while it has more than this left (milliseconds).
export const TICKET_KEPT = 7 * 24 * 3600 * 1000;

// How the LoRa radio is, in a word (lib/lora.ts).
export const LORA_SHOWN = { off: mark('Off'), connecting: mark('Linking'), starting: mark('Linking'), up: mark('Linked'), down: mark('Not linked') } as const;

// Contacts are named by their identity key, after this prefix.
export const CONTACT_PREFIX = 'contact:';

export function contactName(peer: string, contacts: ContactInfo[]): string | null {
  const identity = peer.slice(CONTACT_PREFIX.length);
  return contacts.find((contact) => contact.identity === identity)?.name || null;
}

export function label(peer: string, contacts: ContactInfo[]): string {
  if (!peer.startsWith(CONTACT_PREFIX)) return peer;
  return contactName(peer, contacts) ?? t('contact {id}', { id: peer.slice(CONTACT_PREFIX.length, CONTACT_PREFIX.length + 8) });
}

// The first line only: Android's errors carry their whole stack after it.
export const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0];

export const NO_CORE = mark('This build cannot encrypt, so chats through the server are off. Rebuild the app.');

// The times a chat's messages can disappear after, seconds. 0 keeps them.
export const TIMERS = [0, 5 * 60, 3600, 24 * 3600, 7 * 24 * 3600];

export const pad = (n: number) => String(n).padStart(2, '0');

// When a disappearing message goes: the time today, or the date too.
export function disappearsAt(until: number): string {
  const d = new Date(until);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return d.toDateString() === new Date().toDateString()
    ? t('at {time}', { time })
    : t('on {date} {time}', { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time });
}

// A message of ours sent for later, whose time has not come: it waits with that time, here or, held
// by a relay, there.
export const scheduled = (message: Message) => message.mine && (message.mark === WAITING || !!message.held) && message.at > Date.now();

// How long a voice message is: 0:07.
// Under a message to or from a contact: its mark if it is ours, and when it disappears.
export function caption(message: Message): string {
  const parts: string[] = message.starred ? ['★'] : [];
  if (message.sending) parts.push(t('Sending…'));
  else if (scheduled(message) && message.safety) parts.push(t('Safety message · goes {when} unless you open Erevos', { when: laterLabel(message.at) }));
  else if (scheduled(message)) parts.push(t('Scheduled · {when}', { when: laterLabel(message.at) }));
  else if (message.mine && message.tag && !isCallLine(message.text)) parts.push(message.mark === WAITING ? t('Waiting') : MARKS[message.mark]);
  if (message.until) parts.push(t('Disappears {when}', { when: disappearsAt(message.until) }));
  else if (message.lasts) parts.push(t('Disappears {time} after it is read', { time: timerLabel(message.lasts) }));
  return parts.join('  ·  ');
}

export function timerLabel(seconds: number): string {
  const units: [number, (count: number) => string][] = [
    [7 * 24 * 3600, (count) => plural(count, '{n} week', '{n} weeks')],
    [24 * 3600, (count) => plural(count, '{n} day', '{n} days')],
    [3600, (count) => plural(count, '{n} hour', '{n} hours')],
    [60, (count) => plural(count, '{n} minute', '{n} minutes')],
    [1, (count) => plural(count, '{n} second', '{n} seconds')],
  ];
  if (seconds <= 0) return t('Off');
  const [size, unit] = units.find(([size]) => seconds % size === 0) ?? units[units.length - 1];
  return unit(seconds / size);
}

// Imported messages shown at first, and added each time earlier ones are asked for.
export const IMPORTED_PAGE = 50;
// The latest lines of a chat's thread drawn at first, and how many more each time earlier ones are
// asked for or gone to: a long thread opens without drawing all of it.
export const THREAD_PAGE = 100;
// Of the photos laid out near what shows of the thread, at most this many are read to show them,
// besides its latest (components/attachment.tsx shownOf).
export const NEAR_PHOTOS = Platform.OS === 'web' ? 60 : 10;
// How long typing in a relay field pauses before the chat takes what was typed and asks that relay.
export const TYPING_PAUSE = 1200;

/**
 * A relay field: what it shows at once, and what the chat takes once typing pauses or the field is
 * left, so a relay is not asked at every letter of its address. A value set elsewhere shows as it is.
 */
export function useTyped(value: string, take: (typed: string) => void): { shown: string; type: (text: string) => void; done: () => void } {
  const [shown, setShown] = useState(value);
  const typing = useRef(false);
  useEffect(() => {
    if (!typing.current) setShown(value);
  }, [value]);
  const done = () => {
    if (!typing.current) return;
    typing.current = false;
    take(shown);
  };
  useEffect(() => {
    if (!typing.current) return;
    const timer = setTimeout(done, TYPING_PAUSE);
    return () => clearTimeout(timer);
  }, [shown]);
  return {
    shown,
    type: (text) => {
      typing.current = true;
      setShown(text);
    },
    done,
  };
}
