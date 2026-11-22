// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// What a message carries in the chats of Matrix, XMPP and Nostr: the look of a Matrix message's
// words as its HTML both ways (lib/matrix-html.ts), never showing HTML a sender wrote; contact
// cards as .vcf files, a Nostr place in its words, people named in a Nostr or XMPP group, and a
// video sent without what its file says of itself (lib/message-carry.ts).
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { after, before, test } from 'node:test';

import { cardOf } from '../lib/card-share';
import { setCore, type Core } from '../lib/core';
import { utf8Decode, utf8Encode } from '../lib/crypto';
import { joinRoom, sendChange, sendContent, sendText, setMatrixHttp, signIn, startChat, sync, type MatrixState } from '../lib/matrix';
import { decodeHtml, formattedOf, HTML_FORMAT, htmlOfParts, MOST_HTML, partsOfHtml, styledOf } from '../lib/matrix-html';
import { mimeOfName } from '../lib/matrix-media';
import { cardFile, cardsOfFile, cleanVideo, isCardFile, namesShown, placeOnly, placeWords, videoNamed, withNick, withNpubs } from '../lib/message-carry';
import { npubOf } from '../lib/nostr-dm';
import { placesIn } from '../lib/sms-parts';
import { styleText, type StyledPart } from '../lib/text-style';
import { EMPTY_FIELDS } from '../lib/contacts';
import { Homeserver, HS, PASSWORD } from './matrix-server';

const looks = (parts: StyledPart[] | null) => (parts ?? []).map((part) => [part.text, Object.keys(part.look).sort().join('+')]);
const read = (html: string) => looks(partsOfHtml(html));

test('marks typed go as the HTML Element and the other Matrix apps show', () => {
  assert.equal(htmlOfParts(styleText('*bold* and _it_ ~gone~ `x < y`')), '<strong>bold</strong> and <em>it</em> <del>gone</del> <code>x &lt; y</code>');
  assert.equal(htmlOfParts(styleText('see ||the end|| now')), 'see <span data-mx-spoiler>the end</span> now');
  assert.equal(htmlOfParts(styleText('_both *at once*_')), '<em>both </em><strong><em>at once</em></strong>');
  // A block of code stands on lines of its own; other lines break with <br>.
  assert.equal(htmlOfParts(styleText('look:\n```\nlet a = 1;\nlet b = "2";\n```\ndone & *gone*')), 'look:<pre><code>let a = 1;\nlet b = &quot;2&quot;;</code></pre>done &amp; <strong>gone</strong>');
  // Words with no mark go with no HTML; a web address keeps its marks as typed.
  assert.deepEqual(formattedOf('just words, 2*3*4 and https://example.org/_a_'), {});
  assert.deepEqual(formattedOf('*hi* <b>'), { format: HTML_FORMAT, formatted_body: '<strong>hi</strong> &lt;b&gt;' });
});

test('the HTML read back shows as the marks typed did', () => {
  const texts = [
    '*bold* and _it_ ~gone~ `code`',
    '_both *at once*_ then plain',
    'a line\nand *another*\n\n\nafter blank lines',
    'see ||the end|| and ||two\nlines||',
    'look:\n```\nlet a = 1;\nlet b = 2;\n```\ndone',
    '*https://example.org/x_y* and <tags> & "quotes" it\'s',
    'Ελληνικά *έντονα* και _πλάγια_',
  ];
  for (const text of texts) {
    const parts = styleText(text);
    assert.deepEqual(partsOfHtml(htmlOfParts(parts)), parts, text);
  }
});

test('what Element and the others send shows with its look, and what an answer quotes is left out', () => {
  assert.deepEqual(read('<strong>bold</strong> and <em>it</em> <del>x</del> <s>y</s> <code>c</code>'), [
    ['bold', 'bold'],
    [' and ', ''],
    ['it', 'italic'],
    [' ', ''],
    ['x', 'strike'],
    [' ', ''],
    ['y', 'strike'],
    [' ', ''],
    ['c', 'code'],
  ]);
  assert.deepEqual(read('<pre><code class="language-js">let a = 1;\nlet b;\n</code></pre>\n<p>after</p>\n'), [
    ['let a = 1;\nlet b;', 'code'],
    ['\n\nafter', ''],
  ]);
  assert.deepEqual(read('<mx-reply><blockquote><a href="https://matrix.to/#/!r:x/$e">In reply to</a> <a href="https://matrix.to/#/@a:x">@a:x</a><br><b>quoted</b></blockquote></mx-reply><em>the answer</em>'), [['the answer', 'italic']]);
  assert.deepEqual(read('<p>One <b>two</b></p>\n<ul>\n<li>first</li>\n<li><i>second</i></li>\n</ul>\n<ol start="3"><li>three</li><li>four</li></ol>'), [
    ['One ', ''],
    ['two', 'bold'],
    ['\n\n• first\n• ', ''],
    ['second', 'italic'],
    ['\n3. three\n4. four', ''],
  ]);
  assert.deepEqual(read('<blockquote>\n<p>what <b>they</b> said</p>\n</blockquote>\n<p>and mine</p>'), [
    ['> what ', ''],
    ['they', 'bold'],
    [' said\n\nand mine', ''],
  ]);
  // Spoilers each apart, a reason or not; a person named by their name only; a link with words says where it goes.
  const hidden = partsOfHtml('<span data-mx-spoiler="why">one</span> and <span data-mx-spoiler>two</span>')!;
  assert.deepEqual(
    hidden.map((part) => [part.text, part.spoiler]),
    [
      ['one', 0],
      [' and ', undefined],
      ['two', 1],
    ],
  );
  assert.deepEqual(read('<a href="https://matrix.to/#/@ann:example.org">Ann</a>: <b>hi</b>'), [
    ['Ann: ', ''],
    ['hi', 'bold'],
  ]);
  assert.deepEqual(read('<b>see</b> <a href="https://example.org/page">this page</a> and <a href="https://example.org">https://example.org</a>'), [
    ['see', 'bold'],
    [' this page (https://example.org/page) and https://example.org', ''],
  ]);
  // A custom emoji is its words; its picture is never fetched.
  assert.deepEqual(read('<b>yes</b> <img data-mx-emoticon src="mxc://x/y" alt=":blob:" height="32">'), [
    ['yes', 'bold'],
    [' :blob:', ''],
  ]);
  // HTML with no look shows its body as it is; but a link whose words do not say where it goes is
  // read, for the body may be its words alone (FluffyChat), and where it goes is said after them.
  assert.equal(partsOfHtml('<p>just <a href="https://example.org">https://example.org</a></p>'), null);
  assert.deepEqual(read('<p>just <a href="https://example.org">words</a></p>'), [['just words (https://example.org)', '']]);
  // A bare address with a known ending ("example.org") is tappable and opens there (lib/links.ts): enough.
  assert.equal(partsOfHtml('see <a href="https://example.org/">example.org</a>'), null);
  // One that does not open as one ("example.invalid") is not.
  assert.deepEqual(read('see <a href="https://example.invalid/">example.invalid</a>'), [['see example.invalid (https://example.invalid/)', '']]);
  // Nor words that open somewhere else than the link: what it opens is always said.
  assert.deepEqual(read('see <a href="https://example.org/">www.example.org</a>'), [['see www.example.org (https://example.org/)', '']]);
  assert.deepEqual(read('<a href="https://evil.example">https://bank.example</a>'), [['https://bank.example (https://evil.example)', '']]);
  assert.equal(partsOfHtml('see <a href="https://www.example.org/">www.example.org</a>'), null);
  assert.equal(styledOf({ msgtype: 'm.text', body: '*x*' }), null);
  assert.deepEqual(looks(styledOf({ msgtype: 'm.text', body: '**x**', format: HTML_FORMAT, formatted_body: '<strong>x</strong>' })), [['x', 'bold']]);
  assert.equal(styledOf({ msgtype: 'm.text', body: 'x', format: 'text/markdown', formatted_body: '<strong>x</strong>' }), null);
});

test('HTML meant to harm shows as words, or not at all: nothing runs, nothing is fetched', () => {
  assert.deepEqual(read('<script>alert(1)</script><b>safe</b><script src="https://evil.example/x.js"></script>'), [['safe', 'bold']]);
  assert.deepEqual(read('<style>body { background: url(https://evil.example/t.png) }</style><i>styled</i>'), [['styled', 'italic']]);
  assert.deepEqual(read('<b>x</b><img src="https://evil.example/track.png" onerror="alert(1)"><iframe src="https://evil.example"></iframe>'), [['x', 'bold']]);
  // A script's inside is never read as HTML, whatever it holds.
  assert.deepEqual(read('<SCRIPT>document.write("<b>not shown</b>")</SCRIPT ><b>shown</b>'), [['shown', 'bold']]);
  // A link that is not a web address says nowhere it goes, and is not one to tap.
  assert.deepEqual(read('<b>a</b> <a href="javascript:alert(1)">click</a> <a href="data:text/html,x">me</a>'), [
    ['a', 'bold'],
    [' click me', ''],
  ]);
  // Tags written as words stay words; character references are read once, never into tags.
  assert.deepEqual(read('<em>&lt;script&gt;alert(1)&lt;/script&gt; &amp;lt;b&amp;gt; &#65;&#x42; &#0; &#xD800; &nosuch;</em>'), [['<script>alert(1)</script> &lt;b&gt; AB \ufffd \ufffd &nosuch;', 'italic']]);
  assert.equal(decodeHtml('a&nbsp;b'), 'a\u00a0b');
  // Left out with all inside, nested or not: SVG, forms of input, what an answer quotes.
  assert.deepEqual(read('<svg><svg><text>x</text></svg><text>y</text></svg><b>z</b><button>press</button>'), [['z', 'bold']]);
  // Broken or endless HTML: what can be read, read once, quickly.
  assert.deepEqual(read('<b>unclosed <i>both'), [
    ['unclosed ', 'bold'],
    ['both', 'bold+italic'],
  ]);
  assert.deepEqual(read('<b>a</b><b'), [['a', 'bold']]);
  assert.deepEqual(read('<b>a < b</b> <<>> <1>'), [
    ['a < b', 'bold'],
    [' <<>> <1>', ''],
  ]);
  assert.equal(partsOfHtml(`<b>${'x'.repeat(MOST_HTML)}</b>`), null);
  const started = Date.now();
  for (const hostile of [
    '<b>'.repeat(8000),
    '<a '.repeat(10_000),
    `<b>x</b>${'<a href="'.repeat(4000)}`,
    `<b>x</b><!--${'-'.repeat(30_000)}`,
    `<b>x</b>${'<i>a</i>b'.repeat(3000)}`,
    `<b>x</b>${'&#1;'.repeat(7000)}`,
    `<b>x</b>${'<li>'.repeat(6000)}`,
  ]) {
    partsOfHtml(hostile.slice(0, MOST_HTML));
  }
  assert.ok(Date.now() - started < 3000, 'read in one pass');
  // Too many runs: its body shows instead.
  assert.equal(partsOfHtml(`<b>x</b>${'<i>a</i>b'.repeat(2500)}`), null);
});

test('a contact card goes as a .vcf file and shows as a card, its name, numbers and emails only', () => {
  for (const [name, mime] of [
    ['Anna.vcf', 'application/octet-stream'],
    ['card', 'text/vcard'],
    ['x', 'text/x-vcard; charset=utf-8'],
    ['old.VCARD', ''],
    ['list', 'text/directory'],
  ]) {
    assert.ok(isCardFile(name, mime), `${name} ${mime}`);
  }
  for (const [name, mime] of [
    ['photo.jpg', 'image/jpeg'],
    ['notes.txt', 'text/plain'],
    ['vcf', 'application/pdf'],
  ]) {
    assert.ok(!isCardFile(name, mime), `${name} ${mime}`);
  }
  assert.equal(mimeOfName('Anna.vcf'), 'text/vcard');
  const card = cardOf({ ...EMPTY_FIELDS, given: 'Άννα', family: 'Π/Q', name: 'Άννα Π/Q', phones: [{ value: '+30 210 1234567', kind: 'mobile', label: '' }], emails: [{ value: 'anna@example.org', kind: 'home', label: '' }], note: 'kept here' })!;
  const file = cardFile(card);
  assert.equal(file.name, 'Άννα Π Q.vcf');
  assert.equal(file.mime, 'text/vcard');
  assert.equal(utf8Decode(file.bytes), card);
  assert.ok(!card.includes('kept here'));
  const shown = cardsOfFile(file.bytes);
  assert.equal(shown.length, 1);
  assert.match(shown[0], /FN:Άννα Π\/Q/);
  assert.match(shown[0], /\+30 210 1234567/);
  // A file of several shows the first few; a photo or a note in it is left out; one that is not a card shows none.
  const many = utf8Encode(
    Array.from({ length: 5 }, (_, i) => `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Person ${i}\r\nTEL:+3069000000${i}\r\nNOTE:secret\r\nPHOTO;ENCODING=b;TYPE=JPEG:/9j/AAAA\r\nEND:VCARD\r\n`).join(''),
  );
  const three = cardsOfFile(many);
  assert.equal(three.length, 3);
  assert.ok(three.every((one) => !one.includes('secret') && !one.includes('PHOTO')));
  assert.deepEqual(cardsOfFile(utf8Encode('<html>not a card</html>')), []);
});

test('a place in a Nostr chat goes as its geo: address and a map link, and shows as a place', () => {
  const place = { lat: 37.97536, lon: 23.73495, acc: 12 };
  const words = placeWords(place);
  assert.equal(words, 'geo:37.97536,23.73495;u=12\nhttps://www.openstreetmap.org/?mlat=37.97536&mlon=23.73495#map=17/37.97536/23.73495');
  assert.deepEqual(placeOnly(words), place);
  assert.deepEqual(placeOnly('  geo:-33.8688,151.2093  '), { lat: -33.8688, lon: 151.2093 });
  // Words besides a place show as they are, with the place under them.
  assert.equal(placeOnly(`meet here ${words}`), null);
  assert.deepEqual(placesIn(`meet here ${words}`), [place]);
  assert.equal(placeOnly('geo:999,999'), null);
  assert.equal(placeOnly('https://www.openstreetmap.org/?mlat=1&mlon=2'), null);
});

test('people named in a Nostr group go as nostr:npub1… and show by their names; an XMPP group writes the name they have there', () => {
  const anna = 'a'.repeat(64);
  const annaMaria = 'b'.repeat(64);
  const members = [
    { identity: anna, name: 'Anna' },
    { identity: annaMaria, name: 'Anna Maria' },
  ];
  const sent = withNpubs('hi @Anna Maria and @Anna, not mail@Anna or @Annabel', members);
  assert.equal(sent, `hi nostr:${npubOf(annaMaria)} and nostr:${npubOf(anna)}, not mail@Anna or @Annabel`);
  assert.equal(withNpubs('no one named', members), 'no one named');
  assert.equal(namesShown(sent, members), 'hi @Anna Maria and @Anna, not mail@Anna or @Annabel');
  // Someone not in the chat, or a note, shows short.
  const stranger = npubOf('c'.repeat(64));
  assert.equal(namesShown(`ask nostr:${stranger}`, members), `ask ${stranger.slice(0, 10)}…${stranger.slice(-4)}`);
  assert.equal(withNick('@Ka', 'Kate'), 'Kate: ');
  assert.equal(withNick('thanks @Ka', 'Kate'), 'thanks Kate ');
});

// An MP4 box: its size, its kind, what it holds.
function box(kind: string, ...inside: Uint8Array[]): Uint8Array {
  const size = 8 + inside.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(size);
  new DataView(out.buffer).setUint32(0, size);
  out.set(utf8Encode(kind), 4);
  let at = 8;
  for (const part of inside) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

test('a video goes without where it was filmed or on what, and nothing else in it moves', () => {
  const where = box('udta', box('©xyz'.replace('©', 'A'), utf8Encode('+37.9753+023.7349/')));
  const video = box('x', box('ftyp', utf8Encode('isom')), box('moov', box('mvhd', new Uint8Array(4)), where, box('trak', box('tkhd', new Uint8Array(4)), box('meta', utf8Encode('Pixel')))), box('mdat', utf8Encode('the picture')));
  const file = video.subarray(8);
  const clean = cleanVideo(file);
  assert.equal(clean.length, file.length);
  const text = (bytes: Uint8Array) => String.fromCharCode(...bytes);
  assert.ok(!text(clean).includes('udta') && !text(clean).includes('meta'));
  // Emptied, not only renamed: where it was filmed and the phone are no longer in its bytes.
  assert.ok(!text(clean).includes('+37.9753') && !text(clean).includes('Pixel'));
  assert.equal(text(clean).split('free').length - 1, 2);
  assert.ok(text(clean).includes('the picture') && text(clean).includes('mvhd'));
  // The file picked is left as it was; one that is not an MP4 goes as it is.
  assert.ok(text(file).includes('udta'));
  const webm = utf8Encode('\u001aEß£ webm');
  assert.equal(cleanVideo(webm), webm);
  assert.deepEqual(videoNamed('video/quicktime'), { name: 'video.mov', mime: 'video/quicktime' });
  assert.deepEqual(videoNamed(''), { name: 'video.mp4', mime: 'video/mp4' });
});

// --- With a homeserver: the look goes inside the encryption, comes, changes and stays. ----------

const built = new URL('./.core/erevos_ffi.js', import.meta.url);
const coreReady = existsSync(built) && typeof (createRequire(import.meta.url)(built.pathname) as Record<string, unknown>).matrix === 'function';
const server = new Homeserver();
const kept = (state: MatrixState): MatrixState => JSON.parse(JSON.stringify(state)) as MatrixState;

before(() => {
  if (!coreReady) return;
  const wasm = createRequire(import.meta.url)(built.pathname) as Record<string, (...args: never[]) => unknown>;
  setCore(Object.fromEntries(Object.entries(wasm).map(([name, fn]) => [name, async (...args: never[]) => fn(...args)])) as unknown as Core);
  setMatrixHttp(async (request) => server.answer(request));
});

after(() => setCore(null));

test('a Matrix message goes with its look, which shows on the other side; a change changes it; a mark of ours stays', { skip: !coreReady }, async () => {
  let ann = kept(await signIn(HS, 'cara', PASSWORD));
  let ben = kept(await signIn(HS, 'dan', PASSWORD));
  const room = (await startChat(ann, ben.userId)).id;
  await sync(ben, 0);
  await joinRoom(ben, room);
  await sync(ben, 0);
  await sync(ann, 0);
  const both = async () => {
    await sync(ann, 0);
    await sync(ben, 0);
    ann = kept(ann);
    ben = kept(ben);
  };
  const first = await sendText(ann, room, '*bold* and ||hidden||');
  first.forwarded = true;
  await both();
  const theirs = ben.rooms[room].messages.find((m) => m.id === first.id)!;
  assert.equal(theirs.text, '*bold* and ||hidden||');
  assert.deepEqual(looks(theirs.styled!), [
    ['bold', 'bold'],
    [' and ', ''],
    ['hidden', 'hidden'],
  ]);
  // Ours, as the homeserver sent it back: still marked, on this phone only.
  const ours = ann.rooms[room].messages.find((m) => m.id === first.id)!;
  assert.equal(ours.forwarded, true);
  assert.equal(theirs.forwarded, undefined);

  // Changed to words with no marks: no look on either side.
  await sendChange(ann, room, first.id, 'plain now');
  await both();
  for (const state of [ann, ben]) {
    const shown = state.rooms[room].messages.find((m) => m.id === first.id)!;
    assert.deepEqual([shown.text, shown.styled], ['plain now', undefined]);
  }

  // What another app sends: its HTML read safely, its body kept for copying.
  await sendContent(ben, room, { msgtype: 'm.text', body: '**hi** <script>', format: HTML_FORMAT, formatted_body: '<strong>hi</strong> &lt;script&gt;<script>alert(1)</script><img src="https://evil.example/x.png">' });
  await both();
  const came = ann.rooms[room].messages.at(-1)!;
  assert.equal(came.text, '**hi** <script>');
  assert.deepEqual(looks(came.styled!), [
    ['hi', 'bold'],
    [' <script>', ''],
  ]);
});
