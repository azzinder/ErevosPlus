// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { styleText, type Look } from './text-style';

// How a Telegram message's words look, as Erevos's marks (lib/text-style.ts): Telegram keeps the
// words plain and says apart which runs are bold, italic and so on (its "entities", counted in
// UTF-16 units, as JavaScript counts). What comes is written with the marks, so a chat shows,
// copies and quotes it as an Erevos chat does; what is sent is read for the marks and goes as
// Telegram's entities, so the official apps show it as meant. A link with words of its own says
// its address after them, in brackets, as Erevos shows no hidden addresses. Underline and the
// rest that Erevos has no mark for stay plain.

type Entity = { offset?: number; length?: number; type?: { '@type'?: string; url?: string } };

const MARK_OF: Record<string, string> = {
  textEntityTypeBold: '*',
  textEntityTypeItalic: '_',
  textEntityTypeStrikethrough: '~',
  textEntityTypeSpoiler: '||',
  textEntityTypeCode: '`',
  textEntityTypePre: '```',
  textEntityTypePreCode: '```',
};

const SPACE = /\s/u;

/** Telegram's words and their entities, as words with Erevos's marks. */
export function marksOf(text: string, entities: unknown): string {
  if (!Array.isArray(entities) || entities.length === 0 || !text) return text;
  const opens = new Map<number, string[]>();
  const closes = new Map<number, string[]>();
  const list = (entities as Entity[])
    .map((e) => ({ start: Number(e.offset), end: Number(e.offset) + Number(e.length), kind: e.type?.['@type'] ?? '', url: e.type?.url ?? '' }))
    .filter((e) => Number.isSafeInteger(e.start) && Number.isSafeInteger(e.end) && e.start >= 0 && e.end <= text.length && e.start < e.end)
    .sort((a, b) => a.start - b.start || b.end - a.end);
  for (const e of list) {
    let { start, end } = e;
    const mark = MARK_OF[e.kind];
    if (mark) {
      // A mark sits next to a letter (lib/text-style.ts): spaces at a run's ends stay outside it.
      if (mark !== '```') {
        while (start < end && SPACE.test(text[start])) start++;
        while (end > start && SPACE.test(text[end - 1])) end--;
        if (start === end) continue;
      }
      (opens.get(start) ?? opens.set(start, []).get(start)!).push(mark);
      (closes.get(end) ?? closes.set(end, []).get(end)!).unshift(mark);
    } else if (e.kind === 'textEntityTypeTextUrl' && e.url && e.url !== text.slice(start, end)) {
      (closes.get(end) ?? closes.set(end, []).get(end)!).push(` (${e.url})`);
    }
  }
  let out = '';
  for (let i = 0; i <= text.length; i++) {
    out += (closes.get(i) ?? []).join('') + (opens.get(i) ?? []).join('');
    if (i < text.length) out += text[i];
  }
  return out;
}

const ENTITY_OF: [keyof Look, string][] = [
  ['bold', 'textEntityTypeBold'],
  ['italic', 'textEntityTypeItalic'],
  ['strike', 'textEntityTypeStrikethrough'],
  ['hidden', 'textEntityTypeSpoiler'],
];

/** Words with Erevos's marks, as Telegram's plain words and entities. */
export function entitiesOf(marked: string): { text: string; entities: Record<string, unknown>[] } {
  let text = '';
  const entities: Record<string, unknown>[] = [];
  for (const part of styleText(marked)) {
    const offset = text.length;
    text += part.text;
    const length = part.text.length;
    if (!length) continue;
    const add = (type: string) => entities.push({ '@type': 'textEntity', offset, length, type: { '@type': type } });
    for (const [look, type] of ENTITY_OF) if (part.look[look]) add(type);
    if (part.look.code) add(part.text.includes('\n') ? 'textEntityTypePre' : 'textEntityTypeCode');
  }
  return { text, entities };
}
