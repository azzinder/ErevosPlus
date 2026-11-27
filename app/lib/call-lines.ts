// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { mark, t } from './i18n';

// A call's line in a chat (lib/calls.ts, lib/group-calls.ts) is kept in English, as it was
// written, and shown in the app's language: here. So is the line a Matrix or XMPP chat keeps when
// someone's device is new, or comes with another key (lib/matrix.ts, lib/xmpp.ts): what goes in
// the chat is encrypted to their devices, so the person should know when those change. And so are
// the lines a chat keeps when the contact came onto this phone's relay with the invite it sent them
// by itself, and when that place was taken back (app/chat.tsx invitesCame): only this phone's,
// never sent.

const PREFIX = '📞 ';

const KINDS: string[] = [mark('Voice call'), mark('Video call'), mark('Group call'), mark('Group video call')];
const MISSED: Record<string, string> = {
  'voice call': mark('Missed voice call'),
  'video call': mark('Missed video call'),
  'group call': mark('Missed group call'),
  'group video call': mark('Missed group video call'),
};
const ENDINGS: string[] = [
  mark('turned down'),
  mark('could not connect'),
  // A call straight between the two phones, with no call relay (lib/direct.ts).
  mark('could not connect directly'),
  mark('they were in another call'),
  mark('not answered'),
  mark('answered on another device'),
];

const KEY_PREFIX = '🔑 ';
const KEY_LINES = {
  new: mark('New device of {who}: your messages go to it too.'),
  changed: mark('A device of {who} changed its key: your messages do not go to it.'),
};
const INVITE_PREFIX = '🎫 ';
const INVITE_LINES = {
  came: mark('{who} came onto your server with your invite.'),
  back: mark('You took back the place {who} had on your server.'),
};
// Each as written in English, `who` taken out of it again.
const written = (lines: Record<string, string>) =>
  Object.values(lines).map((line) => ({ line, english: new RegExp(`^${line.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace('{who}', '(.+)')}$`) }));
const WITH_WHO = [
  { prefix: KEY_PREFIX, written: written(KEY_LINES) },
  { prefix: INVITE_PREFIX, written: written(INVITE_LINES) },
];
const CAME = written({ came: INVITE_LINES.came })[0].english;

/** The line kept in a chat when a device of `who` is new, or changed its key, in English as the
 *  chat keeps it. */
export function deviceLine(kind: keyof typeof KEY_LINES, who: string): string {
  return KEY_PREFIX + KEY_LINES[kind].replace('{who}', who);
}

/** The line kept in a contact's chat when they came onto this phone's relay with its invite
 *  (`came`), or when this phone took that place back (`back`), in English as the chat keeps it. */
export function inviteLine(kind: keyof typeof INVITE_LINES, who: string): string {
  return INVITE_PREFIX + INVITE_LINES[kind].replace('{who}', () => who);
}

/** Whether a kept text is the line that a contact came in with this phone's invite: Take back
 *  shows under it while they are there (lib/relay-offer.ts holdsPlace). */
export function isInviteCame(text: string): boolean {
  return text.startsWith(INVITE_PREFIX) && CAME.test(text.slice(INVITE_PREFIX.length));
}

/** `text` of a message in the app's language, if it is a call's line, a device's or an invite's; as it is otherwise. */
export function shownLine(text: string): string {
  for (const { prefix, written: lines } of WITH_WHO) {
    if (!text.startsWith(prefix)) continue;
    const line = text.slice(prefix.length);
    for (const { line: shown, english } of lines) {
      const found = english.exec(line);
      if (found) return prefix + t(shown, { who: found[1] });
    }
    return text;
  }
  if (!text.startsWith(PREFIX)) return text;
  const line = text.slice(PREFIX.length);
  // Missed while in another call, or as calls were off (INVISIBLE, lib/modes.ts CALLS_OFF_LINE).
  const missed = /^Missed (.+?)(, while in another call|, in INVISIBLE)?$/.exec(line);
  if (missed && MISSED[missed[1]]) {
    const shown = t(MISSED[missed[1]]);
    if (!missed[2]) return PREFIX + shown;
    return PREFIX + (missed[2] === ', in INVISIBLE' ? t('{missed}, in INVISIBLE', { missed: shown }) : t('{missed}, while in another call', { missed: shown }));
  }
  const comma = line.indexOf(', ');
  const kind = comma < 0 ? '' : line.slice(0, comma);
  if (!KINDS.includes(kind)) return text;
  const rest = line.slice(comma + 2);
  // The rest is the call's length, or why it did not happen.
  return `${PREFIX}${t(kind)}, ${ENDINGS.includes(rest) ? t(rest) : rest}`;
}
