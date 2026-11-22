// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { decryptBytes, deriveKey, DecryptError, encryptBytes, randomBytes, utf8Decode, utf8Encode } from './crypto';
import { b64d, b64e, MAX_SEEN, type SealChat, type SealData } from './telegram-seal';

// The ErevosGram app's encryption keys, carried into Erevos's ErevosGram build, so the chats
// encrypted there go on encrypted here, with the same keys, and the other side notices nothing.
//
// The ErevosGram app writes them (Settings → Encryption → Move to Erevos) as one line of text, and
// shows a code once, on its own screen: the file and the code travel apart. The line:
//
//   EGX1: + base64url(salt 16 | nonce 12 | AES-256-GCM(key, JSON))
//   key  = PBKDF2-HMAC-SHA256(code, salt, 200000 rounds, 32 bytes)
//   code = 20 letters and digits of Crockford's base32 (100 random bits), shown in fives: the code
//          is read without its dashes and spaces, in capitals, with O as 0 and I and L as 1
//   JSON = {"v":1,"account":base64url,"seen":[…],"chats":{"<chat id>":{state, conv, peer, …}}}
//
// The JSON is what the ErevosGram app keeps (e2e/E2E.kt), in its own words; Erevos keeps the same
// (lib/telegram-seal.ts). Once moved, the ErevosGram app should not be used for those chats any
// more: two phones with one ratchet would each spend the same keys.

export const EXPORT = 'EGX1:';
export const EXPORT_ROUNDS = 200_000;
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** The code as written, read as the ErevosGram app made it; '' when it cannot be one. */
export function exportCode(typed: string): string {
  const code = typed
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
  return code.length === 20 && [...code].every((c) => CROCKFORD.includes(c)) ? code : '';
}

/** Why the keys could not be taken in. */
export class ExportError extends Error {
  readonly why: 'not-export' | 'code' | 'wrong-code' | 'version' | 'broken';
  constructor(why: ExportError['why']) {
    super(why);
    this.why = why;
  }
}

/** Opens what the ErevosGram app wrote, with its code; throws ExportError. */
export async function openExport(text: string, typedCode: string): Promise<SealData> {
  const line = text.trim();
  if (!line.startsWith(EXPORT)) throw new ExportError('not-export');
  const code = exportCode(typedCode);
  if (!code) throw new ExportError('code');
  let joined: Uint8Array;
  try {
    joined = b64d(line.slice(EXPORT.length));
  } catch {
    throw new ExportError('not-export');
  }
  if (joined.length < 16 + 12 + 16) throw new ExportError('not-export');
  const key = await deriveKey(code, joined.slice(0, 16), EXPORT_ROUNDS);
  let plain: Uint8Array;
  try {
    plain = decryptBytes(key, joined.subarray(16));
  } catch (error) {
    if (error instanceof DecryptError) throw new ExportError('wrong-code');
    throw error;
  } finally {
    key.fill(0);
  }
  let o: Record<string, unknown>;
  try {
    o = JSON.parse(utf8Decode(plain)) as Record<string, unknown>;
  } catch {
    throw new ExportError('broken');
  } finally {
    plain.fill(0);
  }
  if (o.v !== 1) throw new ExportError('version');
  return readExport(o);
}

const STATES = new Set(['NONE', 'INVITED', 'INVITE_IN', 'ACTIVE']);

// Only what the encryption knows is kept, each value of its own kind.
function readExport(o: Record<string, unknown>): SealData {
  if (typeof o.account !== 'string' || !o.account) throw new ExportError('broken');
  const seen = Array.isArray(o.seen) ? o.seen.filter((s): s is string => typeof s === 'string').slice(-MAX_SEEN) : [];
  const chats: Record<string, SealChat> = {};
  for (const [id, raw] of Object.entries((o.chats ?? {}) as Record<string, unknown>)) {
    if (!/^-?\d{1,20}$/.test(id) || !raw || typeof raw !== 'object') continue;
    const c = raw as Record<string, unknown>;
    if (typeof c.state !== 'string' || !STATES.has(c.state)) continue;
    const chat: SealChat = { state: c.state as SealChat['state'] };
    for (const name of ['conv', 'peer', 'bundle_in'] as const) if (typeof c[name] === 'string') chat[name] = c[name] as string;
    for (const name of ['mine', 'verified', 'changed'] as const) if (typeof c[name] === 'boolean') chat[name] = c[name] as boolean;
    if (Array.isArray(c.invites)) chat.invites = c.invites.filter((n): n is number => Number.isSafeInteger(n));
    if (c.msgs && typeof c.msgs === 'object') chat.msgs = c.msgs as SealChat['msgs'];
    chats[id] = chat;
  }
  return { account: o.account, seen, chats };
}

/** Writes keys as the ErevosGram app does, with a new code (the checks, and an Erevos that moves them on). */
export async function writeExport(data: SealData): Promise<{ text: string; code: string }> {
  const code = [...randomBytes(20)].map((b) => CROCKFORD[b & 31]).join('');
  const salt = randomBytes(16);
  const key = await deriveKey(code, salt, EXPORT_ROUNDS);
  try {
    const sealed = encryptBytes(key, utf8Encode(JSON.stringify({ v: 1, account: data.account, seen: data.seen, chats: data.chats })));
    const joined = new Uint8Array(16 + sealed.length);
    joined.set(salt);
    joined.set(sealed, 16);
    return { text: EXPORT + b64e(joined), code: code.match(/.{5}/g)!.join('-') };
  } finally {
    key.fill(0);
  }
}
