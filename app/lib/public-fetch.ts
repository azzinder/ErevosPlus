// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { utf8Decode } from './crypto';
import { pictureCache } from './file-cache';
import { MAX_PAGE, pageInfo } from './link-preview';
import { netHttp, netThroughTor, torOnlyHttp, type Http } from './net-http';
import { fetchable, imageType, siteOf, type PublicImages } from './public-media';

// Fetching what the public feed shows of a post (lib/public-media.ts): its photos, and the card
// of its first link, from wherever the post says. The server that has them sees that someone
// fetched them, and from which address: through Tor, a Tor exit's; straight, this phone's. So it
// goes as SpaceData.publicImages says: 'always', at once, as the space's Tor way says (through
// Tor once it is ready with Messages, only through it with Everything, straight with it off);
// 'tor', at once only while that goes through Tor, and never straight unless tapped; 'tap', only
// what is tapped. Nothing is sent with a fetch but the address: no cookie, no name.
//
// What came is held in memory while Erevos runs, never written to the phone, the newest up to
// HELD_MOST bytes; a photo is shown only when its bytes are one of the kinds Erevos shows
// (imageType), whatever the server said it is.

/** The largest photo fetched for the feed, bytes. */
export const IMAGE_MOST = 8 * 1024 * 1024;
const HELD_MOST = 48 * 1024 * 1024;
// The link cards held, the newest.
const CARDS_MOST = 300;

let http: Http = netHttp;
let torHttp: Http = torOnlyHttp;
let tor = netThroughTor;

/** For the checks: other ways to fetch, and whether they go through Tor; null for the real ones. */
export function setPublicHttp(next: { http: Http; tor: Http; through: () => boolean } | null): void {
  http = next?.http ?? netHttp;
  torHttp = next?.tor ?? torOnlyHttp;
  tor = next?.through ?? netThroughTor;
  forgetPublicMedia();
}

/** How a fetch goes: by itself as the feed shows ('show'), or because its owner tapped it ('tap'). */
export type FetchWhy = 'show' | 'tap';

/** Whether the feed fetches photos and cards by itself now, as `mode` says. */
export function fetchesByItself(mode: PublicImages): boolean {
  if (mode === 'tap') return false;
  if (mode === 'tor') return tor();
  return true;
}

// The way a fetch goes: tapped, or 'always', as the space's Tor way says; 'tor', only through Tor.
const wayOf = (mode: PublicImages, why: FetchWhy): Http => (why === 'tap' || mode === 'always' ? http : torHttp);

// Before a fetch that can show this phone's address (not through Tor now): asked by the screen
// (components/public-feed.tsx, lib/ip-warning.ts), once for all; turned down, the feed fetches
// nothing by itself again until a tap asks once more.
let ipAsk: (() => Promise<boolean>) | null = null;
let asking: Promise<boolean> | null = null;
let declined = false;

/** How the screen asks before the address can be seen; null asks nothing (the checks). */
export function setPublicIpAsk(next: (() => Promise<boolean>) | null): void {
  ipAsk = next;
  declined = false;
}

async function mayShowAddress(mode: PublicImages, why: FetchWhy): Promise<boolean> {
  if (wayOf(mode, why) !== http || tor() || !ipAsk) return true;
  if (declined && why === 'show') return false;
  asking ??= ipAsk().finally(() => {
    asking = null;
  });
  const ok = await asking;
  declined = !ok;
  return ok;
}

const photos = pictureCache(HELD_MOST);

/** A photo for the feed: its bytes and their kind, fetched once while Erevos runs. */
export async function publicPhoto(url: string, mode: PublicImages, why: FetchWhy): Promise<{ bytes: Uint8Array; mime: string }> {
  if (!fetchable(url)) throw new Error('Not fetched');
  if (why === 'show' && !fetchesByItself(mode)) throw new Error('Not fetched');
  const get = wayOf(mode, why);
  // Asked before, not inside: one turned down is not held as failed, so a tap fetches it.
  if (!(await mayShowAddress(mode, why))) throw new Error('Not fetched');
  const bytes = await photos.get(url, async () => {
    const answer = await get('GET', url, { Accept: 'image/avif, image/webp, image/jpeg, image/png, image/gif' }, undefined, IMAGE_MOST);
    if (answer.status < 200 || answer.status >= 300) throw new Error(`HTTP ${answer.status}`);
    if (!imageType(answer.bytes)) throw new Error('Not a photo');
    return answer.bytes;
  });
  return { bytes, mime: imageType(bytes) ?? 'image/jpeg' };
}

/** A link's card: the page's site, title, a line about it and where its picture is. */
export type LinkCard = { url: string; site: string; title: string; text: string; picture: string | null };

const cards = new Map<string, Promise<LinkCard | null>>();

/**
 * The card of the page at `url`, as the page says of itself (its og: tags, lib/link-preview.ts),
 * read from its first MAX_PAGE bytes; null when it says nothing, is not a page, or did not answer.
 * Asked once while Erevos runs, however many posts have the link. A page that sends Erevos on to
 * another address gives no card through Tor, whose fetch does not follow it.
 */
export function publicCard(url: string, mode: PublicImages, why: FetchWhy): Promise<LinkCard | null> {
  if (!fetchable(url)) return Promise.resolve(null);
  const had = cards.get(url);
  if (had) return had;
  if (why === 'show' && !fetchesByItself(mode)) return Promise.reject(new Error('Not fetched'));
  const get = wayOf(mode, why);
  const going = (async (): Promise<LinkCard | null> => {
    if (!(await mayShowAddress(mode, why))) throw new Error('Not fetched');
    const answer = await get('GET', url, { Accept: 'text/html, application/xhtml+xml' }, undefined, MAX_PAGE * 4);
    if (answer.status < 200 || answer.status >= 300) return null;
    const head = utf8Decode(answer.bytes.subarray(0, MAX_PAGE));
    if (!/<(?:html|head|meta|title)\b/i.test(head)) return null;
    const info = pageInfo(head, url);
    if (!info) return null;
    const picture = info.picture && fetchable(info.picture) ? info.picture : null;
    return { url, site: siteOf(url), title: info.title.slice(0, 300), text: info.text.slice(0, 500), picture };
  })();
  cards.set(url, going);
  // One that failed is asked again the next time it shows; one that answered stays.
  going.catch(() => cards.delete(url));
  while (cards.size > CARDS_MOST) cards.delete(cards.keys().next().value as string);
  return going;
}

/** Lets go of every photo and card fetched: as the space closes. */
export function forgetPublicMedia(): void {
  photos.clear();
  cards.clear();
}
