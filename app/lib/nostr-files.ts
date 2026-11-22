// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { gcm } from '@noble/ciphers/aes.js';

import { fromHex, randomBytes, sha256Bytes, toHex, utf8Decode, utf8Encode, aesGcmSeal } from './crypto';
import { t } from './i18n';
import { netHttp, torChatHttp, torOnlyHttp, type Http, type HttpAnswer } from './net-http';

// Photos and files in chats with other Nostr apps (docs/nostr-chats.md), as NIP-17 sends them
// (kind 15): the file is encrypted on the phone with AES-256-GCM, by a key and nonce made for it
// alone, and put on a Blossom server (BUD-01, BUD-02), which keeps it by the SHA-256 of what it got
// and cannot read it. The key, the nonce and that hash go in the message, which is encrypted for
// its readers as any other. The upload is signed by a key made for it alone, so the server does
// not learn whose it is; it goes through Tor as the space's Tor way says, as Nostr chats do. A
// file that comes is fetched only when asked for, checked against its hash, then opened.

/** The largest file that goes: what the Blossom servers here take for free. */
export const NOSTR_FILE_MOST = 20 * 1024 * 1024;

/** Blossom servers files go to, the first that takes it, unless the space names its own. */
export const FILE_SERVERS = ['https://blossom.primal.net', 'https://blossom.band', 'https://nostr.download'];

/** A file in a message (kind 15), as it came or went. */
export type NostrDmFile = {
  /** Where its encrypted bytes are. */
  url: string;
  /** Its type before it was encrypted (image/jpeg, application/pdf…). */
  type: string;
  /** The AES-GCM key and nonce, hex. */
  key: string;
  nonce: string;
  /** The SHA-256 of the encrypted bytes, hex: checked before opening. */
  x: string;
  /** The SHA-256 of the file itself, when said. */
  ox?: string;
  size?: number;
  /** Width x height of a photo. */
  dim?: string;
  /** Its name, where the sender said it (a name tag, as some apps write). */
  name?: string;
  /** How long a voice message or other sound lasts, in milliseconds (a duration tag, in seconds). */
  duration?: number;
};

const HEX = /^[0-9a-f]+$/;
const isHex = (v: unknown, bytes?: number): v is string => typeof v === 'string' && HEX.test(v) && v.length % 2 === 0 && (bytes === undefined || v.length === bytes * 2);

/** The file a kind 15 message's tags and content say, or null when it is not one Erevos can open. */
export function fileOfRumor(tags: string[][], content: string): NostrDmFile | null {
  const tag = (name: string) => tags.find((t) => t[0] === name)?.[1];
  const url = content.trim();
  const algorithm = tag('encryption-algorithm');
  const key = tag('decryption-key')?.toLowerCase();
  const nonce = tag('decryption-nonce')?.toLowerCase();
  const x = tag('x')?.toLowerCase();
  if (!/^https:\/\/\S+$/.test(url) || url.length > 2048) return null;
  if (algorithm !== 'aes-gcm' || !isHex(key) || (key.length !== 32 && key.length !== 64) || !isHex(nonce) || nonce.length < 16 || nonce.length > 64 || !isHex(x, 32)) return null;
  const ox = tag('ox')?.toLowerCase();
  const size = Number(tag('size'));
  const dim = tag('dim');
  const name = tag('name') ?? tag('alt');
  const type = tag('file-type') ?? 'application/octet-stream';
  const duration = Number(tag('duration'));
  return {
    url,
    type: /^[\w.+-]+\/[\w.+-]+$/.test(type) ? type.toLowerCase() : 'application/octet-stream',
    key,
    nonce,
    x,
    ...(isHex(ox, 32) ? { ox } : {}),
    ...(Number.isSafeInteger(size) && size > 0 ? { size } : {}),
    ...(dim && /^\d{1,5}x\d{1,5}$/.test(dim) ? { dim } : {}),
    ...(name ? { name: name.slice(0, 200) } : {}),
    ...(Number.isFinite(duration) && duration > 0 && duration <= 24 * 3600 ? { duration: Math.round(duration * 1000) } : {}),
  };
}

/** The tags of a kind 15 message for `file`, after its `p` tags. */
export function fileTags(file: NostrDmFile): string[][] {
  return [
    ['file-type', file.type],
    ['encryption-algorithm', 'aes-gcm'],
    ['decryption-key', file.key],
    ['decryption-nonce', file.nonce],
    ['x', file.x],
    ...(file.ox ? [['ox', file.ox]] : []),
    ...(file.size ? [['size', String(file.size)]] : []),
    ...(file.dim ? [['dim', file.dim]] : []),
    ...(file.name ? [['name', file.name]] : []),
    ...(file.duration ? [['duration', String(file.duration / 1000)]] : []),
  ];
}

/** Encrypts a file for a message: the bytes to upload, and all of the file but where it went. */
export async function sealFile(bytes: Uint8Array, type: string, name?: string, dim?: string, duration?: number): Promise<{ sealed: Uint8Array; file: Omit<NostrDmFile, 'url'> }> {
  const key = randomBytes(32);
  const nonce = randomBytes(12);
  const sealed = await aesGcmSeal(key, nonce, bytes);
  return {
    sealed,
    file: {
      type,
      key: toHex(key),
      nonce: toHex(nonce),
      x: toHex(sha256Bytes(sealed)),
      ox: toHex(sha256Bytes(bytes)),
      size: bytes.length,
      ...(dim ? { dim } : {}),
      ...(name ? { name } : {}),
      ...(duration && duration > 0 ? { duration: Math.round(duration) } : {}),
    },
  };
}

/** The file that was fetched, opened: throws when it is not what the message said. */
export function openFile(file: NostrDmFile, sealed: Uint8Array): Uint8Array {
  if (toHex(sha256Bytes(sealed)) !== file.x) throw new Error(t('This file is not the one that was sent.'));
  let bytes: Uint8Array;
  try {
    // Any nonce length: some Nostr apps send 16 bytes.
    bytes = gcm(fromHex(file.key), fromHex(file.nonce)).decrypt(sealed);
  } catch {
    throw new Error(t('This file could not be opened.'));
  }
  if (file.ox && toHex(sha256Bytes(bytes)) !== file.ox) throw new Error(t('This file is not the one that was sent.'));
  return bytes;
}

// ---- the servers ----

export type NostrHttpAnswer = HttpAnswer;
export type NostrHttp = Http;

// Through Tor as the space's Tor way says, as Nostr chats go (lib/nostr-dm-net.ts).
let http: NostrHttp = netHttp;

/** For the checks: how files reach servers; null for the usual way. */
export function setNostrHttp(next: NostrHttp | null): void {
  http = next ?? netHttp;
}

// How a file of a chat that goes only through Tor (`torChat`) reaches a server: through Tor alone,
// whatever the space's way. The checks' own way (setNostrHttp) stays theirs.
const wayOf = (torChat: boolean): NostrHttp => (torChat && http === netHttp ? torChatHttp : http);

const base64url = (bytes: Uint8Array) => {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * Puts encrypted bytes on the first of `servers` that takes them (BUD-02), signed by `sign` with
 * a key made for this upload alone. Answers where they are. Throws, with what the servers said,
 * when none took them. `torChat`: for a chat that goes only through Tor, through Tor whatever the
 * space's way, never straight.
 */
export async function uploadBlob(
  servers: string[],
  sealed: Uint8Array,
  sign: (kind: number, tags: string[][], content: string) => Promise<unknown>,
  now = Date.now(),
  way: boolean | Http = false,
): Promise<string> {
  // A chat or account's own way (net-http chatTorHttp, accountHttp) when given; with `true`, of an
  // Erevos chat that goes only through Tor. The checks' own way stays theirs.
  const via = typeof way === 'function' ? (http === netHttp ? way : http) : wayOf(way);
  const hash = toHex(sha256Bytes(sealed));
  const said: string[] = [];
  for (const server of servers) {
    const root = server.replace(/\/+$/, '');
    try {
      const host = new URL(root).hostname.toLowerCase();
      const auth = await sign(
        24242,
        [
          ['t', 'upload'],
          ['x', hash],
          ['expiration', String(Math.floor(now / 1000) + 600)],
          ['server', host],
        ],
        'Upload Blob',
      );
      const answer = await via('PUT', `${root}/upload`, {
        Authorization: `Nostr ${base64url(utf8Encode(JSON.stringify(auth)))}`,
        'Content-Type': 'application/octet-stream',
        'X-SHA-256': hash,
      }, sealed);
      if (answer.status === 200 || answer.status === 201) {
        const descriptor = JSON.parse(utf8Decode(answer.bytes)) as { url?: unknown; sha256?: unknown };
        if (descriptor.sha256 !== undefined && descriptor.sha256 !== hash) throw new Error(t('The server changed the file.'));
        // One a message can carry (lib/attachments.ts readOffer), or where BUD-02 says it is.
        if (typeof descriptor.url === 'string' && /^https:\/\/\S+$/.test(descriptor.url) && descriptor.url.length <= 2048) return descriptor.url;
        return `${root}/${hash}`;
      }
      said.push(`${host}: ${answer.status}${answer.reason ? ` ${answer.reason.slice(0, 120)}` : ''}`);
    } catch (error) {
      said.push(`${server}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(t('No file server took the file ({said}).', { said: said.join('; ') }));
}

/** The most a file's encrypted bytes may be when fetched: NOSTR_FILE_MOST and a little, for the
 *  tag AES-GCM adds and for other apps' rounding. A server that sends more is stopped. */
export const NOSTR_BLOB_MOST = NOSTR_FILE_MOST + 64 * 1024;

/** Fetches a file's encrypted bytes from where the message says, NOSTR_BLOB_MOST at most; with
 *  `onlyTor`, through Tor or not at all, never straight when Tor fails (a file taken by itself,
 *  lib/attachments.ts takesItself); with `way` true, of a chat that goes only through Tor, through
 *  Tor whatever the space's way; or a chat or account's own way. The checks' own way (setNostrHttp)
 *  stays theirs. */
export async function downloadBlob(url: string, onlyTor = false, way: boolean | Http = false): Promise<Uint8Array> {
  const answer = await (typeof way === 'function' ? (http === netHttp ? way : http) : way ? wayOf(true) : onlyTor && http === netHttp ? torOnlyHttp : http)('GET', url, {}, undefined, NOSTR_BLOB_MOST);
  if (answer.status < 200 || answer.status >= 300) throw new Error(t('The file could not be fetched ({status}).', { status: String(answer.status) }));
  return answer.bytes;
}
