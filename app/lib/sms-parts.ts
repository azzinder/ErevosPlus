// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { SmsPin } from '../lock/sms-data';
import type { SmsMessage, SmsPart } from '../modules/erevos-sms';
import { checkedPlace, type Place } from './chat-parts';
import type { Fields } from './contacts';
import { utf8Encode } from './crypto';
import { t } from './i18n';
import { splitLinks } from './links';
import { geoUri, placeOfGeo } from './matrix-parts';
import { smsLineId } from './sms-chat';
import { writeVCard } from './vcard';

// What an SMS or MMS carries besides its words, as the SMS screen (app/sms.tsx) sends and shows it,
// in the ways every phone's messaging app already reads:
// - A voice message: an MMS with the sound as AMR-NB (audio/amr, 8 kHz, 12.2 kbit/s), the format
//   MMS was made with, which Android's messaging apps and the iPhone record and play themselves;
//   recorded so by the SMS screen itself (components/sms-parts.tsx), whatever the other chats record
//   in. A minute is about 90 KB, well under what carriers take in one MMS.
// - A place: an SMS of its geo: address (RFC 5870), which a phone's maps app opens, and an
//   OpenStreetMap link for a phone that does not tap a geo: address. Places in the words of an SMS
//   that came (a geo: address, or a link of OpenStreetMap, Google Maps, Apple Maps or Waze with
//   the place in it) show as a place, opened in the phone's maps app; a short link (maps.app.goo.gl)
//   says nothing of the place without being fetched, so it stays a link.
// - A contact: a vCard (text/x-vcard) in an MMS, without the owner's note on the contact or its
//   groups; with its small photo when it still fits. One that came shows its name and numbers, and
//   is saved through the contact screen.
// SMS have no pins: a message is pinned for the owner alone, kept with the space's SMS data
// (lock/sms-data.ts), and found again by its row and its time.

/** How a voice message goes by MMS. */
export const VOICE_MIME = 'audio/amr';
/** How a contact goes by MMS. */
export const CARD_MIME = 'text/x-vcard';
const CARD_TYPES = ['text/x-vcard', 'text/vcard', 'text/directory'];

/** What a part of an MMS is, by its type: a picture, a sound, a contact card, or none of these. */
export function partKind(mime: string): 'picture' | 'video' | 'voice' | 'card' | null {
  const type = mime.toLowerCase().split(';')[0].trim();
  if (type.startsWith('image/')) return 'picture';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/') || type === 'application/ogg') return 'voice';
  return CARD_TYPES.includes(type) ? 'card' : null;
}

/** A part's name as people read it: Picture, Voice message, Contact card. */
export function partWord(mime: string): string {
  const kind = partKind(mime);
  return kind === 'voice' ? t('Voice message') : kind === 'card' ? t('Contact card') : kind === 'video' ? t('Video') : t('Picture');
}

/** A conversation's latest words in the list: an MMS without text says what it holds, in English
 *  from the phone's SMS module (MmsStore.kt), said here in the owner's language. */
export function listWords(text: string): string {
  if (text === 'Picture') return t('Picture');
  if (text === 'Voice message') return t('Voice message');
  if (text === 'Video') return t('Video');
  return text === 'Contact card' ? t('Contact card') : text;
}

/** The parts of a message besides its words: its pictures, videos, sounds and contact cards. */
export function partsOf(m: Pick<SmsMessage, 'pictures' | 'voices' | 'cards' | 'videos'>): SmsPart[] {
  return [...(m.pictures ?? []), ...(m.videos ?? []), ...(m.voices ?? []), ...(m.cards ?? [])];
}

// --- Places ------------------------------------------------------------------------------------

/** A place as an SMS says it: its geo: address, and an OpenStreetMap link; plain ASCII, so one SMS holds it. */
export function placeSms(place: Place): string {
  const { lat, lon } = place;
  return `${geoUri(place)}\nhttps://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
}

// A value of a query or a fragment ("a=1&b=2"), decoded; '' when it is not there.
function param(query: string, name: string): string {
  for (const pair of query.split('&')) {
    const at = pair.indexOf('=');
    if (at < 0 || pair.slice(0, at).toLowerCase() !== name) continue;
    try {
      return decodeURIComponent(pair.slice(at + 1).replace(/\+/g, ' '));
    } catch {
      return '';
    }
  }
  return '';
}

const PAIR = /^(?:loc:)?\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/i;

// "37.97536,23.73495", as a map's link writes a place.
function pairPlace(text: string): Place | null {
  const found = PAIR.exec(text);
  return found ? checkedPlace({ lat: Number(found[1]), lon: Number(found[2]) }) : null;
}

// A geo: address; geo:0,0 names no place, unless its query does (geo:0,0?q=37.9,23.7(Name), as Android writes one).
function geoPlace(uri: string): Place | null {
  const [address, query = ''] = uri.split('?');
  const place = placeOfGeo(address);
  if (place && (place.lat !== 0 || place.lon !== 0)) return place;
  return pairPlace(param(query, 'q').replace(/\(.*$/, ''));
}

// A place in a link of a maps site, or null.
function webPlace(url: string): Place | null {
  const found = /^https?:\/\/([^/?#]+)([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/i.exec(url);
  if (!found) return null;
  const host = found[1].toLowerCase().replace(/:\d+$/, '').replace(/^www\./, '');
  const [path, query, hash] = [found[2], found[3] ?? '', found[4] ?? ''];
  const first = (names: string[]) => names.map((name) => pairPlace(param(query, name))).find((p) => p) ?? null;
  if (host === 'openstreetmap.org' || host === 'osm.org') {
    const marker = checkedPlace({ lat: Number(param(query, 'mlat') || NaN), lon: Number(param(query, 'mlon') || NaN) });
    const map = /(?:^|&)map=\d{1,2}\/(-?\d{1,2}(?:\.\d+)?)\/(-?\d{1,3}(?:\.\d+)?)/.exec(hash);
    return marker ?? (map ? checkedPlace({ lat: Number(map[1]), lon: Number(map[2]) }) : null);
  }
  if (/^(maps\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host) && (host.startsWith('maps.') || path.startsWith('/maps'))) {
    const inPath = /\/(?:place|search)\/([^/@]+)/.exec(path);
    const at = /\/@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/.exec(path);
    let named: Place | null = null;
    try {
      named = inPath ? pairPlace(decodeURIComponent(inPath[1].replace(/\+/g, ' '))) : null;
    } catch {
      named = null;
    }
    return first(['q', 'query', 'll', 'center', 'daddr', 'destination']) ?? named ?? (at ? checkedPlace({ lat: Number(at[1]), lon: Number(at[2]) }) : null);
  }
  if (host === 'maps.apple.com' || host === 'maps.apple') return first(['ll', 'q', 'coordinate', 'daddr', 'sll']);
  if ((host === 'waze.com' || host === 'ul.waze.com') && path.startsWith('/ul')) return first(['ll']);
  return null;
}

const GEO = /geo:-?\d{1,3}(?:\.\d+)?,-?\d{1,3}(?:\.\d+)?(?:,-?\d+(?:\.\d+)?)?(?:;[^;\s?]*)*(?:\?[^\s]*)?/gi;

/** The places the words of an SMS name, each once, in order, at most `most`: geo: addresses, and links of maps sites. */
export function placesIn(text: string, most = 3): Place[] {
  if (!text || (!/geo:/i.test(text) && !/https?:\/\//i.test(text))) return [];
  const found: { at: number; place: Place }[] = [];
  for (const match of text.matchAll(GEO)) {
    const place = geoPlace(match[0]);
    if (place) found.push({ at: match.index ?? 0, place });
  }
  let at = 0;
  for (const part of splitLinks(text)) {
    const place = part.url ? webPlace(part.url) : null;
    if (place) found.push({ at, place });
    at += part.text.length;
  }
  const out: Place[] = [];
  for (const { place } of found.sort((a, b) => a.at - b.at)) {
    if (out.length >= most) break;
    if (!out.some((p) => p.lat === place.lat && p.lon === place.lon)) out.push(place);
  }
  return out;
}

// --- Contact cards -----------------------------------------------------------------------------

/**
 * A contact as an MMS carries it: a vCard without the owner's note on it and its groups, which are
 * theirs alone; with its photo while the whole stays under `most` bytes, else without.
 */
export function contactVCard(card: Fields & { name: string }, photo: Uint8Array | null, most: number): Uint8Array {
  const plain = { ...card, note: '', groups: [] as string[] };
  const whole = utf8Encode(writeVCard({ ...plain, photo }));
  return whole.length <= most || !photo ? whole : utf8Encode(writeVCard({ ...plain, photo: null }));
}

// --- Pins and choosing several -----------------------------------------------------------------

const kindOf = (id: string) => id.split(':')[0];

/** The message a pin is of, among those shown: by its row and time, else by its time (the rows changed). */
function pinned(pin: SmsPin, shown: SmsMessage[]): SmsMessage | null {
  return shown.find((m) => smsLineId(m) === pin.id && m.at === pin.at) ?? shown.find((m) => m.at === pin.at && kindOf(smsLineId(m)) === kindOf(pin.id)) ?? null;
}

/** The pinned messages that show, the latest pinned first. */
export function pinnedShown(pins: SmsPin[], shown: SmsMessage[]): SmsMessage[] {
  const out: SmsMessage[] = [];
  for (const pin of [...pins].reverse()) {
    const m = pinned(pin, shown);
    if (m && !out.includes(m)) out.push(m);
  }
  return out;
}

/** Whether a message is pinned. */
export function isPinned(pins: SmsPin[], m: SmsMessage): boolean {
  return pins.some((pin) => pinned(pin, [m]) !== null);
}

/** The words of the messages chosen, in the order they were written, as they are copied together. */
export function chosenText(messages: SmsMessage[], chosen: ReadonlySet<string>): string {
  return messages
    .filter((m) => chosen.has(smsLineId(m)) && m.text.trim())
    .map((m) => m.text)
    .join('\n\n');
}

/**
 * The messages chosen as one to forward: their words together, in order, and the picture, sound or
 * contact card of the one that has any, when only one has; null when none is chosen.
 */
export function forwardOf(messages: SmsMessage[], chosen: ReadonlySet<string>): SmsMessage | null {
  const picked = messages.filter((m) => chosen.has(smsLineId(m)));
  if (picked.length <= 1) return picked[0] ?? null;
  const withParts = picked.filter((m) => partsOf(m).length > 0);
  const one = withParts.length === 1 ? withParts[0] : null;
  return {
    ...picked[picked.length - 1],
    text: picked
      .map((m) => m.text)
      .filter((text) => text.trim())
      .join('\n\n'),
    pictures: one?.pictures ?? [],
    voices: one?.voices ?? [],
    cards: one?.cards ?? [],
    videos: one?.videos ?? [],
  };
}
