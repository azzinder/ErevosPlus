// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Messenger, Signal and Session in Erevos+ (docs/editions.md): what their engines (messenger/,
// modules/erevos-messenger) tell, kept as one state per service. Pure, so the checks can run it;
// lib/messenger-store.ts holds the state and speaks to the engines.
//
// Their keys are 64-bit: Messenger's are positive and longer than JavaScript's numbers hold,
// Signal's lie between -2^62 and 0, Session's below -2^62. So every key is kept as its decimal
// text (`readJson` quotes long numbers before parsing), and sent back as text, which the engines
// read as numbers again (org.json's optLong takes text too).

export type MsgService = 'messenger' | 'signal' | 'session';

/** The three services, in the order the modules and the home screen show them. */
export const MSG_SERVICES: readonly MsgService[] = ['messenger', 'signal', 'session'];

/** Each service's own name; the same in every language. */
export const SERVICE_NAMES: Record<MsgService, string> = { messenger: 'Messenger', signal: 'Signal', session: 'Session' };

export type MsgThread = {
  key: string;
  name: string;
  snippet: string;
  lastMs: number;
  encrypted: boolean;
  group: boolean;
  unread: boolean;
  pinned: string;
};

export type MsgAttachment = { kind: string; url: string; playUrl: string; mime: string; w: number; h: number; name: string; title: string; link: string };

export type MsgQuote = { id: string; text: string; sender: string; name: string };

export type MsgMessage = {
  id: string;
  thread: string;
  sender: string;
  name: string;
  text: string;
  ms: number;
  mine: boolean;
  encrypted: boolean;
  forwarded: boolean;
  edited: boolean;
  attachments: MsgAttachment[];
  replyTo: MsgQuote | null;
  /** Person key → emoji. */
  reactions: Record<string, string>;
};

export type MsgState = {
  /** The engine is signed in. */
  signedIn: boolean;
  /** Connected now. */
  connected: boolean;
  /** The engine's own word on its connection, or the last error. */
  status: string;
  /** Sign in again: the engine said its session is gone. */
  signInAgain: boolean;
  /** Signal, while linking to another phone: the address its QR code shows; or why linking failed. */
  linkUrl: string;
  linkError: string;
  threads: Record<string, MsgThread>;
  /** Each chat's messages, oldest first. */
  messages: Record<string, MsgMessage[]>;
};

export const emptyMsgState = (): MsgState => ({ signedIn: false, connected: false, status: '', signInAgain: false, linkUrl: '', linkError: '', threads: {}, messages: {} });

/**
 * JSON with every integer of 16 digits or more, outside strings, read as its text: a 64-bit key
 * stays whole. Shorter numbers (times in ms have 13 digits) stay numbers.
 */
export function readJson(text: string): unknown {
  let out = '';
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
      out += text.slice(i, j + 1);
      i = j + 1;
    } else if (c === '-' || (c >= '0' && c <= '9')) {
      const m = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i));
      const n = m ? m[0] : c;
      out += !m || m[1] || m[2] || n.replace('-', '').length < 16 ? n : `"${n}"`;
      i += n.length;
    } else {
      out += c;
      i += 1;
    }
  }
  return JSON.parse(out);
}

const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' && Number.isFinite(v) ? String(v) : '');
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && /^-?\d+$/.test(v) ? Number(v) : 0);
const bool = (v: unknown): boolean => v === true;
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** The service a chat or person key belongs to, by its range (messenger/README.md). */
export function serviceOfKey(key: string): MsgService {
  if (!key.startsWith('-')) return 'messenger';
  // -2^62 = -4611686018427387904: below it is Session's.
  const digits = key.slice(1);
  const limit = '4611686018427387904';
  const below = digits.length > limit.length || (digits.length === limit.length && digits > limit);
  return below ? 'session' : 'signal';
}

/**
 * Keeps read the chats marked read here (lib/messenger-store.ts msgReadChat) up to `readTo`, each
 * chat's last message then: an engine sends a chat's messages again (as it opens, or reconnects),
 * and its account may say the chat is unread until the service has heard it was read. Only a
 * message after that mark makes a chat unread again.
 */
export function keepRead(before: MsgState, next: MsgState, readTo: ReadonlyMap<string, number>): MsgState {
  if (next === before || readTo.size === 0) return next;
  let threads: Record<string, MsgThread> | null = null;
  for (const [key, t] of Object.entries(next.threads)) {
    const mark = readTo.get(key);
    if (!t.unread || mark === undefined || before.threads[key]?.unread || t.lastMs > mark) continue;
    threads ??= { ...next.threads };
    threads[key] = { ...t, unread: false };
  }
  return threads ? { ...next, threads } : next;
}

/** How far before the engine's start a message still counts as new: the phone's clock may run ahead of the service's. */
export const START_SLACK_MS = 60_000;

/**
 * Whether a message from someone else, not in memory yet, counts as new in its chat: not at or
 * before the chat's read mark here (`readTo`), not from before the engine's start (what a reconnect
 * or an opening chat fetches again; a minute's slack for the clocks), and not older than the newest
 * one already counted in the chat (`countedTo`). Never by the chat's own last time, which an engine
 * may move to this very message before sending it.
 */
export function countsAsNew(ms: number | null, readTo: number | undefined, countedTo: number | undefined, startedAt: number): boolean {
  if (ms === null) return true;
  if (readTo !== undefined && ms <= readTo) return false;
  if (ms < startedAt - START_SLACK_MS) return false;
  return countedTo === undefined || ms >= countedTo;
}

function thread(raw: Record<string, unknown>, before?: MsgThread): MsgThread {
  return {
    key: str(raw.key),
    name: str(raw.name) || before?.name || '',
    snippet: str(raw.snippet),
    lastMs: num(raw.lastMs) || before?.lastMs || 0,
    encrypted: bool(raw.encrypted),
    group: bool(raw.group),
    unread: bool(raw.unread),
    pinned: raw.pinned === undefined ? (before?.pinned ?? '') : str(raw.pinned),
  };
}

function attachments(v: unknown): MsgAttachment[] {
  if (!Array.isArray(v)) return [];
  return v.map((a) => {
    const o = obj(a);
    return { kind: str(o.kind), url: str(o.url), playUrl: str(o.playUrl), mime: str(o.mime), w: num(o.w), h: num(o.h), name: str(o.name), title: str(o.title), link: str(o.link) };
  });
}

function message(raw: Record<string, unknown>, before?: MsgMessage): MsgMessage {
  const reply = raw.replyTo ? obj(raw.replyTo) : null;
  return {
    id: str(raw.id),
    thread: str(raw.thread),
    sender: str(raw.sender),
    name: str(raw.name),
    text: str(raw.text),
    ms: num(raw.ms),
    mine: bool(raw.mine),
    encrypted: bool(raw.encrypted),
    forwarded: bool(raw.forwarded),
    edited: bool(raw.edited),
    attachments: attachments(raw.attachments),
    replyTo: reply ? { id: str(reply.id), text: str(reply.text), sender: str(reply.sender), name: str(reply.name) } : null,
    reactions: before?.reactions ?? {},
  };
}

/** Most messages kept in memory per chat; older ones the engine gives again when asked. */
export const KEEP_MESSAGES = 400;

function withMessages(state: MsgState, key: string, list: MsgMessage[]): MsgState {
  return { ...state, messages: { ...state.messages, [key]: list.length > KEEP_MESSAGES ? list.slice(-KEEP_MESSAGES) : list } };
}

function editMessage(state: MsgState, id: string, edit: (m: MsgMessage) => MsgMessage | null): MsgState {
  for (const [key, list] of Object.entries(state.messages)) {
    const i = list.findIndex((m) => m.id === id);
    if (i < 0) continue;
    const next = edit(list[i]);
    const copy = [...list];
    if (next) copy[i] = next;
    else copy.splice(i, 1);
    return withMessages(state, key, copy);
  }
  return state;
}

/** The state after one of the engine's events (messenger/docs/api.md). Unknown events change nothing. */
export function applyEvent(state: MsgState, event: unknown, fresh: (key: string, ms: number | null) => boolean = () => true): MsgState {
  const e = obj(event);
  switch (e.type) {
    case 'connected':
      return { ...state, signedIn: true, connected: true, signInAgain: false, status: '' };
    case 'disconnected':
      return { ...state, connected: false };
    case 'status':
      return { ...state, status: str(e.status) };
    case 'signalLink':
      return { ...state, linkUrl: str(e.url), linkError: '' };
    case 'signalLinked':
      return { ...state, signedIn: true, signInAgain: false, linkUrl: '', linkError: '' };
    case 'signalLinkFailed':
      return { ...state, linkUrl: '', linkError: str(e.error) };
    case 'fatal':
      return { ...state, connected: false, status: str(e.error), signInAgain: bool(e.signIn), signedIn: bool(e.signIn) ? false : state.signedIn };
    case 'thread': {
      const raw = obj(e.thread);
      const key = str(raw.key);
      if (!key) return state;
      return { ...state, signedIn: true, threads: { ...state.threads, [key]: thread(raw, state.threads[key]) } };
    }
    case 'threadGone': {
      const key = str(e.key);
      if (!state.threads[key]) return state;
      const threads = { ...state.threads };
      delete threads[key];
      return { ...state, threads };
    }
    case 'message': {
      const raw = obj(e.message);
      const key = str(raw.thread);
      const id = str(raw.id);
      if (!key || !id) return state;
      const list = state.messages[key] ?? [];
      const at = list.findIndex((m) => m.id === id);
      const m = message(raw, at >= 0 ? list[at] : undefined);
      let next: MsgMessage[];
      if (at >= 0) {
        // Sent again when its attachments came: replaced, not added.
        next = [...list];
        next[at] = m;
      } else {
        next = [...list, m];
        if (list.length && list[list.length - 1].ms > m.ms) next.sort((a, b) => a.ms - b.ms);
      }
      const t = state.threads[key];
      // Only a message new here makes its chat unread (`fresh`, lib/messenger-store.ts): an engine
      // sends each chat's last message again as it starts, and a message again when its attachments
      // come, and none of those is new. Whether the chat was unread before that its account says.
      const came = !m.mine && at < 0 && fresh(key, typeof raw.ms === 'number' ? raw.ms : null);
      const threads = t && m.ms >= t.lastMs ? { ...state.threads, [key]: { ...t, lastMs: m.ms, snippet: m.text || t.snippet, unread: t.unread || came } } : state.threads;
      return withMessages({ ...state, threads }, key, next);
    }
    case 'reaction': {
      // Ours is kept as 'me', so the menu knows which one is ours.
      const actor = bool(e.mine) ? 'me' : str(e.actor);
      return editMessage(state, str(e.id), (m) => {
        const reactions = { ...m.reactions };
        if (str(e.emoji)) reactions[actor] = str(e.emoji);
        else delete reactions[actor];
        return { ...m, reactions };
      });
    }
    case 'deleted':
      return editMessage(state, str(e.id), () => null);
    case 'edited':
      return editMessage(state, str(e.id), (m) => ({ ...m, text: str(e.text), edited: true }));
    case 'pinned': {
      const key = str(e.thread);
      const t = state.threads[key];
      return t ? { ...state, threads: { ...state.threads, [key]: { ...t, pinned: str(e.id) } } } : state;
    }
    default:
      return state;
  }
}

/** The chats, newest first. */
export function threadList(state: MsgState): MsgThread[] {
  return Object.values(state.threads).sort((a, b) => b.lastMs - a.lastMs);
}

/** A call's answer (`{"ok": …}` or `{"error": "…"}`) as its value; an error is thrown. */
export function answerOf<T = unknown>(text: string): T {
  const a = obj(readJson(text));
  if (typeof a.error === 'string' && a.error) throw new Error(a.error);
  return a.ok as T;
}
