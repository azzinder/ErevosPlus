// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { SmsMessage } from '../modules/erevos-sms';
import { smsLineId } from './sms-chat';

// A reaction an iPhone or Google Messages sends by SMS to a phone without iMessage or RCS, as words
// in English: Liked “See you at 8”, Reacted 😂 to “See you at 8”, Removed a like from “…”. The SMS
// screen (app/sms.tsx) shows it as its mark on the message it names, the latest before it with those
// words, and not as a message of its own; one whose message is not found stays as it came. Phones
// set to another language write them in theirs, which are not read here yet.

export type SmsReaction = { emoji: string; quoted: string; removed: boolean; picture: boolean };

const VERBS: Record<string, string> = {
  liked: '👍',
  loved: '❤️',
  'laughed at': '😂',
  emphasized: '‼️',
  emphasised: '‼️',
  questioned: '❓',
  disliked: '👎',
};
const NOUNS: Record<string, string> = {
  like: '👍',
  heart: '❤️',
  laugh: '😂',
  exclamation: '‼️',
  'question mark': '❓',
  dislike: '👎',
};

const OPEN = '[“"„«]';
const CLOSE = '[”"“»]';
const VERB = new RegExp(`^(${Object.keys(VERBS).join('|')}) (?:${OPEN}([\\s\\S]+)${CLOSE}|(an image|a photo|a picture))$`, 'i');
const REACTED = new RegExp(`^reacted (\\S+) to (?:${OPEN}([\\s\\S]+)${CLOSE}|(an image|a photo|a picture))$`, 'iu');
const REMOVED_NOUN = new RegExp(`^removed an? (${Object.keys(NOUNS).join('|')}) from (?:${OPEN}([\\s\\S]+)${CLOSE}|(an image|a photo|a picture))$`, 'i');
const REMOVED = new RegExp(`^removed (\\S+) from (?:${OPEN}([\\s\\S]+)${CLOSE}|(an image|a photo|a picture))$`, 'iu');

/** The reaction an SMS's words are, or null when they are a message. */
export function reactionOf(text: string): SmsReaction | null {
  const words = text.trim();
  if (words.length > 2000) return null;
  let found = VERB.exec(words);
  if (found) return { emoji: VERBS[found[1].toLowerCase()], quoted: found[2] ?? '', removed: false, picture: !!found[3] };
  found = REMOVED_NOUN.exec(words);
  if (found) return { emoji: NOUNS[found[1].toLowerCase()], quoted: found[2] ?? '', removed: true, picture: !!found[3] };
  found = REACTED.exec(words);
  if (found && isEmoji(found[1])) return { emoji: found[1], quoted: found[2] ?? '', removed: false, picture: !!found[3] };
  found = REMOVED.exec(words);
  if (found && isEmoji(found[1])) return { emoji: found[1], quoted: found[2] ?? '', removed: true, picture: !!found[3] };
  return null;
}

function isEmoji(text: string): boolean {
  return text.length <= 16 && /\p{Extended_Pictographic}/u.test(text);
}

// Whether a message's words are those a reaction quotes: the same, or their start when an iPhone
// cut a long one with an ellipsis.
function names(m: SmsMessage, reaction: SmsReaction): boolean {
  if (reaction.picture) return (m.pictures?.length ?? 0) > 0;
  const said = m.text.trim();
  const quoted = reaction.quoted.trim();
  if (!quoted) return false;
  if (said === quoted) return true;
  const cut = quoted.replace(/(…|\.\.\.)$/, '').trim();
  return cut.length >= 8 && cut !== quoted && said.startsWith(cut);
}

/**
 * The messages to show, without those that are reactions to one of them, and each one's marks by
 * its line (smsLineId), in the order they came.
 */
export function withReactions(messages: SmsMessage[]): { lines: SmsMessage[]; marks: Map<string, string[]> } {
  const marks = new Map<string, string[]>();
  const gone = new Set<number>();
  messages.forEach((m, i) => {
    const reaction = m.text ? reactionOf(m.text) : null;
    if (!reaction) return;
    for (let j = i - 1; j >= 0; j--) {
      const target = messages[j];
      if (gone.has(j) || !names(target, reaction)) continue;
      const id = smsLineId(target);
      const now = marks.get(id) ?? [];
      if (reaction.removed) {
        const at = now.lastIndexOf(reaction.emoji);
        if (at >= 0) now.splice(at, 1);
      } else now.push(reaction.emoji);
      marks.set(id, now);
      gone.add(i);
      return;
    }
  });
  return { lines: messages.filter((_, i) => !gone.has(i)), marks };
}
