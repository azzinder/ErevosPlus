// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

/**
 * The user guide (Home → User guide), as in LPHL FASOULI, is written in a small part of Markdown
 * (guide/*), read here:
 *
 *   ## Section title {#id}     a section, opened on its own screen
 *   ### Heading                a heading inside it
 *   - item / "  - sub-item"    a list (one level of sub-items)
 *   1. step                    numbered steps
 *   | a | b |                  a table; its first row is the head, `| --- |` rows are skipped
 *   > text                     a note
 *   anything else              a paragraph
 *
 * Lines that follow without a blank line continue the paragraph, item, step or
 * note above (indented, for items and steps). Inside a line: **bold**, `code`,
 * [a section](#id) and [a page](https://…).
 */
export type GuideBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullets'; items: { text: string; sub: string[] }[] }
  | { kind: 'steps'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'note'; text: string };

export interface GuideSection {
  id: string;
  title: string;
  blocks: GuideBlock[];
}

/** A piece of a line, as it is shown. */
export interface Span {
  text: string;
  bold?: boolean;
  code?: boolean;
  /** "#id" for a section of the guide, otherwise a web address. */
  link?: string;
}

const SECTION = /^##\s+(.+?)\s*\{#([a-z0-9-]+)\}\s*$/;

function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

/**
 * The guide's text for one edition (lib/edition.ts). Erevos+ has networks the plain Erevos has not,
 * and Erevos Lite has not the Phone, the SMS, the Collection or the Modules, so the sources mark
 * what only some of them say:
 *
 *   {+text}            only in Erevos+ (inside a line, or over lines)
 *   {-text}            only in the plain Erevos and Erevos Lite
 *   {~text}            not in Erevos Lite (inside a line, or over lines; it may sit inside the two above)
 *   {~text|lite text}  `text`, but `lite text` in Erevos Lite
 *   - [+] item         a list item or step, with the lines that continue it, only in Erevos+
 *   [+] paragraph      a paragraph or note, to the next blank line, or a table row alone, only in Erevos+
 *   - [~] item         as `- [+]`, but: not in Erevos Lite
 *   [~] paragraph      as `[+]`, but: not in Erevos Lite
 *
 * Where a mark keeps its text, the mark goes and the text stays: the guide reads as if there were none.
 */
export function editionSource(source: string, edition: 'plus' | 'erevos' | 'lite'): string {
  // {~…} first: it may be inside {-…} or {+…}, whose ends would otherwise be its own.
  const text = source.replace(/\{~([^{}|]*)(?:\|([^{}]*))?\}/g, (_all, inner: string, lite?: string) => (edition === 'lite' ? (lite ?? '') : inner));
  const plain = text.replace(/\{([+-])([\s\S]*?)\}/g, (_all, which: string, inner: string) => ((which === '-') === (edition !== 'plus') ? inner : ''));
  return marked(marked(plain, '+', edition === 'plus'), '~', edition !== 'lite');
}

/** `text` with the blocks marked `[mark]` kept, their mark gone, or left out, with what continues them. */
function marked(text: string, mark: '+' | '~', keep: boolean): string {
  const tag = `[${mark}] `;
  const lines = text.split('\n');
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const item = new RegExp(`^(\\s*)(- |\\d+\\. )\\[\\${mark}\\] `).exec(line);
    const block = new RegExp(`^(\\| |> )?\\[\\${mark}\\] `).test(line);
    if (!item && !block) {
      out.push(line);
      continue;
    }
    if (keep) {
      out.push(line.replace(tag, ''));
      continue;
    }
    // Left out, with what continues it: an item's more indented lines (its sub-items too), a
    // paragraph's or note's lines to the next blank one; a table row alone.
    const indent = item ? item[1].length : -1;
    const row = /^\s*\|/.test(line.replace(tag, ''));
    while (i + 1 < lines.length && lines[i + 1].trim() !== '' && !row) {
      if (item && /^(\s*)/.exec(lines[i + 1])![1].length <= indent) break;
      i++;
    }
  }
  return out.join('\n');
}

export function parseGuide(source: string): GuideSection[] {
  const sections: GuideSection[] = [];
  let section: GuideSection | null = null;
  // The block that lines without a marker of their own continue.
  let open: GuideBlock | null = null;

  const add = (block: GuideBlock) => {
    if (!section) throw new Error(`guide: text before the first section: ${JSON.stringify(block)}`);
    section.blocks.push(block);
    open = block;
  };

  for (const raw of source.split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      open = null;
      continue;
    }
    if (line.startsWith('## ')) {
      const m = SECTION.exec(line);
      if (!m) throw new Error(`guide: a section needs an id, as "## Title {#id}": ${line}`);
      section = { id: m[2], title: m[1], blocks: [] };
      sections.push(section);
      open = null;
      continue;
    }
    const current = open as GuideBlock | null;
    if (line.startsWith('### ')) {
      add({ kind: 'heading', text: line.slice(4).trim() });
      open = null;
    } else if (/^\s*\|/.test(line)) {
      const row = cells(line);
      if (row.every((c) => /^:?-{3,}:?$/.test(c))) continue;
      if (current?.kind === 'table') current.rows.push(row);
      else add({ kind: 'table', head: row, rows: [] });
    } else if (/^ {2,}- /.test(line) && current?.kind === 'bullets') {
      current.items[current.items.length - 1].sub.push(line.trim().slice(2).trim());
    } else if (line.startsWith('- ')) {
      const item = { text: line.slice(2).trim(), sub: [] };
      if (current?.kind === 'bullets') current.items.push(item);
      else add({ kind: 'bullets', items: [item] });
    } else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s+/, '').trim();
      if (current?.kind === 'steps') current.items.push(text);
      else add({ kind: 'steps', items: [text] });
    } else if (line.startsWith('>')) {
      const text = line.replace(/^>\s?/, '').trim();
      if (current?.kind === 'note') current.text += ` ${text}`;
      else add({ kind: 'note', text });
    } else if (current && /^\s/.test(line) && (current.kind === 'bullets' || current.kind === 'steps')) {
      const text = line.trim();
      if (current.kind === 'steps') current.items[current.items.length - 1] += ` ${text}`;
      else {
        const last = current.items[current.items.length - 1];
        if (last.sub.length > 0) last.sub[last.sub.length - 1] += ` ${text}`;
        else last.text += ` ${text}`;
      }
    } else if (current?.kind === 'paragraph' || current?.kind === 'note') {
      current.text += ` ${line.trim()}`;
    } else {
      add({ kind: 'paragraph', text: line.trim() });
    }
  }
  return sections;
}

const INLINE = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(text: string): Span[] {
  const spans: Span[] = [];
  let at = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > at) spans.push({ text: text.slice(at, m.index) });
    if (m[1] !== undefined) spans.push({ text: m[1], bold: true });
    else if (m[2] !== undefined) spans.push({ text: m[2], code: true });
    else spans.push({ text: m[3], link: m[4] });
    at = m.index + m[0].length;
  }
  if (at < text.length) spans.push({ text: text.slice(at) });
  return spans;
}

/** A line as plain text, without its marks. */
export function plainText(text: string): string {
  return parseInline(text)
    .map((s) => s.text)
    .join('');
}

/** Every line of text in a block, plain. */
export function blockTexts(block: GuideBlock): string[] {
  switch (block.kind) {
    case 'heading':
    case 'paragraph':
    case 'note':
      return [plainText(block.text)];
    case 'bullets':
      return block.items.flatMap((i) => [i.text, ...i.sub]).map(plainText);
    case 'steps':
      return block.items.map(plainText);
    case 'table':
      return [block.head, ...block.rows].map((r) => r.map(plainText).join(' · '));
  }
}

export interface GuideHit {
  section: GuideSection;
  /** Where the words were found, shortened; null when only the title matched. */
  snippet: string | null;
}

const SNIPPET = 110;

/** Text to compare in a search: lower case, without accents. */
export function normalizeSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function shorten(text: string, at: number): string {
  if (text.length <= SNIPPET) return text;
  const start = Math.max(0, Math.min(at - 30, text.length - SNIPPET));
  const end = Math.min(text.length, start + SNIPPET);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

/**
 * The sections that hold every word typed (ignoring case and accents), those
 * with the words in their title first.
 */
export function searchGuide(sections: GuideSection[], query: string): GuideHit[] {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const titled: GuideHit[] = [];
  const others: GuideHit[] = [];
  for (const section of sections) {
    const lines = section.blocks.flatMap(blockTexts);
    const all = normalizeSearch([section.title, ...lines].join('\n'));
    if (!words.every((w) => all.includes(w))) continue;
    const inTitle = words.every((w) => normalizeSearch(section.title).includes(w));
    // The first line with every word, or else the first with the first word.
    const folded = lines.map(normalizeSearch);
    let at = folded.findIndex((l) => words.every((w) => l.includes(w)));
    if (at < 0) at = folded.findIndex((l) => l.includes(words[0]));
    const snippet = at < 0 ? null : shorten(lines[at], folded[at].indexOf(words[0]));
    (inTitle ? titled : others).push({ section, snippet: inTitle ? null : snippet });
  }
  return [...titled, ...others];
}
