// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { splitLinks } from './links';
import { MOST_STYLED, styleText, type Look, type StyledPart } from './text-style';

// How a Matrix message looks, both ways (Matrix's HTML, org.matrix.custom.html in formatted_body).
// Sent: the words as typed, marks and all (lib/text-style.ts), stay the body any app shows; beside
// them goes their HTML, made only of what Element, FluffyChat and the others show: <strong>, <em>,
// <del>, <code>, <pre>, <br> and a spoiler's <span data-mx-spoiler>. Words with no mark go as they
// are, with no HTML.
// Read: no HTML is ever shown as HTML. Its words are taken out with the looks the marks have (bold,
// italic, struck through, code, hidden till tapped), for components/linked-text.tsx to show; a list
// and a quote as lines, a link as its words and where it goes. What an answer quotes (mx-reply),
// scripts, styles and the like are left out with all in them; a picture is only its words (alt),
// never fetched. One read in a single pass: HTML longer than MOST_HTML, or that makes more than
// MOST_PARTS runs, is not read, and the body shows instead.

export const HTML_FORMAT = 'org.matrix.custom.html';

/** The longest HTML read. */
export const MOST_HTML = 32_000;
/** The most runs of words one message's HTML makes. */
const MOST_PARTS = 2000;
/** How deep tags are followed; deeper ones only add their words. */
const MOST_DEPTH = 64;

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = (text: string) => text.replace(/[&<>"']/g, (c) => ESCAPES[c]);

// One run's words as HTML, its looks around them, its line breaks as <br>.
function inline(part: StyledPart): string {
  let html = escape(part.text).replace(/\n/g, '<br>');
  if (part.look.code) html = `<code>${html}</code>`;
  if (part.look.strike) html = `<del>${html}</del>`;
  if (part.look.italic) html = `<em>${html}</em>`;
  if (part.look.bold) html = `<strong>${html}</strong>`;
  return html;
}

/** Runs of words as Matrix's HTML: code of more than one line as a block of its own, each hidden part in one spoiler. */
export function htmlOfParts(parts: readonly StyledPart[]): string {
  let html = '';
  let open: number | undefined;
  // A block stands on lines of its own: the line breaks around it are its own.
  let afterBlock = false;
  for (const part of parts) {
    if (part.spoiler !== open) {
      if (open !== undefined) html += '</span>';
      if (part.spoiler !== undefined) html += '<span data-mx-spoiler>';
      open = part.spoiler;
    }
    const text = afterBlock && part.text.startsWith('\n') ? part.text.slice(1) : part.text;
    afterBlock = false;
    if (part.look.code && text.includes('\n')) {
      if (html.endsWith('<br>')) html = html.slice(0, -4);
      html += `<pre><code>${escape(text)}</code></pre>`;
      afterBlock = true;
    } else if (text) html += inline({ ...part, text });
  }
  if (open !== undefined) html += '</span>';
  return html;
}

/**
 * What goes beside words typed (content's format and formatted_body), when their marks change how
 * they look; nothing otherwise. `parts`, the runs they showed in already (a message sent on).
 */
export function formattedOf(text: string, parts?: readonly StyledPart[]): Record<string, string> {
  const runs = parts ?? (text.length <= MOST_STYLED ? styleText(text) : []);
  if (!runs.some((part) => Object.keys(part.look).length > 0)) return {};
  return { format: HTML_FORMAT, formatted_body: htmlOfParts(runs) };
}

/** How a message's content looks, from its HTML: null when it has none, or none that changes its words' look. */
export function styledOf(content: Record<string, unknown> | undefined): StyledPart[] | null {
  if (content?.format !== HTML_FORMAT || typeof content.formatted_body !== 'string') return null;
  return partsOfHtml(content.formatted_body);
}

// --- Reading ----------------------------------------------------------------------------------

// Tags with nothing inside them.
const EMPTY = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
// Tags whose inside is not read as HTML: left out with it, up to their end tag.
const RAW = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript', 'plaintext']);
// Tags left out with all inside them.
const LEFT_OUT = new Set(['mx-reply', 'head', 'template', 'svg', 'math', 'object', 'audio', 'video', 'canvas', 'select', 'button', 'picture', 'map']);
// Tags that stand on lines of their own.
const BLOCKS = new Set([
  'p', 'div', 'blockquote', 'pre', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'caption', 'details', 'summary',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main', 'figure', 'figcaption',
  'address', 'dl', 'dt', 'dd',
]);
const LOOKS: Record<string, keyof Look> = {
  b: 'bold', strong: 'bold', h1: 'bold', h2: 'bold', h3: 'bold', h4: 'bold', h5: 'bold', h6: 'bold',
  i: 'italic', em: 'italic',
  s: 'strike', del: 'strike', strike: 'strike',
  code: 'code', kbd: 'code', samp: 'code', tt: 'code', pre: 'code',
};

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };

/** Text with HTML's character references read: the few named ones, and any by number; one that names no character is U+FFFD. */
export function decodeHtml(text: string): string {
  if (!text.includes('&')) return text;
  return text.replace(/&(#\d{1,8}|#[xX][0-9a-fA-F]{1,7}|[a-zA-Z]{2,8});/g, (whole, name: string) => {
    if (name[0] !== '#') return NAMED[name.toLowerCase()] ?? whole;
    const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return code > 0 && code <= 0x10ffff && (code < 0xd800 || code > 0xdfff) ? String.fromCodePoint(code) : '\ufffd';
  });
}

// A tag's attributes, by name, their values read.
function attributesOf(text: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const found of text.matchAll(/([^\s"'=<>/`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = found[1].toLowerCase();
    if (!out.has(name)) out.set(name, decodeHtml(found[2] ?? found[3] ?? found[4] ?? ''));
  }
  return out;
}

const sameLook = (a: Look, b: Look) => !!a.bold === !!b.bold && !!a.italic === !!b.italic && !!a.strike === !!b.strike && !!a.code === !!b.code && !!a.hidden === !!b.hidden;

type Frame = { tag: string; look?: keyof Look; spoiler?: number; list?: { ordered: boolean; n: number }; href?: string; label?: string };

const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/y;
const ends = new Map<string, RegExp>();

/**
 * A message's HTML as runs of words, each with its look: null when it is too long, makes too many
 * runs, or changes no word's look (its body then shows as it is).
 */
export function partsOfHtml(html: string): StyledPart[] | null {
  if (html.length > MOST_HTML) return null;
  const parts: StyledPart[] = [];
  const frames: Frame[] = [];
  // Line breaks owed before the next words, whether these start a line, and what starts a list's item.
  let breaks = 0;
  let lineStart = true;
  let item = '';
  // Inside <pre>, before its first words: a line break there is not one.
  let preStart = false;
  let spoilers = 0;
  let tooMany = false;
  // Whether it said where a link goes that its words do not: then its runs show, not the body,
  // which may not say it (a link's words alone, as FluffyChat and others send).
  let linked = false;

  const push = (text: string, look: Look, spoiler?: number) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (last && last.spoiler === spoiler && sameLook(last.look, look)) last.text += text;
    else if (parts.length >= MOST_PARTS) tooMany = true;
    else parts.push(spoiler === undefined ? { text, look } : { text, look, spoiler });
  };

  // Words between tags, as they show: spaces as one, but in <pre>.
  const words = (raw: string, read = false) => {
    const pre = frames.some((frame) => frame.tag === 'pre');
    let text = pre ? raw : raw.replace(/[ \t\n\r\f]+/g, ' ');
    if (!read) text = decodeHtml(text);
    if (pre && preStart && text.startsWith('\n')) text = text.slice(1);
    if (!pre && (lineStart || breaks > 0)) text = text.replace(/^ +/, '');
    if (!text) return;
    preStart = false;
    const look: Look = {};
    let spoiler: number | undefined;
    for (const frame of frames) {
      if (frame.look) look[frame.look] = true;
      if (frame.spoiler !== undefined) spoiler = frame.spoiler;
    }
    if (breaks > 0) {
      // A line break inside what is hidden stays hidden with it.
      if (parts.length) push('\n'.repeat(Math.min(breaks, 4)), look.hidden ? { hidden: true } : {}, spoiler);
      breaks = 0;
      lineStart = true;
    }
    if (lineStart) {
      const quotes = frames.filter((frame) => frame.tag === 'blockquote').length;
      if (quotes) push(`${'>'.repeat(Math.min(quotes, 8))} `, {});
      if (item) push(item, {});
      item = '';
    }
    push(text, look, spoiler);
    lineStart = false;
    const link = [...frames].reverse().find((frame) => frame.tag === 'a');
    if (link && (link.label ?? '').length < 2100) link.label = (link.label ?? '') + text;
  };

  const lineFor = (tag: string) => (tag === 'p' && !frames.some((frame) => frame.tag === 'li') ? 2 : 1);

  const open = (tag: string, inside: string) => {
    if (tag === 'br') {
      if (parts.length) breaks += 1;
      return;
    }
    if (tag === 'img') {
      // Its words only (a custom emoji's :name:): the picture is never fetched.
      const alt = attributesOf(inside).get('alt');
      if (alt) words(alt.replace(/[ \t\n\r\f]+/g, ' '), true);
      return;
    }
    if (BLOCKS.has(tag) && parts.length) breaks = Math.max(breaks, lineFor(tag));
    if (EMPTY.has(tag) || inside.endsWith('/') || frames.length >= MOST_DEPTH) return;
    const frame: Frame = { tag };
    if (LOOKS[tag]) frame.look = LOOKS[tag];
    if ((tag === 'span' || tag === 'font') && attributesOf(inside).has('data-mx-spoiler')) {
      frame.look = 'hidden';
      frame.spoiler = spoilers++;
    }
    if (tag === 'ul' || tag === 'ol') {
      const start = Number.parseInt(attributesOf(inside).get('start') ?? '', 10);
      frame.list = { ordered: tag === 'ol', n: tag === 'ol' && Number.isFinite(start) && Math.abs(start) < 1e6 ? start : 1 };
    }
    if (tag === 'li') {
      const lists = frames.filter((one) => one.list);
      const list = lists[lists.length - 1]?.list;
      item = `${'  '.repeat(Math.max(0, lists.length - 1))}${list?.ordered ? `${list.n++}. ` : '• '}`;
    }
    if (tag === 'a') frame.href = attributesOf(inside).get('href') ?? '';
    if (tag === 'pre') preStart = true;
    frames.push(frame);
  };

  const close = (tag: string) => {
    let at = frames.length - 1;
    while (at >= 0 && frames[at].tag !== tag) at--;
    if (at < 0) return;
    // It ends, and whatever inside it was left open.
    const [frame] = frames.splice(at);
    if (tag === 'pre') {
      const last = parts[parts.length - 1];
      if (last?.look.code && last.text.endsWith('\n')) last.text = last.text.slice(0, -1);
    }
    if (BLOCKS.has(tag) && parts.length) breaks = Math.max(breaks, lineFor(tag));
    if (tag === 'li') item = '';
    if (tag === 'a') {
      // Where a link goes, after its words, when they do not say it: only a web address, and not
      // matrix.to's, which names a person, a room or a message the words already name.
      const href = (frame.href ?? '').trim();
      const label = (frame.label ?? '').trim();
      // The words say it only when they are themselves a web address that opens where it goes:
      // "example.invalid" for https://example.invalid is not tappable (lib/links.ts: no known ending), so it is said after them.
      const found = splitLinks(label);
      const same = found.length === 1 && found[0].url !== undefined && [href, href.replace(/\/$/, '')].includes(found[0].url);
      if (/^https?:\/\/[^\s/?#]+[^\s]*$/i.test(href) && href.length <= 2000 && !/^https:\/\/matrix\.to\//i.test(href) && !same) {
        words(label ? ` (${href})` : href, true);
        linked = true;
      }
    }
  };

  // Skipping what is inside a tag left out, and how many of it are open.
  let skip: { tag: string; depth: number } | null = null;
  let at = 0;
  // The next > at or after where a tag starts, found once for all the tags before it: -1 when none is left.
  let gt = -2;
  while (at < html.length && !tooMany) {
    const lt = html.indexOf('<', at);
    if (!skip && (lt < 0 ? html.length : lt) > at) words(html.slice(at, lt < 0 ? html.length : lt));
    if (lt < 0) break;
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      at = end < 0 ? html.length : end + 3;
      continue;
    }
    if (gt !== -1 && gt <= lt) gt = html.indexOf('>', lt + 1);
    // <!DOCTYPE …>, <?…>: nothing to show.
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      at = gt < 0 ? html.length : gt + 1;
      continue;
    }
    TAG.lastIndex = lt;
    const found = TAG.exec(html);
    if (!found) {
      if (!skip) words('<', true);
      at = lt + 1;
      continue;
    }
    // A tag never ended leaves out what follows it, as a browser does.
    if (gt < 0) break;
    const closing = found[1] === '/';
    const tag = found[2].toLowerCase();
    const inside = html.slice(lt + found[0].length, gt).trim();
    at = gt + 1;
    if (!closing && RAW.has(tag) && !inside.endsWith('/')) {
      let end = ends.get(tag);
      if (!end) ends.set(tag, (end = new RegExp(`</${tag}[^>]*>`, 'gi')));
      end.lastIndex = at;
      const match = end.exec(html);
      at = match ? match.index + match[0].length : html.length;
      continue;
    }
    if (skip) {
      if (tag === skip.tag && !inside.endsWith('/')) skip.depth += closing ? -1 : 1;
      if (skip.depth === 0) skip = null;
      continue;
    }
    if (!closing && LEFT_OUT.has(tag) && !inside.endsWith('/')) {
      skip = { tag, depth: 1 };
      continue;
    }
    if (closing) close(tag);
    else open(tag, inside);
  }
  if (tooMany) return null;
  // No space left at its end.
  const last = parts[parts.length - 1];
  if (last && !last.look.code) {
    last.text = last.text.replace(/\s+$/, '');
    if (!last.text) parts.pop();
  }
  return linked || parts.some((part) => Object.keys(part.look).length > 0) ? parts : null;
}
