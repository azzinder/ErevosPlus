// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { fromBase64, randomBytes, toBase64, toHex } from './crypto';
import { t } from './i18n';
import { mimeOfName } from './matrix-media';
import type { AccountTor } from './account-tor';
import { accountHttp, HttpTooLargeError, netHttp, type Http } from './net-http';
import { omemoCall } from './xmpp-omemo';
import { child, children, el, textOf, type XmlElement } from './xmpp-xml';

// Photos and files in XMPP chats (docs/xmpp.md), as Conversations, Monal, Gajim and Dino share them:
// the server's HTTP upload (XEP-0363) gives a place to put the file and the address to fetch it
// from. In a chat encrypted with OMEMO the file is encrypted on the phone first, with AES-256-GCM
// by a key and IV made for it alone (the core's, crates/erevos-xmpp), and the message, encrypted as
// any other, says only an aesgcm:// link whose fragment holds them (XEP-0454): the server keeps what
// it cannot read. In a chat written without encryption the file goes as it is, its https:// link in
// the message and in an out-of-band element (XEP-0066), as every app reads it. Files go and come
// through Tor as the space's Tor way says, as the chats do; one that comes is fetched only when asked for.
// A sound is a voice message, as other XMPP apps record and send one (lib/xmpp-voice.ts).

export const NS_UPLOAD = 'urn:xmpp:http:upload:0';
export const NS_OOB = 'jabber:x:oob';
const NS_ITEMS = 'http://jabber.org/protocol/disco#items';
const NS_INFO = 'http://jabber.org/protocol/disco#info';

/** The largest file Erevos sends or fetches: it is held whole in memory while it is encrypted. */
export const XMPP_FILE_MOST = 50 * 1024 * 1024;
/** How long the server's upload service is known before it is looked for again. */
const SERVICE_FRESH_MS = 24 * 3600_000;

/** A file in a message, as it came or went. */
export type XmppFile = {
  /** Where it is, https://. */
  url: string;
  /** The IV and key of an encrypted one, hex, as its aesgcm:// link's fragment says; none for one sent as it is. */
  fragment?: string;
  name: string;
  /** Its type, by its name. */
  type: string;
  size?: number;
  /** How long a sound lasts, in milliseconds, as this device knows it: recorded here, or read from it once fetched. Never sent. */
  duration?: number;
};

/** The server's upload service, as last found, and the largest file it takes. */
export type XmppUpload = { jid: string; most?: number; at: number };

/** What the core's file calls need of an XMPP connection: an IQ to someone, its answer back. */
export type XmppAsk = { iq(type: 'get' | 'set', to: string | undefined, payload: XmlElement): Promise<XmlElement> };

const AESGCM = /^aesgcm:\/\/([^\s#]+)#([0-9a-fA-F]{88}|[0-9a-fA-F]{96})$/;
const HTTPS = /^https:\/\/\S+$/;

// The endings other XMPP apps record sounds with, which a voice message is: Conversations' .m4a
// and .oga, Gajim's .ogg and .opus, and the like.
const SOUNDS: Record<string, string> = { m4a: 'audio/mp4', aac: 'audio/aac', oga: 'audio/ogg', ogg: 'audio/ogg', opus: 'audio/ogg', mp3: 'audio/mpeg', wav: 'audio/wav', flac: 'audio/flac', weba: 'audio/webm', amr: 'audio/amr' };

/** A file's type by its name: a sound by the endings apps record with, anything else as lib/matrix-media.ts knows it. */
export function typeOfName(name: string): string {
  const end = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase() ?? '';
  return SOUNDS[end] ?? mimeOfName(name);
}

/** The type a file shows as: one kept before its ending was known is known by its name now. */
export function shownType(file: Pick<XmppFile, 'name' | 'type'>): string {
  return file.type === 'application/octet-stream' ? typeOfName(file.name) : file.type;
}

/** Whether a file is a sound: other XMPP apps send a voice message as one, so it shows as one. */
export function isSound(file: Pick<XmppFile, 'name' | 'type'>): boolean {
  return shownType(file).startsWith('audio/');
}

/**
 * Whether a file already on a server can go to another chat by its link alone (forwarded): only
 * when that chat is written as the file was, encrypted (its key then goes encrypted in the new
 * message) or as it is. Otherwise it is fetched and put on the server again, as that chat writes.
 */
export function linkFits(file: Pick<XmppFile, 'fragment'>, encrypt: boolean): boolean {
  return Boolean(file.fragment) === encrypt;
}

function nameOfUrl(url: string): string {
  try {
    const last = new URL(url).pathname.split('/').filter(Boolean).pop() ?? '';
    return decodeURIComponent(last).slice(0, 200) || 'file';
  } catch {
    return 'file';
  }
}

/**
 * The file a message's text says: an aesgcm:// link alone (encrypted), or an https:// link alone
 * that its out-of-band element names too (sent as it is). Null for anything else, which is text.
 */
export function fileOfText(text: string, oob?: string): XmppFile | null {
  const body = text.trim();
  const sealed = AESGCM.exec(body);
  if (sealed) {
    const url = `https://${sealed[1]}`;
    const name = nameOfUrl(url);
    return { url, fragment: sealed[2].toLowerCase(), name, type: typeOfName(name) };
  }
  if (oob && HTTPS.test(body) && oob.trim() === body && body.length <= 2048) {
    const name = nameOfUrl(body);
    return { url: body, name, type: typeOfName(name) };
  }
  return null;
}

/** The text that says `file` in a message: its aesgcm:// link, or its https:// one. */
export function textOfFile(file: XmppFile): string {
  return file.fragment ? `aesgcm://${file.url.slice('https://'.length)}#${file.fragment}` : file.url;
}

/** The out-of-band element of a file sent as it is (XEP-0066). */
export function oobOf(file: XmppFile): XmlElement {
  return el('x', { xmlns: NS_OOB }, el('url', {}, file.url));
}

/** The server's upload service: a disco item of the account's domain that offers HTTP upload. Null when it has none. */
export async function findUpload(connection: XmppAsk, domain: string, known?: XmppUpload, now = Date.now()): Promise<XmppUpload | null> {
  if (known && now - known.at < SERVICE_FRESH_MS) return known;
  const offered = async (jid: string): Promise<XmppUpload | null> => {
    const info = await connection.iq('get', jid, el('query', { xmlns: NS_INFO }));
    const query = child(info, 'query', NS_INFO);
    if (!children(query, 'feature').some((f) => f.attrs.var === NS_UPLOAD)) return null;
    // The largest file, in the service's form (XEP-0363 §2), if it says.
    let most: number | undefined;
    for (const form of children(query, 'x', 'jabber:x:data')) {
      const fields = children(form, 'field');
      if (!fields.some((f) => f.attrs.var === 'FORM_TYPE' && textOf(child(f, 'value')).trim() === NS_UPLOAD)) continue;
      const said = Number(textOf(child(fields.find((f) => f.attrs.var === 'max-file-size'), 'value')).trim());
      if (Number.isSafeInteger(said) && said > 0) most = said;
    }
    return { jid, ...(most ? { most } : {}), at: now };
  };
  try {
    const own = await offered(domain);
    if (own) return own;
  } catch {
    // The domain itself answers nothing of it: its items may.
  }
  const items = await connection.iq('get', domain, el('query', { xmlns: NS_ITEMS }));
  for (const item of children(child(items, 'query', NS_ITEMS), 'item')) {
    const jid = item.attrs.jid;
    if (!jid) continue;
    try {
      const found = await offered(jid);
      if (found) return found;
    } catch {
      // That item does not say: the next.
    }
  }
  return null;
}

let http: Http = netHttp;

/** For the checks: how files reach servers; null for the usual way. */
export function setXmppHttp(next: Http | null): void {
  http = next ?? netHttp;
}

// How files of an account go, as its Tor choice says for files (lib/account-tor.ts): a check's own way stays.
const httpFor = (way: AccountTor): Http => (http === netHttp ? accountHttp(way, true) : http);

/** Headers a slot may give for the upload, and no others (XEP-0363 §4). */
const SLOT_HEADERS = new Set(['authorization', 'cookie', 'expires']);

/**
 * Puts `bytes` on the server through its upload service, as `name` of `type`, and answers where to
 * fetch it from. Encrypted first when `encrypt`: the answer then carries its key, for the link.
 * `way`: the account's Tor choice as it counts now (lib/account-tor.ts effectiveTor).
 */
export async function uploadXmppFile(connection: XmppAsk, service: XmppUpload, picked: { bytes: Uint8Array; name: string; type: string }, encrypt: boolean, way: AccountTor = 'never'): Promise<XmppFile> {
  let body = picked.bytes;
  let fragment: string | undefined;
  if (encrypt) {
    const sealed = await omemoCall<{ data: string; fragment: string }>({ op: 'file_encrypt', data: toBase64(picked.bytes) });
    body = fromBase64(sealed.data);
    fragment = sealed.fragment;
  }
  const most = Math.min(service.most ?? XMPP_FILE_MOST, XMPP_FILE_MOST);
  if (body.length > most) throw new Error(t('Files up to {size} MB go in XMPP chats.', { size: String(Math.floor(most / (1024 * 1024))) }));
  // The name the server keeps says nothing of the file's own.
  const dot = picked.name.lastIndexOf('.');
  const ending = dot > 0 ? picked.name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 8) : '';
  const filename = encrypt ? `${toHex(randomBytes(8))}${ending}` : picked.name.replace(/[/\\\s]+/g, '_').slice(0, 120) || 'file';
  const slot = await connection.iq(
    'get',
    service.jid,
    el('request', { xmlns: NS_UPLOAD, filename, size: String(body.length), 'content-type': encrypt ? 'application/octet-stream' : picked.type }),
  );
  const given = child(slot, 'slot', NS_UPLOAD);
  const put = child(given, 'put');
  const get = child(given, 'get');
  const putUrl = put?.attrs.url ?? '';
  const getUrl = get?.attrs.url ?? '';
  if (!HTTPS.test(putUrl) || !HTTPS.test(getUrl)) throw new Error(t('The XMPP server gave no place for the file.'));
  const headers: Record<string, string> = { 'Content-Type': encrypt ? 'application/octet-stream' : picked.type };
  for (const header of children(put, 'header')) {
    const name = header.attrs.name ?? '';
    if (SLOT_HEADERS.has(name.toLowerCase())) headers[name] = textOf(header).replace(/[\r\n]/g, '').trim();
  }
  const answer = await httpFor(way)('PUT', putUrl, headers, body);
  if (answer.status !== 200 && answer.status !== 201) throw new Error(t('The XMPP server did not take the file ({status}).', { status: String(answer.status) }));
  return { url: getUrl, ...(fragment ? { fragment } : {}), name: picked.name, type: picked.type, size: picked.bytes.length };
}

/** Whether a file is on the account's own server (its domain, or a host under it), which sees this phone's address anyway while connected. */
export function fileOfOwnServer(file: Pick<XmppFile, 'url'>, account: string): boolean {
  let host: string;
  try {
    host = new URL(file.url).hostname.toLowerCase();
  } catch {
    return false;
  }
  const domain = account.slice(account.indexOf('@') + 1).toLowerCase();
  return host === domain || host.endsWith(`.${domain}`);
}

/** Fetches a file a message names and opens it: throws when it cannot be had, or does not open. `way`: the account's Tor choice. */
export async function downloadXmppFile(file: XmppFile, way: AccountTor = 'never'): Promise<Uint8Array> {
  // A server that sends more than that is stopped (lib/net-http.ts).
  const answer = await httpFor(way)('GET', file.url, {}, undefined, XMPP_FILE_MOST + 16).catch((error: unknown) => {
    if (error instanceof HttpTooLargeError) throw new Error(t('This file is larger than Erevos opens.'));
    throw error;
  });
  if (answer.status < 200 || answer.status >= 300) throw new Error(t('The file could not be fetched ({status}).', { status: String(answer.status) }));
  if (answer.bytes.length > XMPP_FILE_MOST + 16) throw new Error(t('This file is larger than Erevos opens.'));
  if (!file.fragment) return answer.bytes;
  try {
    const opened = await omemoCall<{ data: string }>({ op: 'file_decrypt', data: toBase64(answer.bytes), fragment: file.fragment });
    return fromBase64(opened.data);
  } catch {
    throw new Error(t('This file could not be opened.'));
  }
}
