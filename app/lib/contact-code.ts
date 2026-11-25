// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Contact codes: what a phone shows, as a QR code, so another phone can write to it through
// the relay. The code is a link,
//   erevos://contact?id=<relay sender id>&relay=<relay address>&key=<public keys>&rk=<relay key>
// so the phone's own camera app can open Erevos with it. The keys are the chat's account bundle
// (lib/e2e.ts) in base64url, about 1800 characters, which end-to-end encryption starts from.
// `rk` is the relay's key for sealed sends (43 characters), so a phone on another relay can write
// to this queue through its own relay; codes from before it have none. A code from a phone with
// no relay queue yet has no id and no relay, only the keys: whoever adds it reaches that phone
// nearby (lib/nearby.ts) until it says where its queue is. The relay token is never part of it.
// A phone with a backup relay (lib/spare.ts) adds its queue there:
//   &sid=<sender id there>&srelay=<backup relay address>&srk=<its key>
// so a contact writes there while the first relay cannot be reached. One with more home relays
// (up to MORE_SPARES besides the first) adds each of the others the same way, numbered from 2:
//   &sid2=<sender id>&srelay2=<address>&srk2=<key>&sid3=...
// tried in that order. An Erevos before them reads the first and leaves the others out.
// A phone whose relay lends places (crates/erevos-relay/src/lend.rs) adds a ticket for one:
//   &lend=ticket.<80 hex characters>
// so whoever adds it with no relay of their own takes a place there (lib/relay.ts, borrowPlace).
// A phone that reads on Nostr (lib/nostr.ts) adds the key its link has there, and its relays:
//   &nk=<64 hex>&nr=<Nostr relay address>,<another>
// so whoever adds it with no relay between the two writes to it there, through Tor
// (lib/nostr-chats.ts nostrOnlyWay), with or without an id and a relay.
// For a web page, as a contact page anyone may open, the same fields go after # on LPHL's web
// server (or the one the build names, lib/servers.ts), with the name the phone gives itself for them:
//   https://erevos-web.lphl.nekten.eu/c#id=...&relay=...&key=...[&n=<name>]
// whose page (pwa/c/) offers Erevos and then opens the link in it. What follows # never goes to the
// web server. It has no place on a relay in it (no `lend`): anyone who sees the page has the link,
// and whoever adds it writes a message request first, as with any contact link.
// Self-contained on purpose (but for lib/servers.ts), so it can run under plain Node for checks.

export type SpareCode = { senderHex: string; relayUrl: string; relayKey?: string; more?: SpareCode[] };
/** The most home relays a link names besides the first (lock/e2e-data.ts MORE_SPARE, as there). */
export const MORE_SPARES = 2;
/** The longest a link grows by naming more home relays: one QR code holds about 2950 characters at
 *  its largest, and an invite (lib/welcome.ts) adds up to about 350 around a contact link. */
export const LINK_MOST = 2550;
/** Where a link's phone reads on Nostr: the key its link has there (hex), and its relays. */
export type NostrCode = { k: string; r: string[] };
/** `d`: the link's Erevos takes a new contact's first conversation from one of their linked devices, with their account's word for it (docs/multi-device.md, S5): an Erevos before does not say it. */
export type ContactCode = { senderHex: string; relayUrl: string; key: string; relayKey?: string; spare?: SpareCode; lend?: string; nostr?: NostrCode; d?: true };

import { WEB_ORIGIN, pageLink } from './servers';

const LINK = 'erevos://contact?';
/** Where a contact link for a web page goes: the page that offers Erevos, then opens the link (pwa/c/). */
export const CONTACT_PAGE = `${WEB_ORIGIN}/c`;
/** The longest name a link for a web page gives its phone (lib/welcome.ts MAX_NAME, as there). */
const PAGE_NAME = 40;
// A bundle is about 1800 characters. Anything far longer is not one.
const MAX_KEY = 4096;
const TICKET = /^ticket\.[0-9a-f]{80}$/;
// The most Nostr relays a link names, and the longest address of one (lock/e2e-data.ts, as there).
export const MOST_NOSTR = 5;
const NOSTR_URL = 256;

/** A Nostr relay's address: wss://, or ws:// to an onion service (lock/e2e-data.ts isNostrRelay). */
function isNostrUrl(v: string): boolean {
  return v.length <= NOSTR_URL && (/^wss:\/\/[^\s/?#,]+(\/[^\s,]*)?$/i.test(v) || /^ws:\/\/[a-z2-7]{56}\.onion(:\d+)?(\/[^\s,]*)?$/i.test(v));
}

/** Where a link says its phone reads on Nostr, checked: null when it does not say, or not as it should. */
export function checkNostr(k: unknown, r: unknown): NostrCode | null {
  if (typeof k !== 'string' || !/^[0-9a-f]{64}$/.test(k) || !Array.isArray(r)) return null;
  const relays = [...new Set(r.filter((v): v is string => typeof v === 'string' && isNostrUrl(v)))].slice(0, MOST_NOSTR);
  return relays.length > 0 ? { k, r: relays } : null;
}

export function contactLink({ senderHex, relayUrl, key, relayKey, spare, lend, nostr }: ContactCode): string {
  const backupAt = (one: SpareCode, n: string) =>
    `&sid${n}=${one.senderHex}&srelay${n}=${encodeURIComponent(one.relayUrl)}${one.relayKey ? `&srk${n}=${one.relayKey}` : ''}`;
  const backup = spare ? backupAt(spare, '') : '';
  const ticket = lend && relayUrl && TICKET.test(lend) ? `&lend=${lend}` : '';
  const there = nostr ? checkNostr(nostr.k, nostr.r) : null;
  const onNostr = there ? `&nk=${there.k}&nr=${there.r.map(encodeURIComponent).join(',')}` : '';
  // Every link of this version says it takes a new contact from their linked device (`d`).
  let link = `${LINK}id=${senderHex}&relay=${encodeURIComponent(relayUrl)}${key ? `&key=${key}` : ''}${relayKey ? `&rk=${relayKey}` : ''}${backup}${ticket}${onNostr}${key ? '&d=1' : ''}`;
  // The other home relays, while the link stays short enough for one QR code with an invite around
  // it: the rest are said with the first message anyway (lib/e2e.ts, Spare.more).
  for (const [i, one] of (spare?.more ?? []).slice(0, MORE_SPARES).entries()) {
    const more = backupAt(one, String(i + 2));
    if (link.length + more.length > LINK_MOST) break;
    link += more;
  }
  return link;
}

/** Checks a backup queue of a link: null when it is not one, as when a part is missing. */
export function checkSpare(senderHex: unknown, relayUrl: unknown, relayKey: unknown = ''): SpareCode | null {
  if (typeof senderHex !== 'string' || typeof relayUrl !== 'string' || typeof relayKey !== 'string') return null;
  const id = senderHex.trim().toLowerCase();
  const relay = relayUrl.trim();
  if (!/^[0-9a-f]{48}$/.test(id) || !/^wss?:\/\/[^\s/?#]+(\/[^\s]*)?$/i.test(relay)) return null;
  if (relayKey && !/^[A-Za-z0-9_-]{43}$/.test(relayKey)) return null;
  return relayKey ? { senderHex: id, relayUrl: relay, relayKey } : { senderHex: id, relayUrl: relay };
}

/** Checks the parts of a code. The relay and the key may be empty, when the code has none, and the id too when it has the key. */
export function checkContact(senderHex: unknown, relayUrl: unknown, key: unknown = '', relayKey: unknown = ''): ContactCode | null {
  if (typeof senderHex !== 'string' || typeof relayUrl !== 'string' || typeof key !== 'string') return null;
  if (typeof relayKey !== 'string' || (relayKey && !/^[A-Za-z0-9_-]{43}$/.test(relayKey))) return null;
  const id = senderHex.trim().toLowerCase();
  const relay = relayUrl.trim();
  const keys = key.trim();
  if (!/^[0-9a-f]{48}$/.test(id) && !(id === '' && keys && !relay)) return null;
  if (relay && !/^wss?:\/\/[^\s/?#]+(\/[^\s]*)?$/i.test(relay)) return null;
  if (keys.length > MAX_KEY || !/^[A-Za-z0-9_-]*$/.test(keys)) return null;
  return relayKey ? { senderHex: id, relayUrl: relay, key: keys, relayKey } : { senderHex: id, relayUrl: relay, key: keys };
}

/** Reads a contact link, or a bare 48-character relay sender id. Null if the text is neither. */
export function parseContact(text: string): ContactCode | null {
  const clean = text.trim();
  const page = pageFields(clean);
  if (page !== null) return parseContact(`${LINK}${page}`);
  if (!clean.toLowerCase().startsWith(LINK)) return checkContact(clean, '');
  const fields: Record<string, string> = {};
  // The Nostr relays, each encoded on its own, as they are said between commas.
  let relays: string[] = [];
  for (const pair of clean.slice(LINK.length).split('&')) {
    const at = pair.indexOf('=');
    if (at < 0) continue;
    try {
      if (pair.slice(0, at) === 'nr') relays = pair.slice(at + 1).split(',').map((url) => decodeURIComponent(url));
      else fields[pair.slice(0, at)] = decodeURIComponent(pair.slice(at + 1).replace(/\+/g, ' '));
    } catch {
      return null;
    }
  }
  const code = checkContact(fields.id, fields.relay ?? '', fields.key ?? '', fields.rk ?? '');
  // A backup queue, a ticket or a Nostr place that does not read is left out: the link still works without it.
  const first = code?.relayUrl && fields.sid ? checkSpare(fields.sid, fields.srelay ?? '', fields.srk ?? '') : null;
  // The other home relays, each that reads, once each, after the first.
  const more: SpareCode[] = [];
  for (let n = 2; first && n < 2 + MORE_SPARES; n++) {
    const one = fields[`sid${n}`] ? checkSpare(fields[`sid${n}`], fields[`srelay${n}`] ?? '', fields[`srk${n}`] ?? '') : null;
    if (one && ![first, ...more].some((s) => s.relayUrl.toLowerCase() === one.relayUrl.toLowerCase())) more.push(one);
  }
  const spare = first && more.length > 0 ? { ...first, more } : first;
  const lend = code?.relayUrl && fields.lend && TICKET.test(fields.lend) ? fields.lend : '';
  const nostr = code?.key && fields.nk ? checkNostr(fields.nk, relays) : null;
  return code ? { ...code, ...(spare ? { spare } : {}), ...(lend ? { lend } : {}), ...(nostr ? { nostr } : {}), ...(code.key && fields.d === '1' ? { d: true as const } : {}) } : code;
}

/** The fields of a link for a web page, after #, or null when the text is not one. */
function pageFields(text: string): string | null {
  // On this build's web server, LPHL's, or any other that serves Erevos's pages (lib/servers.ts).
  return pageLink(text, 'c');
}

/** A name as a link gives it: one line, no marks that could turn it around, at most PAGE_NAME letters. */
function cleanName(text: string): string {
  const line = text.replace(/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2028\u2029\u2066-\u2069]/g, ' ');
  return [...line.replace(/\s+/g, ' ').trim()].slice(0, PAGE_NAME).join('').trim();
}

/**
 * This phone's contact link as a web page's link (CONTACT_PAGE), named `name` for whoever opens it,
 * or null when the link has no keys. Any place on a relay it holds is left out: a page is for anyone.
 */
export function contactPageLink(link: string, name = ''): string | null {
  const code = parseContact(link);
  if (!code?.key) return null;
  const { lend: _lend, ...kept } = code;
  const named = cleanName(name);
  return `${CONTACT_PAGE}#${contactLink(kept).slice(LINK.length)}${named ? `&n=${encodeURIComponent(named)}` : ''}`;
}

/** The name a contact link gives its phone (`n`, as a link for a web page has it), or ''. */
export function contactLinkName(text: string): string {
  const clean = text.trim();
  const fields = pageFields(clean) ?? (clean.toLowerCase().startsWith(LINK) ? clean.slice(LINK.length) : '');
  for (const pair of fields.split('&')) {
    if (!pair.startsWith('n=')) continue;
    try {
      return cleanName(decodeURIComponent(pair.slice(2).replace(/\+/g, ' ')));
    } catch {
      return '';
    }
  }
  return '';
}

/** A contact link again from the fields a link opened a screen with (app/contact.tsx, app/c.tsx), each as given. */
export function linkOfFields(fields: Record<string, string | string[] | undefined>): string {
  const pairs: string[] = [];
  for (const [name, value] of Object.entries(fields)) {
    if (typeof value !== 'string' || !/^[a-z0-9]+$/.test(name)) continue;
    // The Nostr relays, each encoded on its own, between commas, as contactLink says them.
    pairs.push(name === 'nr' ? `nr=${value.split(',').map(encodeURIComponent).join(',')}` : `${name}=${encodeURIComponent(value)}`);
  }
  return `${LINK}${pairs.join('&')}`;
}

// Hands a contact from the screen a scanned link opens, or from a contact's Erevos ID
// (app/contact-card.tsx, app/contact-edit.tsx), to the chat screen, which owns the contact list. Kept
// in memory only: the chat saves the contact once it has it. Then, for the chats the offer was made
// for only (`place`: the space's, or hidden chats'), it gives the contact the name that came with
// it when it has none (lib/linked-name.ts) and tells `added` who it is, to link a contact to it.

/** What is told who the contact added is (its identity), once it is. */
export type Added = (identity: string) => void;

/** Where a link and a name handed over with a contact belong: a space's chats or its hidden chats (lib/sealed-contacts.ts, Place). */
export type OfferPlace = { holder: string; space: number };

/**
 * What may come with a contact handed to the chat, for the chats of `place` only: who is told who
 * the contact is once added (`added`, to link a contact to it), and the name it takes if it has
 * none of its own (`name`).
 */
export type Offer = { place: OfferPlace; added?: Added; name?: string };

type Listener = (code: ContactCode, offer?: Offer) => void;

let waiting: { code: ContactCode; offer?: Offer } | null = null;
let listener: Listener | null = null;

/** Gives a contact to the chat: now if the chat is open, otherwise when it next opens. */
export function offerContact(code: ContactCode, offer?: Offer): void {
  if (listener) listener(code, offer);
  else waiting = { code, offer };
}

/** For the chat: receives offered contacts until unsubscribed, starting with one that waited. */
export function onContactOffered(next: Listener): () => void {
  listener = next;
  if (waiting) {
    const { code, offer } = waiting;
    waiting = null;
    next(code, offer);
  }
  return () => {
    if (listener === next) listener = null;
  };
}

/**
 * What of an offer the chats of `here` take: all of it when it was made for them, else nothing but
 * the contact (null), so a link or a name made for hidden chats never goes to the space's chats, or
 * the other way, as when hidden chats closed before their chat took it.
 */
export function offerFor(offer: Offer | undefined, here: OfferPlace): Offer | null {
  return offer && offer.place.holder === here.holder && offer.place.space === here.space ? offer : null;
}

/** The space locks: a contact handed over and not taken yet goes, with the name and link that came with it. */
export function forgetOffered(): void {
  waiting = null;
}
