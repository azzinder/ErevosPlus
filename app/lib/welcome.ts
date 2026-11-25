// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// One invite for everything: what a phone with Erevos gives someone new, as a QR code or a link,
// so their phone joins with one tap. They then use the same relay with access of their own (an
// invite to it, lib/relay-invite.ts, when the relay lets this phone invite), and the two are each
// other's contacts at once, with no message request: their first message says back the invite's
// secret (`hi`), and the phone that gave it takes them, named as it was told (lib/e2e.ts, welcome).
// The link is the inviting phone's contact link (lib/contact-code.ts) under another name, with more:
//   erevos://welcome?<the contact link's fields>&code=<invite to the relay>&hi=<32 hex>&n=<name>
// `code` is left out when the relay does not invite (the new phone uses the relay as the contact
// link lets it), and `n`, the name the inviting phone gives itself, when there is none.
// Self-contained on purpose (but for its parts), so it can run under plain Node for checks.

import { parseContact, type ContactCode } from './contact-code';
import { checkInvite, type Invite } from './relay-invite';

export type Welcome = {
  /** Who invites: their contact link. */
  contact: ContactCode;
  /** Access of its own to their relay, when the relay lets them invite. */
  invite: Invite | null;
  /** The secret said back in the first message, 32 hex characters. */
  hi: string;
  /** The name they give themselves, or ''. */
  name: string;
};

/** Where a phone with no relay yet signs in, with an account there (lib/relay-signin.ts): LPHL's relay, or the one this build names (lib/servers.ts). */
export { START_RELAY } from './servers';

const LINK = 'erevos://welcome?';
const CONTACT = 'erevos://contact?';
// As a contact's name is kept (lock/e2e-data.ts, MAX_NAME).
const MAX_NAME = 40;

/** One line of at most MAX_NAME characters, without control or direction marks. */
function cleanName(text: string): string {
  const line = text.replace(/[\u0000-\u001f\u007f-\u009f\u200e\u200f\u202a-\u202e\u2028\u2029\u2066-\u2069]/g, ' ');
  return [...line.replace(/\s+/g, ' ').trim()].slice(0, MAX_NAME).join('').trim();
}

/** The link of an invite, from the inviting phone's contact link and what goes with it. */
export function welcomeLink(contactLink: string, { code, hi, name }: { code?: string | null; hi: string; name?: string }): string {
  if (!contactLink.startsWith(CONTACT)) throw new Error('not a contact link');
  const named = cleanName(name ?? '');
  return `${LINK}${contactLink.slice(CONTACT.length)}${code ? `&code=${code}` : ''}&hi=${hi}${named ? `&n=${encodeURIComponent(named)}` : ''}`;
}

/** Checks the fields of an invite's link, as a scanned link opens a screen with them: null when they are not one. */
export function welcomeOf(fields: Record<string, string | string[] | undefined>): Welcome | null {
  const one = (name: string) => {
    const value = fields[name];
    return typeof value === 'string' ? value : '';
  };
  const hi = one('hi').trim().toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hi)) return null;
  // The contact link's own fields, read as it reads them.
  const own = ['id', 'relay', 'key', 'rk', 'sid', 'srelay', 'srk', 'sid2', 'srelay2', 'srk2', 'sid3', 'srelay3', 'srk3', 'lend', 'd']
    .filter((name) => one(name))
    .map((name) => `${name}=${encodeURIComponent(one(name))}`)
    .join('&');
  const contact = parseContact(`${CONTACT}${own}`);
  // Who invites has a relay and keys: an invite brings someone new onto it.
  if (!contact || !contact.relayUrl || !contact.senderHex || !contact.key) return null;
  const invite = one('code') ? checkInvite(contact.relayUrl, one('code')) : null;
  return { contact, invite, hi, name: cleanName(one('n')) };
}

/** Reads an invite's link. Null if the text is not one. */
export function parseWelcome(text: string): Welcome | null {
  const clean = text.trim();
  if (!clean.toLowerCase().startsWith(LINK)) return null;
  const fields: Record<string, string> = {};
  for (const pair of clean.slice(LINK.length).split('&')) {
    const at = pair.indexOf('=');
    if (at < 0) continue;
    try {
      fields[pair.slice(0, at)] = decodeURIComponent(pair.slice(at + 1).replace(/\+/g, ' '));
    } catch {
      return null;
    }
  }
  return welcomeOf(fields);
}

// Hands an invite from the screen a scanned link opens (app/welcome.tsx) to the chat of the space
// it was opened in, which owns the relay settings and the contacts. Kept in memory only, and taken
// by that space's chat only, so it never goes to another space.

type Listener = (welcome: Welcome) => void;

let waiting: { welcome: Welcome; space: number } | null = null;
let listener: { space: number; next: Listener } | null = null;

/** Gives an invite to the chat of `space`: now if it is open, otherwise when it next opens. */
export function offerWelcome(welcome: Welcome, space: number): void {
  if (listener?.space === space) listener.next(welcome);
  else waiting = { welcome, space };
}

/** For the chat of `space`: receives offered invites until unsubscribed, starting with one that waited for it. */
export function onWelcomeOffered(space: number, next: Listener): () => void {
  const mine = { space, next };
  listener = mine;
  if (waiting) {
    const { welcome, space: wanted } = waiting;
    waiting = null;
    if (wanted === space) next(welcome);
  }
  return () => {
    if (listener === mine) listener = null;
  };
}

/** The space locks: an invite handed over and not taken yet goes. */
export function forgetWelcome(): void {
  waiting = null;
}
