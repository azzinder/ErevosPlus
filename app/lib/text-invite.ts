// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Invites by plain SMS, a text any phone shows, to a number of the phone's contacts with no Erevos
// yet: a short link to LPHL's web server, whose page offers Erevos (the APK on Android, the web app
// on an iPhone) and then opens the invite in it. The invite is an SMS invite's (lib/sms-invite.ts)
// with an invite to the relay (lib/relay-invite.ts), so the new phone joins the relay with access
// of its own and answers as an Erevos phone answers an SMS invite: its contact link, sealed to the
// invite's key, into the queue the invite names (lib/sms-relay.ts). The inviting phone then adds it
// and links the number to it, and the new phone takes the inviting chat's first message without a
// request, named as the invite says. The link:
//   https://erevos-web.lphl.nekten.eu/i#<base64url of the body>
//   erevos://text-invite?d=<the same>        what the page opens in the app, or pasted in it
//   body: version (1), flags (1: bit 0 = the relay's key follows, bit 1 = a relay address does),
//         expires (4, Unix seconds), sender id (24), answer key (32), invite to the relay (32),
//         [the relay's key (32)], name's length (1), name (UTF-8), [relay address (UTF-8, the rest)]
// With no relay address, the relay is LPHL's (START_RELAY). What follows # never goes to the web
// server. The phone company sees the SMS, though, so whoever opens the link first can take it: it
// lasts TEXT_INVITE_DAYS, and the inviting phone takes back the relay's invite once that is over
// while no phone used it (lib/sms-relay.ts, expireTextInvites).
// Self-contained on purpose (but for its parts), so it can run under plain Node for checks.

import { fromHex, sha256Bytes, toHex, utf8Decode, utf8Encode } from './crypto';
import { fromBase64Url, toBase64Url } from './e2e';
import { checkInvite } from './relay-invite';
import { START_RELAY } from './welcome';

/** Where the link of an invite by SMS goes: the page that offers Erevos, then opens the invite. */
export const TEXT_INVITE_PAGE = 'https://erevos-web.lphl.nekten.eu/i';
/** How long an invite by SMS lasts, days. */
export const TEXT_INVITE_DAYS = 2;

export type TextInvite = {
  /** The inviting chat's relay sender id, hex: where the answer goes. */
  sender: string;
  /** The public key the answer is sealed to. */
  key: Uint8Array;
  /** The invite to the relay, 64 hex characters. */
  code: string;
  /** The inviting chat's relay, and that relay's key (base64url, or empty). */
  relay: string;
  relayKey: string;
  /** The name the inviting phone gives itself, or ''. */
  name: string;
  /** When it is over, milliseconds; 0 for a contact card, which lasts. */
  expires: number;
  /** A contact card (My link's short QR code, contactCard in lib/sms-relay.ts): no invite to
   *  the relay (`code` is ''), never over, and whoever takes it writes a message request, as with a
   *  contact link. Flag bit 2 (4), with no `code` and the time 0 in the body. */
  card?: true;
};

const VERSION = 1;
const APP = 'erevos://text-invite?d=';
const MOST_NAME = 120;

function body(invite: TextInvite): Uint8Array {
  const relay = invite.relay === START_RELAY ? new Uint8Array(0) : utf8Encode(invite.relay);
  const relayKey = invite.relayKey ? fromBase64Url(invite.relayKey) : new Uint8Array(0);
  let letters = Array.from(invite.name.trim());
  while (utf8Encode(letters.join('')).length > MOST_NAME) letters = letters.slice(0, -1);
  const name = utf8Encode(letters.join(''));
  const code = invite.card ? new Uint8Array(0) : fromHex(invite.code);
  const out = new Uint8Array(6 + 24 + 32 + code.length + relayKey.length + 1 + name.length + relay.length);
  const view = new DataView(out.buffer);
  out[0] = VERSION;
  out[1] = (relayKey.length ? 1 : 0) | (relay.length ? 2 : 0) | (invite.card ? 4 : 0);
  view.setUint32(2, invite.card ? 0 : Math.floor(invite.expires / 1000));
  out.set(fromHex(invite.sender), 6);
  out.set(invite.key, 30);
  out.set(code, 62);
  let at = 62 + code.length;
  out.set(relayKey, at);
  at += relayKey.length;
  out[at] = name.length;
  out.set(name, at + 1);
  out.set(relay, at + 1 + name.length);
  return out;
}

/** The link that goes in the SMS. */
export function textInviteLink(invite: TextInvite): string {
  return `${TEXT_INVITE_PAGE}#${toBase64Url(body(invite))}`;
}

/** The invite in a link's data (what follows # or d=): null when it is not one. Over or not, as it says. */
export function textInviteOf(data: unknown): TextInvite | null {
  if (typeof data !== 'string' || !/^[A-Za-z0-9_-]{84,600}$/.test(data)) return null;
  let bytes: Uint8Array;
  try {
    bytes = fromBase64Url(data);
  } catch {
    return null;
  }
  if (bytes.length < 63 || bytes[0] !== VERSION || bytes[1] > 7) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const hasKey = (bytes[1] & 1) === 1;
  const card = (bytes[1] & 4) === 4;
  if (!card && bytes.length < 95) return null;
  let at = card ? 62 : 94;
  const relayKey = hasKey ? bytes.subarray(at, at + 32) : null;
  if (hasKey) at += 32;
  if (at >= bytes.length) return null;
  const length = bytes[at];
  if (length > MOST_NAME || at + 1 + length > bytes.length) return null;
  const name = utf8Decode(bytes.subarray(at + 1, at + 1 + length));
  const relay = (bytes[1] & 2) === 2 ? utf8Decode(bytes.subarray(at + 1 + length)) : START_RELAY;
  if ((bytes[1] & 2) === 0 && at + 1 + length !== bytes.length) return null;
  const code = card ? '' : toHex(bytes.subarray(62, 94));
  // A card has no invite to the relay: its address is checked as an invite's would be.
  const checked = checkInvite(relay, card ? '0'.repeat(64) : code);
  if (!checked) return null;
  return {
    sender: toHex(bytes.subarray(6, 30)),
    key: bytes.slice(30, 62),
    code,
    relay: checked.relayUrl,
    relayKey: relayKey ? toBase64Url(relayKey) : '',
    name: name.replace(/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2028\u2029\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim(),
    expires: card ? 0 : view.getUint32(2) * 1000,
    ...(card ? { card: true as const } : {}),
  };
}

/** Reads an invite by SMS from its link, as the SMS has it or as the page opens it in the app. Null if the text is not one. */
export function parseTextInvite(text: string): TextInvite | null {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  // The server answers /i with /i/, so a link copied from the address bar may read /i/#.
  for (const page of [`${TEXT_INVITE_PAGE}#`, `${TEXT_INVITE_PAGE}/#`]) {
    if (lower.startsWith(page)) return textInviteOf(clean.slice(page.length));
  }
  if (lower.startsWith(APP)) return textInviteOf(clean.slice(APP.length).split('&')[0]);
  return null;
}

/** The id the relay knows an invite by, to take it back with: the first half of its secret's SHA-256 (crates/erevos-relay/src/invites.rs). */
export function inviteId(code: string): string {
  return toHex(sha256Bytes(fromHex(code)).subarray(0, 16));
}

// Hands an invite by SMS from the screen its link opens (app/text-invite.tsx) to the chat of the
// space it was opened in, which owns the relay settings and the contacts. Kept in memory only, and
// taken by that space's chat only, so it never goes to another space.

type Listener = (invite: TextInvite) => void;

let waiting: { invite: TextInvite; space: number } | null = null;
let listener: { space: number; next: Listener } | null = null;

/** Gives an invite to the chat of `space`: now if it is open, otherwise when it next opens. */
export function offerTextInvite(invite: TextInvite, space: number): void {
  if (listener?.space === space) listener.next(invite);
  else waiting = { invite, space };
}

/** For the chat of `space`: receives offered invites until unsubscribed, starting with one that waited for it. */
export function onTextInviteOffered(space: number, next: Listener): () => void {
  const mine = { space, next };
  listener = mine;
  if (waiting) {
    const { invite, space: wanted } = waiting;
    waiting = null;
    if (wanted === space) next(invite);
  }
  return () => {
    if (listener === mine) listener = null;
  };
}

/** The space locks: an invite handed over and not taken yet goes. */
export function forgetTextInvite(): void {
  waiting = null;
}
