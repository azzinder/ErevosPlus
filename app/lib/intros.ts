// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { INTRO_LASTS, type IntroKept } from '../lock/e2e-data';
import type { Carried, IntroSignal } from './chat-parts';
import { parseContact } from './contact-code';
import { bundleIdentity } from './core';
import { randomBytes, toHex } from './crypto';
import { fromBase64Url, type E2E, type Where } from './e2e';
import { t } from './i18n';

// Introducing two contacts to each other, from a chat (app/chat.tsx, Chat Details → Introduce):
// the phone that introduces (R) asks each of the two (A and B), in a message of its chat with
// them, inside its end-to-end encryption, as any message goes; nothing of it reaches a relay in
// the clear. Nothing more happens unless both say yes, each on their own phone:
// - R → A and R → B: 'ask', with words an Erevos from before shows as they are, and the name R
//   gives the other. B is the one asked for a link (`g`).
// - A → R: 'yes' (or 'no'). B → R: 'yes' with B's contact link and a new invite secret (`h`,
//   lib/welcome.ts), which B keeps for 7 days under the name R gave A; or 'no'.
// - Once both said yes, R → A: 'go', with B's link and secret. A adds B with the secret, so B's
//   phone takes A as a contact at once, named as R named them, rather than as a message request.
// R learns nothing it did not know of A, and of B only the contact link B chose to give, after B
// said yes: a link that names B's keys, which R has, and a queue anyone with B's link can write to.
// A learns that link only once B said yes. Neither learns whether the other said no. R checks that
// the link B gives is B's own key; A cannot check it is B's, as R could pass another key off as
// B's: the new contact is marked as introduced, and its safety number can be checked as any.
// An answer or a 'go' for an introduction this phone did not make or say yes to is dropped, as is
// any of it from a message request, so no one makes a contact of anyone without their yes.

/** A message to send for an introduction: to whom, its words (none for all but an ask), and what it carries. */
export type IntroSend = { to: string; text: string; more: Carried };

/** What came of an introduction's step. */
export type IntroCame =
  | { kind: 'asked'; from: string; name: string }
  | { kind: 'send'; send: IntroSend }
  | { kind: 'add'; link: string; hi: string; name: string; from: string }
  | null;

/** An introduction made here, as the screen shows it. */
export type IntroMade = { i: string; a: string; b: string; at: number; ya: boolean; yb: boolean; end: '' | 'went' | 'no' };

const contactOf = (e2e: E2E, identity: string) => e2e.contacts().find((c) => c.identity === identity);

/**
 * Starts an introduction of `a` to `b`, both contacts this chat accepted: keeps it, and gives what
 * to send each of them. Each sees the name this chat gives the other, which both must have.
 */
export async function introduce(e2e: E2E, a: string, b: string, now = Date.now()): Promise<IntroSend[]> {
  const one = contactOf(e2e, a);
  const other = contactOf(e2e, b);
  if (a === b || !one || !other || one.request || other.request) throw new Error(t('Choose two of your contacts.'));
  if (!one.name.trim() || !other.name.trim()) throw new Error(t('Give both a name first: each sees the name you gave the other.'));
  const i = toHex(randomBytes(16));
  await e2e.changeIntros((kept) => ({ next: [...kept, { i, by: true, a, b, at: now }], out: undefined }));
  const words = (name: string) => t('I would like you to meet {name}. If you both say yes, Erevos makes you contacts.', { name });
  return [
    { to: a, text: words(other.name), more: { intro: { i, s: 'ask', n: other.name } } },
    { to: b, text: words(one.name), more: { intro: { i, s: 'ask', n: one.name, g: true } } },
  ];
}

/** What a step of an introduction that came from `from` does here: kept, and what follows from it. */
export async function introCame(e2e: E2E, from: string, intro: IntroSignal, request: boolean, now = Date.now()): Promise<IntroCame> {
  // Someone not accepted as a contact introduces no one, and answers nothing.
  if (request || !contactOf(e2e, from) || contactOf(e2e, from)?.request) return null;
  if (intro.s === 'ask') {
    const name = intro.n ?? '';
    return e2e.changeIntros((kept) => {
      if (!name || kept.some((k) => 'from' in k && k.from === from && k.i === intro.i)) return { next: kept, out: null };
      const asked: IntroKept = { i: intro.i, from, n: name, ...(intro.g ? { g: true as const } : {}), at: now, st: 'asked' };
      return { next: [...kept, asked], out: { kind: 'asked' as const, from, name } };
    });
  }
  if (intro.s === 'go') {
    return e2e.changeIntros((kept) => {
      const at = kept.findIndex((k) => 'from' in k && k.from === from && k.i === intro.i && k.st === 'yes' && !k.g);
      const was = kept[at];
      if (at < 0 || !was || !('from' in was) || !intro.l || !intro.h) return { next: kept, out: null };
      const next = kept.map((k, n) => (n === at ? { ...was, st: 'done' as const } : k));
      return { next, out: { kind: 'add' as const, link: intro.l, hi: intro.h, name: was.n, from } };
    });
  }
  // An answer to one made here, from one of the two it was made for. The link B gives has to be B's own.
  const made = e2e.intros(now).find((k): k is Extract<IntroKept, { by: true }> => 'by' in k && k.i === intro.i && (k.a === from || k.b === from) && !k.end);
  if (!made) return null;
  if (intro.s === 'yes' && from === made.b && !(await isTheirs(intro.l, from))) return null;
  return e2e.changeIntros((kept) => {
    const at = kept.findIndex((k) => 'by' in k && k.i === intro.i && !k.end);
    const was = kept[at];
    if (at < 0 || !was || !('by' in was)) return { next: kept, out: null };
    let next: Extract<IntroKept, { by: true }>;
    if (intro.s === 'no') {
      const { l: _l, h: _h, ...rest } = was;
      next = { ...rest, end: 'no' };
    } else if (from === was.b) next = { ...was, yb: true, l: intro.l, h: intro.h };
    else next = { ...was, ya: true };
    let out: IntroCame = null;
    if (next.ya && next.yb && next.l && next.h) {
      out = { kind: 'send', send: { to: next.a, text: '', more: { intro: { i: next.i, s: 'go', l: next.l, h: next.h } } } };
      const { l: _l, h: _h, ...rest } = next;
      next = { ...rest, end: 'went' };
    }
    return { next: kept.map((k, n) => (n === at ? next : k)), out };
  });
}

// Whether a contact link names the keys of `identity`.
async function isTheirs(link: string | undefined, identity: string): Promise<boolean> {
  const code = link ? parseContact(link) : null;
  if (!code?.key || !code.senderHex) return false;
  const said = await bundleIdentity(fromBase64Url(code.key)).then(toHex, () => '');
  return said === identity;
}

/**
 * Answers an introduction `from` asked of this chat: no, or yes, with this chat's contact link
 * (`ownLink`) and a new invite secret when it is the side that gives one. Gives what to send them.
 */
export async function answerIntro(e2e: E2E, from: string, i: string, yes: boolean, ownLink: string, now = Date.now()): Promise<IntroSend> {
  const asked = e2e.intros(now).find((k): k is Extract<IntroKept, { from: string }> => 'from' in k && k.from === from && k.i === i && k.st === 'asked');
  if (!asked) throw new Error(t('That introduction is no longer open.'));
  let signal: IntroSignal = { i, s: yes ? 'yes' : 'no' };
  if (yes && asked.g) {
    if (!ownLink) throw new Error(t('Your contact link is not ready yet: you need a server, or to try again in a moment.'));
    // Their phone says it back in its first message: this one takes them at once, named so.
    const hi = await e2e.welcome(asked.n);
    signal = { i, s: 'yes', l: ownLink, h: hi };
  }
  await e2e.changeIntros((kept) => ({
    next: kept.map((k) => ('from' in k && k.from === from && k.i === i ? { ...k, st: yes ? ('yes' as const) : ('no' as const) } : k)),
    out: undefined,
  }));
  return { to: from, text: '', more: { intro: signal } };
}

/**
 * Adds the contact an introduction gave (`go`), with the secret their phone takes this chat by, and
 * names them as the one who introduced them did. `sender` and `at`: where this chat reads. Gives
 * their identity.
 */
export async function addIntroduced(e2e: E2E, add: Extract<IntroCame, { kind: 'add' }>, sender: string, at: Where): Promise<string> {
  const code = parseContact(add.link);
  if (!code?.key) throw new Error(t('That introduction gave no contact link.'));
  const { identity, added } = await e2e.addContact(code, sender, at, add.hi);
  if (added && !contactOf(e2e, identity)?.ownName) await e2e.rename(identity, add.name);
  return identity;
}

/** The introductions `from` asked of this chat that wait for an answer: their ids, and whom each is to. */
export function introsAsked(e2e: E2E, from: string, now = Date.now()): { i: string; name: string }[] {
  return e2e
    .intros(now)
    .filter((k): k is Extract<IntroKept, { from: string }> => 'from' in k && k.from === from && k.st === 'asked')
    .map((k) => ({ i: k.i, name: k.n }));
}

/** The introductions made here that involve `identity`, newest first. */
export function introsMade(e2e: E2E, identity: string, now = Date.now()): IntroMade[] {
  return e2e
    .intros(now)
    .filter((k): k is Extract<IntroKept, { by: true }> => 'by' in k && (k.a === identity || k.b === identity))
    .map((k) => ({ i: k.i, a: k.a, b: k.b, at: k.at, ya: !!k.ya, yb: !!k.yb, end: k.end ?? ('' as const) }))
    .reverse();
}

/** How long an introduction waits for its answers. */
export const INTRO_WAITS = INTRO_LASTS;

/**
 * Takes a step of an introduction that came in a message, whoever looks (the chat, lib/receiver.ts):
 * keeps it, sends what follows through `send`, and adds the contact a 'go' gives, reading at
 * `sender`/`at`. Says what came, for the screen.
 */
export async function takeIntro(
  e2e: E2E,
  from: string,
  intro: IntroSignal,
  request: boolean,
  send: (message: IntroSend) => Promise<void>,
  sender: string,
  at: Where,
): Promise<IntroCame> {
  const came = await introCame(e2e, from, intro, request);
  if (came?.kind === 'send') await send(came.send);
  if (came?.kind === 'add') await addIntroduced(e2e, came, sender, at);
  return came;
}
