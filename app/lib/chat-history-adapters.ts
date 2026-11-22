// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { SmsMessage, SmsPart } from '../modules/erevos-sms';
import type { HistoryFile, HistoryMessage } from './chat-history';
import { t } from './i18n';
import type { MatrixMessage } from './matrix';
import { placeOfGeo, pollShown } from './matrix-parts';
import type { NostrDmMessage } from './nostr-dm';
import { smsLineId } from './sms-chat';
import { partKind } from './sms-parts';
import type { XmppMessage } from './xmpp';
import { isSound, shownType } from './xmpp-files';

// The messages of a chat on Matrix, XMPP, Nostr or SMS as lib/chat-history.ts looks through them,
// one small adapter for each, from what the phone keeps of the chat: Matrix's timeline
// (lib/matrix.ts), XMPP's and Nostr's kept messages (lib/xmpp.ts, lib/nostr-dm.ts), and the
// phone's own SMS and MMS (modules/erevos-sms).

/** A file of a given type (image/png…), by what it is. */
function kindOfType(type: string): HistoryFile['kind'] {
  if (type.startsWith('image/')) return 'photo';
  if (type.startsWith('video/')) return 'video';
  return type.startsWith('audio/') ? 'sound' : 'file';
}

const KINDS = { image: 'photo', video: 'video', audio: 'sound', file: 'file' } as const;

/**
 * A Matrix room's messages, as the screen shows them (its thread, or a thread's own): `me` is our
 * Matrix ID, `nameOf` a member's name by theirs; in a group, each says who wrote it.
 */
export function matrixHistory(messages: MatrixMessage[], me: string, nameOf: (who: string) => string, group: boolean): HistoryMessage[] {
  return messages.map((m) => {
    const mine = m.sender === me;
    const shown = m.poll ? pollShown(m.poll) : null;
    const file = m.file;
    return {
      id: m.id,
      at: m.ts,
      mine,
      ...(group && !mine ? { by: nameOf(m.sender) } : {}),
      text: m.text,
      ...(file
        ? {
            files: [
              {
                kind: KINDS[file.kind],
                // A sticker with no words of its own is named so by Matrix.
                name: m.sticker && file.name === 'Sticker' ? '' : file.name,
                ...(file.size !== undefined ? { size: file.size } : {}),
                ...(file.voice ? { voice: true as const } : {}),
                ...(file.kind === 'audio' && file.duration !== undefined ? { ms: file.duration } : {}),
              },
            ],
          }
        : {}),
      ...(m.sticker ? { sticker: true as const } : {}),
      ...(m.place ? { place: m.place } : {}),
      ...(shown ? { poll: { q: shown.poll.q, o: shown.poll.o, voted: shown.votes.map((vote) => ({ chose: vote.chose, name: vote.who === me ? t('You') : nameOf(vote.who) })) } } : {}),
      ...(m.replyTo ? { replyTo: m.replyTo } : {}),
      ...(m.edited ? { edited: true as const } : {}),
      ...(m.deleted ? { deleted: true as const } : {}),
      ...(m.locked ? { locked: true as const } : {}),
      ...(m.call ? { call: true as const } : {}),
      reactions: Object.entries(m.reactions ?? {}).flatMap(([emoji, who]) => who.map((one) => ({ emoji, name: one === me ? t('You') : nameOf(one) }))),
      ...(m.preview ? { preview: { url: m.preview.url, title: m.preview.title } } : {}),
    };
  });
}

/**
 * An XMPP chat's messages: `me` is the account's address, `nameOf` a person's name by theirs; in a
 * group, each says who wrote it, and a reaction there may name only its writer's nick (`/nick`).
 * A sound is a voice message, as the chat shows it; words that are only a geo: link are a place.
 */
export function xmppHistory(messages: XmppMessage[], me: string, nameOf: (address: string) => string, group: boolean): HistoryMessage[] {
  const whoReacted = (who: string) => (who === me ? t('You') : who.startsWith('/') ? who.slice(1) : nameOf(who));
  return messages.map((m) => {
    const file = m.file;
    const place = !file && /^geo:\S+$/i.test(m.text.trim()) ? placeOfGeo(m.text.trim()) : null;
    const sound = file ? isSound(file) : false;
    return {
      id: m.id,
      at: m.at,
      mine: m.mine,
      ...(group && !m.mine && m.by ? { by: m.by } : {}),
      text: file || place ? '' : m.text,
      ...(file
        ? {
            files: [
              {
                kind: sound ? 'sound' : kindOfType(shownType(file)),
                name: file.name,
                ...(file.size !== undefined ? { size: file.size } : {}),
                ...(sound ? { voice: true as const } : {}),
                ...(sound && file.duration !== undefined ? { ms: file.duration } : {}),
              },
            ],
          }
        : {}),
      ...(place ? { place } : {}),
      ...(m.replyTo ? { replyTo: m.replyTo } : {}),
      ...(m.edited ? { edited: true as const } : {}),
      ...(m.forwarded ? { forwarded: true as const } : {}),
      ...(m.deleted ? { deleted: true as const } : {}),
      ...(m.locked ? { locked: true as const } : {}),
      ...(m.call ? { call: true as const } : {}),
      reactions: Object.entries(m.reacted ?? {}).flatMap(([who, emojis]) => emojis.map((emoji) => ({ emoji, name: whoReacted(who) }))),
      ...(m.preview ? { preview: { url: m.preview.url, title: m.preview.title } } : {}),
    };
  });
}

/**
 * A Nostr chat's messages: `nameOf` names someone by their key (ourselves as You); in a group,
 * each says who wrote it. A file Erevos cannot open is named as a file.
 */
export function nostrHistory(messages: NostrDmMessage[], nameOf: (key: string) => string, group: boolean): HistoryMessage[] {
  return messages.map((m) => {
    const file = typeof m.file === 'object' ? m.file : null;
    const kind = file ? kindOfType(file.type) : 'file';
    const voice = !!file && kind === 'sound' && !!file.duration;
    return {
      id: m.id,
      at: m.at,
      mine: m.mine,
      ...(group && !m.mine && m.from ? { by: nameOf(m.from) } : {}),
      text: m.file ? '' : m.text,
      ...(m.file
        ? {
            files: [
              {
                kind,
                name: file?.name ?? '',
                ...(file?.size !== undefined ? { size: file.size } : {}),
                ...(voice ? { voice: true as const, ms: file!.duration } : {}),
              },
            ],
          }
        : {}),
      ...(m.replyTo ? { replyTo: m.replyTo } : {}),
      reactions: Object.entries(m.reactions ?? {}).map(([key, emoji]) => ({ emoji, name: nameOf(key) })),
    };
  });
}

/** How many of a conversation's latest SMS its screen draws at first, as modules/erevos-sms reads them. */
export const SMS_DRAWN = 300;
/** The most of a conversation's SMS the search, the media, the calendar and the export read. */
export const SMS_KEPT = 10000;
/** How many more than needed the screen draws, to show an older one with some before it. */
export const SMS_BEFORE = 20;

// An MMS's part as a file: on the phone, at its address.
function smsFile(part: SmsPart): HistoryFile {
  const kind = partKind(part.type);
  if (kind === 'picture') return { kind: 'photo', name: '', uri: part.uri };
  if (kind === 'video') return { kind: 'video', name: '', uri: part.uri };
  if (kind === 'voice') return { kind: 'sound', name: '', voice: true, uri: part.uri };
  if (kind === 'card') return { kind: 'file', name: '', card: true, uri: part.uri };
  return { kind: 'file', name: '', uri: part.uri };
}

/** An SMS conversation's SMS and MMS: in a group's, `whose` names who wrote one by their number. */
export function smsHistory(messages: SmsMessage[], whose?: (from: string) => string): HistoryMessage[] {
  return messages.map((m) => {
    const files = [...(m.pictures ?? []), ...(m.videos ?? []), ...(m.voices ?? []), ...(m.cards ?? [])].map(smsFile);
    return {
      id: smsLineId(m),
      at: m.at,
      mine: m.mine,
      ...(whose && !m.mine && m.from ? { by: whose(m.from) } : {}),
      text: m.text,
      ...(files.length ? { files } : {}),
    };
  });
}
