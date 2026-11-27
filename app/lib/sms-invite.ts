// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// SMS invites: how two Erevos phones find each other from a phone number alone, without a server
// that knows numbers. The first time Erevos sends a plain SMS to a number it knows no contact for,
// it also sends an invite: a data SMS to a port (INVITE_PORT in the SMS module), which messaging
// apps do not show, so a phone without Erevos shows nothing. A phone with Erevos answers through
// the relay: its contact link, sealed to the invite's key, into the queue the invite names. The
// inviting phone then adds the contact and links the number to it; the invited phone accepts that
// contact's first message without a request, and links the number too.
//
// An invite is the inviting chat's relay sender id, a fresh public key for the answer, and its
// relay and that relay's key, cut into pieces of at most PIECE bytes (one data SMS each):
//   piece: 'E', VERSION, id (4 bytes), index, count, then up to PIECE - HEAD bytes of the body
//   body:  sender id (24), answer key (32), flags (1: bit 0 = relay key follows), relay key (32),
//          relay address (UTF-8, the rest)
// The carrier sees that the two numbers exchanged a short data SMS, as it sees any SMS.

import { fromHex, toHex, utf8Decode, utf8Encode } from './crypto';
import { fromBase64Url, toBase64Url } from './e2e';
import { t } from './i18n';

const MAGIC = 0x45;
const VERSION = 1;
const HEAD = 8;
/** A data SMS carries 140 bytes; the port header takes 7 of them. */
export const PIECE = 133;
const MAX_PIECES = 3;

export type SmsInvite = {
  /** The inviting chat's relay sender id, hex: where the answer goes. */
  sender: string;
  /** The public key the answer is sealed to. */
  key: Uint8Array;
  /** The inviting chat's relay, and that relay's key (base64url, or empty). */
  relay: string;
  relayKey: string;
};

/** The pieces of an invite, one data SMS each. `id` tells this invite's pieces from another's. */
export function invitePieces(invite: SmsInvite, id: Uint8Array): Uint8Array[] {
  const relay = utf8Encode(invite.relay);
  const relayKey = invite.relayKey ? fromBase64Url(invite.relayKey) : new Uint8Array(0);
  const body = new Uint8Array(24 + 32 + 1 + relayKey.length + relay.length);
  body.set(fromHex(invite.sender), 0);
  body.set(invite.key, 24);
  body[56] = relayKey.length ? 1 : 0;
  body.set(relayKey, 57);
  body.set(relay, 57 + relayKey.length);
  const room = PIECE - HEAD;
  const count = Math.ceil(body.length / room);
  if (count > MAX_PIECES) throw new Error(t('The server address is too long for an SMS invite.'));
  return Array.from({ length: count }, (_, index) => {
    const part = body.subarray(index * room, (index + 1) * room);
    const piece = new Uint8Array(HEAD + part.length);
    piece.set([MAGIC, VERSION, ...id.subarray(0, 4), index, count]);
    piece.set(part, HEAD);
    return piece;
  });
}

function decodeBody(body: Uint8Array): SmsInvite | null {
  if (body.length < 57) return null;
  const hasKey = body[56] === 1;
  if (body[56] > 1 || (hasKey && body.length < 89)) return null;
  const relay = utf8Decode(body.subarray(hasKey ? 89 : 57));
  if (relay && !/^wss?:\/\/[^\s/?#]+(\/[^\s]*)?$/i.test(relay)) return null;
  return {
    sender: toHex(body.subarray(0, 24)),
    key: body.slice(24, 56),
    relay,
    relayKey: hasKey ? toBase64Url(body.subarray(57, 89)) : '',
  };
}

export type InvitePiece = { from: string; data: Uint8Array; at: number };

/** The invites whose pieces have all come, and the pieces still waiting for the rest. */
export function collectInvites(pieces: InvitePiece[]): { invites: { from: string; invite: SmsInvite; at: number }[]; waiting: InvitePiece[] } {
  const groups = new Map<string, InvitePiece[]>();
  for (const piece of pieces) {
    const d = piece.data;
    if (d.length <= HEAD || d[0] !== MAGIC || d[1] !== VERSION || d[7] === 0 || d[7] > MAX_PIECES || d[6] >= d[7]) continue;
    const group = `${piece.from}/${toHex(d.subarray(2, 6))}`;
    groups.set(group, [...(groups.get(group) ?? []), piece]);
  }
  const invites: { from: string; invite: SmsInvite; at: number }[] = [];
  const waiting: InvitePiece[] = [];
  for (const group of groups.values()) {
    const count = group[0].data[7];
    const byIndex = new Map(group.filter((p) => p.data[7] === count).map((p) => [p.data[6], p]));
    if (byIndex.size < count) {
      waiting.push(...byIndex.values());
      continue;
    }
    const parts = [...Array(count).keys()].map((i) => byIndex.get(i)!.data.subarray(HEAD));
    const body = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    parts.reduce((at, p) => (body.set(p, at), at + p.length), 0);
    const invite = decodeBody(body);
    if (invite) invites.push({ from: group[0].from, invite, at: Math.max(...group.map((p) => p.at)) });
  }
  return { invites, waiting };
}

/** The answer to an invite, before it is sealed to the invite's key: the answering chat's link. */
export function inviteAnswer(link: string): Uint8Array {
  return utf8Encode(JSON.stringify({ v: 1, link }));
}

export function readInviteAnswer(bytes: Uint8Array): string | null {
  try {
    const value = JSON.parse(utf8Decode(bytes)) as { v?: unknown; link?: unknown };
    return value.v === 1 && typeof value.link === 'string' ? value.link : null;
  } catch {
    return null;
  }
}

/** A phone number's digits, with a leading + kept. */
export function plainNumber(number: string): string {
  const digits = number.replace(/[^\d+]/g, '');
  return digits.startsWith('+') ? `+${digits.slice(1).replace(/\+/g, '')}` : digits.replace(/\+/g, '');
}

/** Whether two numbers are the same phone: the same last ten digits, or the same digits when shorter. */
export function sameNumber(a: string, b: string): boolean {
  const da = a.replace(/\D/g, '');
  const db = b.replace(/\D/g, '');
  if (!da || !db) return false;
  if (da.length >= 10 && db.length >= 10) return da.slice(-10) === db.slice(-10);
  return da === db;
}
