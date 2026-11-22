// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Public tab of home (lib/public-feed.ts, lib/public-media.ts, lib/public-fetch.ts): the
// photos and the first link read from a Nostr post, its words and its imeta tags; which addresses
// may be fetched at all (https, out on the internet); photos known by their bytes, not by what a
// server says; the Nostr posts and the public Matrix rooms' messages in one list, in order; how
// photos are fetched as the setting says, by themselves or only when tapped, through Tor only
// when asked; the tags of an answer (NIP-10).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { answerTags } from '../lib/nostr-dm-store';
import type { NostrEvent } from '../lib/nostr-dm-net';
import type { FeedPost } from '../lib/nostr-feed';
import type { MatrixRoom, MatrixState } from '../lib/matrix';
import type { HttpAnswer, HttpMethod } from '../lib/net-http';
import { fetchesByItself, publicCard, publicPhoto, setPublicHttp, setPublicIpAsk } from '../lib/public-fetch';
import { isPublicRoom, matrixFeed, mergeFeed, roomServer } from '../lib/public-feed';
import { fetchable, imageType, mediaIn, siteOf } from '../lib/public-media';

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 1]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);

test('a post shows its photos inside it, and its first other link as a card', () => {
  const media = mediaIn('Delft, ca. 1900\nhttps://image.nostr.build/a.jpg\nMore at https://example.org/delft https://example.org/other\n\n\nhttps://x.example/b.webp?w=1');
  assert.deepEqual(
    media.images.map((image) => image.url),
    ['https://image.nostr.build/a.jpg', 'https://x.example/b.webp?w=1'],
  );
  assert.equal(media.link, 'https://example.org/delft');
  assert.equal(media.text, 'Delft, ca. 1900\n\nMore at https://example.org/delft https://example.org/other');
});

test('an imeta tag names a photo by its kind, with its size and words', () => {
  const tags = [
    ['imeta', 'url https://blossom.example/abc', 'm image/png', 'dim 1200x800', 'alt A town hall'],
    ['imeta', 'url https://blossom.example/vid', 'm video/mp4'],
    ['imeta', 'url https://blossom.example/pic.svg', 'm image/svg+xml'],
  ];
  const media = mediaIn('https://blossom.example/abc https://blossom.example/vid https://blossom.example/pic.svg', tags);
  assert.deepEqual(media.images, [{ url: 'https://blossom.example/abc', w: 1200, h: 800, alt: 'A town hall' }]);
  // A video is no page to show a card of, nor a drawing Erevos does not show a photo.
  assert.equal(media.link, null);
  assert.equal(media.text, 'https://blossom.example/vid https://blossom.example/pic.svg');
});

test('four photos at most, each once', () => {
  const urls = Array.from({ length: 6 }, (_, i) => `https://p.example/${i}.png`);
  const media = mediaIn([urls[0], ...urls].join(' '));
  assert.equal(media.images.length, 4);
  assert.equal(media.text, `${urls[4]} ${urls[5]}`);
});

test('only https addresses out on the internet are fetched', () => {
  for (const url of ['https://nostr.build/a.jpg', 'https://8.8.8.8/a.png', 'https://example.org:8443/x']) assert.ok(fetchable(url), url);
  for (const url of [
    'http://nostr.build/a.jpg',
    'https://localhost/a.png',
    'https://127.0.0.1/a.png',
    'https://192.168.178.1/router.png',
    'https://10.0.0.2/x',
    'https://172.20.1.1/x',
    'https://100.64.1.1/x',
    'https://169.254.1.1/x',
    'https://[::1]/x',
    'https://printer/x',
    'https://nas.local/x',
    'https://box.home.arpa/x',
    'file:///etc/passwd',
    `https://example.org/${'a'.repeat(3000)}`,
  ])
    assert.ok(!fetchable(url), url);
  // In a post, such an address stays words.
  assert.deepEqual(mediaIn('https://192.168.1.1/a.jpg').images, []);
});

test('a photo is known by its bytes', () => {
  assert.equal(imageType(JPEG), 'image/jpeg');
  assert.equal(imageType(PNG), 'image/png');
  assert.equal(imageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), null);
  assert.equal(imageType(new TextEncoder().encode('<html><head></head></html>')), null);
  assert.equal(siteOf('https://www.europesays.com/x'), 'europesays.com');
});

const post = (note: string, at: number): FeedPost => ({ id: note, note, by: 'a'.repeat(64), at, text: note });
const state = { userId: '@me:example.org', rooms: {} } as unknown as MatrixState;
function room(id: string, over: Partial<MatrixRoom>, messages: [string, number, Partial<MatrixRoom['messages'][number]>?][]): MatrixRoom {
  return { id, name: id.slice(1, 4), members: { '@me:example.org': { membership: 'join' } }, encrypted: false, direct: false, unread: 0, messages: messages.map(([mid, ts, more]) => ({ id: mid, sender: '@x:example.org', ts, text: mid, ...more })), ...over };
}

test('the public rooms we are in, their messages newest first', () => {
  state.rooms = {
    '!pub:matrix.org': room('!pub:matrix.org', { joins: 'public', alias: '#greece:matrix.org' }, [['$1', 100], ['$2', 300], ['$call', 310, { call: true }], ['$gone', 320, { deleted: true }], ['$t', 330, { thread: '$1' }], ['$photo', 340, { text: '', file: { kind: 'image', name: 'a.jpg', mime: 'image/jpeg' } }]]),
    '!priv:example.org': room('!priv:example.org', { joins: 'other' }, [['$p', 200]]),
    '!dm:example.org': room('!dm:example.org', { joins: 'public', direct: true }, [['$d', 250]]),
    '!space:example.org': room('!space:example.org', { joins: 'public', space: true }, [['$s', 260]]),
    '!unknown:example.org': room('!unknown:example.org', {}, [['$u', 270]]),
    '!asked:example.org': room('!asked:example.org', { joins: 'public', invitedBy: '@y:example.org' }, [['$i', 280]]),
  };
  assert.ok(isPublicRoom(state, state.rooms['!pub:matrix.org']));
  assert.equal(roomServer(state.rooms['!pub:matrix.org']), 'matrix.org');
  const items = matrixFeed(state);
  assert.deepEqual(
    items.map((item) => item.id),
    ['matrix:!pub:matrix.org:$photo', 'matrix:!pub:matrix.org:$2', 'matrix:!pub:matrix.org:$1'],
  );
  assert.equal(items[0].kind === 'matrix' && items[0].room, 'pub');
});

test('Nostr posts and Matrix messages in one list, in order as older posts come', () => {
  const matrix = [
    { kind: 'matrix' as const, id: 'matrix:r:$new', at: 500, roomId: 'r', room: 'r', server: 's', message: { id: '$new', sender: '@x:s', ts: 500, text: 'new' } },
    { kind: 'matrix' as const, id: 'matrix:r:$old', at: 50, roomId: 'r', room: 'r', server: 's', message: { id: '$old', sender: '@x:s', ts: 50, text: 'old' } },
  ];
  const posts = [post('p1', 600), post('p2', 300)];
  assert.deepEqual(mergeFeed(posts, matrix, 'all', true).map((item) => item.id), ['nostr:p1', 'matrix:r:$new', 'nostr:p2']);
  // No more posts to come: every message.
  assert.deepEqual(mergeFeed(posts, matrix, 'all', false).map((item) => item.id), ['nostr:p1', 'matrix:r:$new', 'nostr:p2', 'matrix:r:$old']);
  assert.deepEqual(mergeFeed(posts, matrix, 'nostr', true).map((item) => item.id), ['nostr:p1', 'nostr:p2']);
  assert.deepEqual(mergeFeed(posts, matrix, 'matrix', true).map((item) => item.id), ['matrix:r:$new', 'matrix:r:$old']);
  // No Nostr posts (yet): the messages show.
  assert.deepEqual(mergeFeed([], matrix, 'all', true).map((item) => item.id), ['matrix:r:$new', 'matrix:r:$old']);
});

test('photos are fetched by themselves, through Tor only, or when tapped, as the setting says', async () => {
  const asked: { way: string; url: string }[] = [];
  let through = false;
  const answer = (bytes: Uint8Array, status = 200): HttpAnswer => ({ status, bytes });
  const way = (name: string) => async (_method: HttpMethod, url: string): Promise<HttpAnswer> => {
    asked.push({ way: name, url });
    if (url.endsWith('.svg')) return answer(new TextEncoder().encode('<svg/>'));
    if (url.includes('/page')) return answer(new TextEncoder().encode('<html><head><title>T</title><meta property="og:title" content="A page &amp; more"><meta property="og:image" content="/pic.png"></head><body>'));
    if (url.includes('/missing')) return answer(new Uint8Array(0), 404);
    return answer(JPEG);
  };
  setPublicHttp({ http: way('net'), tor: way('tor'), through: () => through });
  try {
    assert.ok(fetchesByItself('always'));
    assert.ok(!fetchesByItself('tap'));
    assert.ok(!fetchesByItself('tor'));
    const got = await publicPhoto('https://p.example/a.jpg', 'always', 'show');
    assert.equal(got.mime, 'image/jpeg');
    // Asked once, however often it shows.
    await publicPhoto('https://p.example/a.jpg', 'always', 'show');
    assert.deepEqual(asked, [{ way: 'net', url: 'https://p.example/a.jpg' }]);
    await assert.rejects(publicPhoto('https://p.example/b.jpg', 'tap', 'show'));
    await assert.rejects(publicPhoto('https://p.example/b.jpg', 'tor', 'show'));
    assert.equal(asked.length, 1);
    // Tapped, it is fetched as the space's Tor way says.
    await publicPhoto('https://p.example/b.jpg', 'tor', 'tap');
    through = true;
    assert.ok(fetchesByItself('tor'));
    await publicPhoto('https://p.example/c.jpg', 'tor', 'show');
    assert.deepEqual(asked.slice(1), [{ way: 'net', url: 'https://p.example/b.jpg' }, { way: 'tor', url: 'https://p.example/c.jpg' }]);
    // Bytes that are no photo are not shown, whatever the address says; nor an address on the home network.
    await assert.rejects(publicPhoto('https://p.example/d.svg', 'always', 'show'));
    await assert.rejects(publicPhoto('https://192.168.1.1/a.jpg', 'always', 'tap'));
    await assert.rejects(publicPhoto('https://p.example/missing.jpg', 'always', 'show'));
    const card = await publicCard('https://site.example/page', 'always', 'show');
    assert.deepEqual(card, { url: 'https://site.example/page', site: 'site.example', title: 'A page & more', text: '', picture: 'https://site.example/pic.png' });
    // A page that says nothing of itself gives no card; neither does one not found.
    assert.equal(await publicCard('https://site.example/missing', 'always', 'show'), null);
    await assert.rejects(publicCard('https://site.example/page2', 'tap', 'show'));
  } finally {
    setPublicHttp(null);
  }
});

test('a photo or card fetched without Tor waits for the warning about the address, said once', async () => {
  const asked: string[] = [];
  let through = false;
  let answer = false;
  let asks = 0;
  const way = (name: string) => async (_method: HttpMethod, url: string): Promise<HttpAnswer> => {
    asked.push(`${name} ${url}`);
    return { status: 200, bytes: JPEG };
  };
  setPublicHttp({ http: way('net'), tor: way('tor'), through: () => through });
  setPublicIpAsk(async () => {
    asks += 1;
    return answer;
  });
  try {
    // Turned down: nothing fetched; by itself it does not ask again, a tap does.
    await assert.rejects(publicPhoto('https://p.example/1.jpg', 'always', 'show'));
    await assert.rejects(publicPhoto('https://p.example/2.jpg', 'always', 'show'));
    assert.equal(asks, 1);
    assert.deepEqual(asked, []);
    answer = true;
    await publicPhoto('https://p.example/2.jpg', 'always', 'tap');
    assert.equal(asks, 2);
    assert.deepEqual(asked, ['net https://p.example/2.jpg']);
    // Through Tor, nothing is asked.
    through = true;
    await publicPhoto('https://p.example/3.jpg', 'always', 'show');
    await publicPhoto('https://p.example/4.jpg', 'tor', 'show');
    assert.equal(asks, 2);
  } finally {
    setPublicIpAsk(null);
    setPublicHttp(null);
  }
});

test('an answer names the thread, the post answered and the people in it', () => {
  const me = 'f'.repeat(64);
  const root: NostrEvent = { id: '1'.repeat(64), pubkey: 'a'.repeat(64), created_at: 1, kind: 1, tags: [], content: 'root', sig: '' };
  assert.deepEqual(answerTags(root, me), [['e', root.id, '', 'root'], ['p', root.pubkey]]);
  const reply: NostrEvent = { ...root, id: '2'.repeat(64), pubkey: 'b'.repeat(64), tags: [['e', root.id, '', 'root'], ['p', root.pubkey], ['p', me]] };
  assert.deepEqual(answerTags(reply, me), [['e', root.id, '', 'root'], ['e', reply.id, '', 'reply'], ['p', reply.pubkey], ['p', root.pubkey]]);
});
