// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Web addresses in a message's words (components/linked-text.tsx shows them tappable): ones that
// start with http://, https:// or www., up to the next space; and, as Telegram, Signal and the
// others show them, a bare name that ends in a known ending (t.me/name, example.org/page), opened
// with https://. Not one in an e-mail address, nor a file's name (photo.jpg): its ending is no
// web ending here. Marks that end a sentence are not part of one, nor a closing bracket that has
// no opening one in it.

const ENDINGS = [
  'com', 'org', 'net', 'edu', 'gov', 'info', 'io', 'me', 'app', 'dev', 'eu', 'gr', 'cy', 'de', 'at', 'ch', 'fr', 'it', 'es', 'pt', 'nl', 'be',
  'uk', 'us', 'ca', 'au', 'ru', 'ua', 'pl', 'cz', 'se', 'no', 'dk', 'fi', 'rs', 'hr', 'ba', 'si', 'bg', 'ro', 'tr', 'al', 'mk', 'tv', 'gg', 'ly',
  'co', 'xyz', 'online', 'site', 'news', 'social', 'chat', 'link', 'page', 'blog', 'shop', 'store', 'onion', 'im', 'to', 'cc', 'sh', 'ai',
];
const ENDING = new Set(ENDINGS);
// Marks that end a sentence, not a link: one at the end of a link is no part of it.
const TRAILING = new Set([...".,;:!?'’”»"]);
// The longest name a web address may have; a longer run of letters and dots is no address.
const MOST_NAME = 253;

export type TextPart = { text: string; url?: string };

// Read by hand, one character at a time, with no pattern that repeats inside another: a long run
// of names and dots in a message (a public Matrix room's) made Hermes's pattern matcher run out
// of room and the app close.
const isWord = (c: string | undefined) => c !== undefined && /^[A-Za-z0-9_]$/.test(c);
const isNamePart = (c: string | undefined) => c !== undefined && /^[A-Za-z0-9.-]$/.test(c);
const isSpace = (c: string | undefined) => c !== undefined && /^\s$/.test(c);
const endsLink = (c: string | undefined) => c === undefined || c === '<' || c === '>' || c === '"' || isSpace(c);

// Where a link that starts at `at` ends: up to the next space, '<', '>' or '"'.
function linkEnd(text: string, at: number): number {
  let end = at;
  while (!endsLink(text[end])) end += 1;
  return end;
}

// A bare name's labels: letters, digits and '-', none empty, none starting or ending with '-'.
function goodLabels(name: string): boolean {
  for (const label of name.split('.')) if (!label || label.startsWith('-') || label.endsWith('-')) return false;
  return true;
}

// The link that starts at `at`, if one does: http://, https:// or www. after no letter or digit,
// or a bare name (t.me/name) after nothing of a name, an e-mail address or a path. Its end, or -1.
function linkAt(text: string, at: number): number {
  const before = text[at - 1];
  if (!isWord(before)) {
    const head = text.slice(at, at + 8).toLowerCase();
    if (head.startsWith('http://') || head.startsWith('https://') || head.startsWith('www.')) {
      const end = linkEnd(text, at);
      const start = head.startsWith('www.') ? 4 : head.startsWith('https://') ? 8 : 7;
      if (end > at + start) return end;
    }
  }
  if (isWord(before) || before === '@' || before === '.' || before === '/' || before === '-') return -1;
  if (!/^[A-Za-z0-9]$/.test(text[at] ?? '')) return -1;
  let run = at;
  while (isNamePart(text[run])) run += 1;
  if (run - at > MOST_NAME) return -1;
  const name = text.slice(at, run).toLowerCase();
  // The longest name that ends in a known ending, with no letter, digit, '_' or '-' after it.
  for (let dot = name.lastIndexOf('.'); dot > 0; dot = name.lastIndexOf('.', dot - 1)) {
    const next = name.indexOf('.', dot + 1);
    const stop = next < 0 ? name.length : next;
    const after = next < 0 ? text[run] : '.';
    if (!ENDING.has(name.slice(dot + 1, stop)) || isWord(after) || after === '-') continue;
    if (!goodLabels(name.slice(0, stop))) continue;
    const end = at + stop;
    return next < 0 && (after === '/' || after === '?' || after === '#') ? linkEnd(text, end) : end;
  }
  return -1;
}

/** The words, in order, each web address apart with where it opens. */
export function splitLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (let at = 0; at < text.length; ) {
    const end = linkAt(text, at);
    if (end < 0) {
      at += 1;
      continue;
    }
    const link = trimEnd(text.slice(at, end));
    if (link.length > 4) {
      if (at > last) parts.push({ text: text.slice(last, at) });
      parts.push({ text: link, url: /^https?:\/\//i.test(link) ? link : `https://${link}` });
      last = at + link.length;
    }
    at = end;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

/**
 * `link` without the marks that end a sentence after it, nor a closing bracket that has no opening
 * one in it, again and again as each goes. Once over the link and once back from its end, however
 * many there are, so a long run of them in a message takes no longer than its length.
 */
function trimEnd(link: string): string {
  const brackets = { '(': 0, ')': 0, '[': 0, ']': 0 };
  for (const mark of link) if (mark === '(' || mark === ')' || mark === '[' || mark === ']') brackets[mark] += 1;
  let end = link.length;
  for (;;) {
    while (end > 0 && TRAILING.has(link[end - 1])) end -= 1;
    const last = link[end - 1];
    if ((last === ')' && brackets['('] < brackets[')']) || (last === ']' && brackets['['] < brackets[']'])) {
      brackets[last] -= 1;
      end -= 1;
      continue;
    }
    return link.slice(0, end);
  }
}
