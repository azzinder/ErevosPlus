// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The user guide, checked the way LPHL FASOULI's guide.test.ts checks its own.
// Run with: npm run check
/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { GUIDE_LANGS, GUIDE_SOURCES, guideFor } from '../guide/index';
import { DE } from '../i18n/de/index';
import { EL } from '../i18n/el/index';
import { ES } from '../i18n/es/index';
import { FR } from '../i18n/fr/index';
import { IT } from '../i18n/it/index';
import { PT } from '../i18n/pt/index';
import { SH } from '../i18n/sh/index';
import { blockTexts, editionSource, parseGuide, parseInline, searchGuide, type GuideBlock } from '../lib/guide';
import { LANGS } from '../lib/i18n';

const WORDS: Record<string, Record<string, string>> = { de: DE, el: EL, es: ES, fr: FR, it: IT, pt: PT, sh: SH };

const SAMPLE = `
## First {#first}

A paragraph that goes on
on the next line.

### A heading

- One item
  that continues.
- Two
  - a sub-item
    that continues
1. Step one
2. Step two
   continued.

| A | B |
| --- | --- |
| 1 | 2 |
| 3 | |

> A note
> on two lines.

## Second {#second}

Text with **bold**, \`code\`, [a link](#first) and [a page](https://example.com).
`;

test('the guide format reads sections, blocks and lines that continue', () => {
  const [first, second] = parseGuide(SAMPLE);
  assert.equal(first.id, 'first');
  assert.equal(first.title, 'First');
  assert.deepEqual<GuideBlock[]>(first.blocks, [
    { kind: 'paragraph', text: 'A paragraph that goes on on the next line.' },
    { kind: 'heading', text: 'A heading' },
    {
      kind: 'bullets',
      items: [
        { text: 'One item that continues.', sub: [] },
        { text: 'Two', sub: ['a sub-item that continues'] },
      ],
    },
    { kind: 'steps', items: ['Step one', 'Step two continued.'] },
    { kind: 'table', head: ['A', 'B'], rows: [['1', '2'], ['3', '']] },
    { kind: 'note', text: 'A note on two lines.' },
  ]);
  assert.equal(second.id, 'second');
  assert.throws(() => parseGuide('## No id\n\nText'), /id/);
  assert.throws(() => parseGuide('Text\n\n## Title {#a}'), /before/);
  assert.deepEqual(parseInline('Text with **bold**, `code`, [a link](#first) and [a page](https://example.com).'), [
    { text: 'Text with ' },
    { text: 'bold', bold: true },
    { text: ', ' },
    { text: 'code', code: true },
    { text: ', ' },
    { text: 'a link', link: '#first' },
    { text: ' and ' },
    { text: 'a page', link: 'https://example.com' },
    { text: '.' },
  ]);
});

/** The shape of a block, without its words: the same in every language. */
function shape(block: GuideBlock): string {
  switch (block.kind) {
    case 'bullets':
      return `bullets:${block.items.map((i) => i.sub.length).join(',')}`;
    case 'steps':
      return `steps:${block.items.length}`;
    case 'table':
      return `table:${block.head.length}x${block.rows.length}:${block.rows.map((r) => r.length).join(',')}`;
    default:
      return block.kind;
  }
}

function inlineTexts(block: GuideBlock): string[] {
  switch (block.kind) {
    case 'bullets':
      return block.items.flatMap((i) => [i.text, ...i.sub]);
    case 'steps':
      return block.items;
    case 'table':
      return [...block.head, ...block.rows.flat()];
    default:
      return [block.text];
  }
}

const el = guideFor('el');
const en = guideFor('en');
/** The guide in every language it is written in: all of the app's. */
const all = GUIDE_LANGS.map((lang) => [lang, guideFor(lang)] as const);

test('the guide is in every language of the app', () => {
  assert.deepEqual([...GUIDE_LANGS].sort(), [...LANGS].sort());
});

test('the guide has the same sections, in the same order and shape, in every language', () => {
  assert.ok(en.length >= 12);
  assert.equal(new Set(en.map((s) => s.id)).size, en.length);
  for (const [lang, sections] of all) {
    assert.deepEqual(
      sections.map((s) => s.id),
      en.map((s) => s.id),
      lang,
    );
    sections.forEach((section, i) => {
      assert.deepEqual({ lang, id: section.id, blocks: section.blocks.map(shape) }, { lang, id: section.id, blocks: en[i].blocks.map(shape) });
    });
  }
});

test("the plain Erevos's guide leaves out what only Erevos+ has, the same in every language", () => {
  const liteEn = guideFor('en', 'erevos');
  for (const lang of GUIDE_LANGS) {
    const lite = guideFor(lang, 'erevos');
    assert.deepEqual(
      lite.map((s) => ({ id: s.id, blocks: s.blocks.map(shape) })),
      liteEn.map((s) => ({ id: s.id, blocks: s.blocks.map(shape) })),
      lang,
    );
    // Matrix is also a style (Appearance), the About credits name the libraries, and Updates tells the editions apart.
    const said = lite
      .filter((s) => !['about', 'appearance', 'updates'].includes(s.id))
      .flatMap((s) => s.blocks.flatMap(blockTexts).filter((t) => /Matrix|XMPP/.test(t)).map((t) => `${lang} ${s.id}: ${t.slice(0, 120)}`));
    assert.deepEqual(said, [], lang);
    for (const edition of ['plus', 'erevos', 'lite'] as const) {
      const left = guideFor(lang, edition).flatMap((s) => s.blocks.flatMap(blockTexts)).filter((t) => /\{[+-]|\[\+\]/.test(t));
      assert.deepEqual(left, [], `${lang} ${edition}`);
    }
  }
});

test('the marks of the editions: Erevos+ reads the text without them, the plain Erevos without what they keep for Erevos+', () => {
  const source = 'A{+ and B}{- alone}.\n\n- [+] Plus only\n  goes on\n  - and its sub-item\n- Both\n\n[+] A paragraph\nof Erevos+.\n\n| a |\n| --- |\n| [+] b |\n| c |';
  assert.equal(editionSource(source, 'plus'), 'A and B.\n\n- Plus only\n  goes on\n  - and its sub-item\n- Both\n\nA paragraph\nof Erevos+.\n\n| a |\n| --- |\n| b |\n| c |');
  assert.equal(editionSource(source, 'erevos'), 'A alone.\n\n- Both\n\n\n| a |\n| --- |\n| c |');
  // Erevos Lite has none of the other networks either.
  assert.equal(editionSource(source, 'lite'), editionSource(source, 'erevos'));
});

test('the guide links only to sections that exist, the same ones in every language, and leaves no mark unread', () => {
  const ids = new Set(en.map((s) => s.id));
  const unread: string[] = [];
  for (const [lang, sections] of all) {
    for (const section of sections) {
      for (const text of section.blocks.flatMap(inlineTexts)) {
        for (const span of parseInline(text)) {
          if (span.link?.startsWith('#')) assert.ok(ids.has(span.link.slice(1)), `${section.id}: ${span.link}`);
          else if (span.link) assert.match(span.link, /^https:\/\//);
          if (/\*\*|`|\]\(/.test(span.text)) unread.push(`${lang} ${section.id}: ${span.text}`);
        }
      }
    }
  }
  assert.deepEqual(unread, []);
  const links = (sections: typeof el) =>
    sections.map((s) => s.blocks.flatMap(inlineTexts).flatMap((t) => parseInline(t).flatMap((sp) => (sp.link ? [sp.link] : []))));
  for (const [lang, sections] of all) assert.deepEqual(links(sections), links(en), lang);
});

test('the guide says plainly what is end-to-end encrypted, and that nothing is audited', () => {
  const about = (sections: typeof el) => sections.find((s) => s.id === 'about')!.blocks.flatMap(blockTexts).join(' ');
  assert.match(about(en), /Messages are end-to-end encrypted, through a relay and nearby alike/);
  assert.match(about(en), /nothing has been audited/);
  assert.match(about(el), /Τα μηνύματα είναι κρυπτογραφημένα από άκρη σε άκρη, μέσω relay και από κοντά/);
  assert.match(about(el), /τίποτα δεν έχει ελεγχθεί/);
  // Nowhere does either still say the nearby link is plain.
  for (const sections of [en, el]) {
    const all = sections.flatMap((s) => s.blocks.flatMap(blockTexts)).join(' ');
    assert.doesNotMatch(all, /not encrypted yet|δεν κρυπτογραφούνται ακόμα|Χωρίς κρυπτογράφηση ακόμα/);
  }
});

test('the guide is searched ignoring case and accents, titles first', () => {
  const hidden = searchGuide(el, 'ΚΡΥΦΕΣ');
  assert.equal(hidden[0].section.id, 'hidden');
  assert.equal(hidden[0].snippet, null);
  assert.ok(hidden.length > 2);
  const deep = searchGuide(en, 'safety number');
  assert.ok(deep.map((h) => h.section.id).includes('relay'));
  assert.ok(deep.find((h) => h.section.id === 'faq')?.snippet?.toLowerCase().includes('safety number'));
  // Each guide names the buttons as the app shows them in its language.
  for (const [lang, sections] of all) {
    for (const button of ['Delete messages', 'Rename', 'Both phones']) {
      const words = lang === 'en' ? button : WORDS[lang][button];
      assert.ok(searchGuide(sections, words).some((h) => h.section.id === 'relay'), `${lang}: ${words}`);
    }
  }
  assert.deepEqual(searchGuide(en, '  '), []);
  assert.deepEqual(searchGuide(en, 'zzzz-nothing'), []);
  for (const hit of searchGuide(el, 'κωδικός')) if (hit.snippet) assert.ok(hit.snippet.length <= 112);
  for (const s of en) for (const b of s.blocks) assert.ok(blockTexts(b).join('').length > 0);
});

test('no list marker is left inside a step, an item or a note', () => {
  for (const [lang, sections] of all) {
    for (const section of sections) {
      for (const block of section.blocks) {
        for (const text of blockTexts(block)) assert.doesNotMatch(text, / - \*\*|^- /, `${lang} ${section.id}: ${text}`);
      }
    }
  }
});

test("Erevos Lite's guide says nothing of what it has not: no link to a section it leaves out, no SMS, no Collection, no Fasouli's payment requests", () => {
  for (const lang of GUIDE_LANGS) {
    const sections = guideFor(lang, 'lite');
    // Sections, and the headings inside them that have an id of their own ("### … {#id}").
    const ids = new Set([...sections.map((s) => s.id), ...sections.flatMap((s) => s.blocks.flatMap((b) => (b.kind === 'heading' ? [/\{#([a-z0-9-]+)\}$/.exec(b.text)?.[1] ?? ''] : [])))]);
    for (const gone of ['sms', 'phone', 'collection', 'modules']) assert.ok(!ids.has(gone), `${lang} ${gone}`);
    // The Collection and the Modules as this language's guide titles them.
    const titled = (id: string) => new RegExp(`^##\\s+(.+?)\\s*\\{#${id}\\}`, 'm').exec(GUIDE_SOURCES[lang])![1];
    const named = new RegExp(`(?<!\\p{L})(?:${[titled('collection'), titled('modules')].map((t) => t.slice(0, -2)).join('|')})`, 'u');
    for (const section of sections) {
      for (const raw of section.blocks.flatMap(inlineTexts)) {
        const text = raw.replace(/\s*\{#[a-z0-9-]+\}$/, '');
        for (const span of parseInline(text)) if (span.link?.startsWith('#')) assert.ok(ids.has(span.link.slice(1)), `${lang} ${section.id}: ${span.link}`);
        // Updates names the three editions, each with what it has.
        if (section.id === 'updates' && /Erevos Lite/.test(text) && /3\.0\.x/.test(text)) continue;
        assert.doesNotMatch(text, /\bSMS\b|\bMMS\b|\[~\]|[{}]/, `${lang} ${section.id}: ${text}`);
        assert.doesNotMatch(text, named, `${lang} ${section.id}: ${text}`);
      }
      assert.ok(section.blocks.length > 0, `${lang} ${section.id}`);
    }
    // The payment requests are in the plain Erevos's, unmarked.
    const plain = guideFor(lang, 'erevos').flatMap((s) => s.blocks.flatMap(inlineTexts)).join(' ');
    assert.match(plain, /Fasouli\)/, lang);
    assert.doesNotMatch(plain, /\[~\]|\{~/, lang);
    assert.doesNotMatch(sections.flatMap((s) => s.blocks.flatMap(inlineTexts)).join(' '), /Fasouli\)/, lang);
  }
});

test("Erevos Lite's guide keeps what it has: in every language the same parts as in English, and these in English", () => {
  const shape = (lang: (typeof GUIDE_LANGS)[number]) =>
    guideFor(lang, 'lite').map((s) => `${s.id}: ${s.blocks.map((b) => (b.kind === 'bullets' ? `b${b.items.map((i) => i.sub.length).join('')}` : b.kind === 'steps' ? `s${b.items.length}` : b.kind === 'table' ? `t${b.rows.length}` : b.kind[0])).join(' ')}`);
  for (const lang of GUIDE_LANGS) assert.deepEqual(shape(lang), shape('en'), lang);
  const text = (id: string) => guideFor('en', 'lite').find((s) => s.id === id)!.blocks.flatMap(inlineTexts).join(' ');
  const kept: [string, RegExp][] = [
    ['start', /The home screen is the list of your chats/],
    ['start', /\*\*Pinned and archived:\*\*/],
    ['start', /\*\*Mark all as read\*\*/],
    ['start', /\*\*Search the settings,\*\*/],
    ['start', /\*\*The widget\*\*, on Android: add Erevos from your home screen's widgets\. Its two buttons/],
    ['relay', /Open a chat, tap its name and then \*\*Disappearing messages\*\*/],
    ['relay', /\*\*Block contact\*\*/],
    ['relay', /\*\*Star:\*\*/],
    ['relay', /\*\*Photo to see once:\*\*/],
    ['relay', /\*\*Share from another app\*\*/],
    ['relay', /\*\*Permissions \(Android\):\*\*/],
    ['relay', /\*\*A plain call on the mobile network:\*\*/],
    ['tor', /\*\*What it does not cover:\*\*/],
    ['ip', /\*\*Backups, link previews and updates:\*\*/],
    ['paths', /\*\*Ways\*\*, under/],
    ['new-phone', /Everything Erevos keeps goes to a new phone/],
    ['new-phone', /\*\*On the new phone, restore:\*\*/],
    ['appearance', /\*\*Launcher icons\*\*/],
    ['appearance', /\*\*Dots and numbers on the icons\*\*/],
    ['appearance', /\*\*Calculator in place of Erevos\*\*/],
    ['updates', /\*\*Next update\*\*/],
    ['privacy', /\*\*The phone's contacts\*\*/],
    ['privacy', /\*\*Contacts kept only in Erevos\*\*/],
    ['contacts', /\*\*A contact:\*\*/],
    ['contacts', /\*\*History:\*\*/],
    ['backup', /\*\*What takes room:\*\*/],
    ['backup', /\*\*What never comes back:\*\*/],
    ['hidden', /\*\*Relay, Nostr and phones nearby:\*\*/],
  ];
  for (const [id, what] of kept) assert.match(text(id), what, `${id}: ${what}`);
  // It has not the Phone's permission to read the call log: a contact's history is its messages alone.
  assert.match(text('contacts'), /\*\*History:\*\* a contact's card lists its messages in Erevos, the newest first; tap one to open the chat\./);
  const gone: [string, RegExp][] = [
    ['contacts', /Show calls/],
    ['contacts', /call back/],
    ['privacy', /\*\*Phone calls\*\*/],
    ['privacy', /only to show its history/],
  ];
  for (const [id, what] of gone) assert.doesNotMatch(text(id), what, `${id}: ${what}`);
});

test('a list item marked [~] is left out of Erevos Lite alone, with what continues it', () => {
  const source = '- Both\n- [~] Not in Lite\n  goes on\n- Both again';
  assert.equal(editionSource(source, 'erevos'), '- Both\n- Not in Lite\n  goes on\n- Both again');
  assert.equal(editionSource(source, 'plus'), '- Both\n- Not in Lite\n  goes on\n- Both again');
  assert.equal(editionSource(source, 'lite'), '- Both\n- Both again');
});

test('a table row marked [~] is left out of Erevos Lite alone, and the rows after it stay', () => {
  const source = '| a | b |\n| --- | --- |\n| one | 1 |\n[~] | two | 2 |\n| three | 3 |\n\nAfter.';
  assert.equal(editionSource(source, 'erevos'), '| a | b |\n| --- | --- |\n| one | 1 |\n| two | 2 |\n| three | 3 |\n\nAfter.');
  assert.equal(editionSource(source, 'lite'), '| a | b |\n| --- | --- |\n| one | 1 |\n| three | 3 |\n\nAfter.');
});
