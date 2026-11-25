// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Links that open Erevos (erevos://...): its icons in the launcher and its widget, a tel: link
// through the Phone (modules/erevos-phone), another app's request about a contact
// (modules/erevos-contacts), an SMS notice, a contact code scanned with the camera. The password
// screen comes first, and the screens start afresh once a space opens (app/_layout.tsx), so a link
// is held here (app/+native-intent.ts) and opened once a space is open, if it came in the last few
// minutes. One opened just before Erevos locked, as it does when it comes back from the background
// with the link, is held again for after the password.
// Self-contained on purpose, so it can run under plain Node for checks.

/** How long a link waits for the password. */
export const KEEP_MS = 5 * 60_000;
/** A link opened this long before Erevos locks opens again after the password. */
export const RELOCK_MS = 3_000;

let held: { href: string; at: number } | null = null;
let opened: { href: string; at: number } | null = null;
const listeners = new Set<() => void>();

/** The screen a link names, as the app's routes (erevos://contacts?x=1 is /contacts?x=1, erevos://?show=sms
 *  is the home screen's /?show=sms); '' for the home screen with nothing more, or another kind of link. */
export function linkHref(url: string): string {
  const web = webLinkHref(url);
  if (web) return web;
  const match = /^erevos:\/*([^?#]*)(\?[^#]*)?/i.exec(url.trim());
  if (!match) return '';
  const path = match[1].replace(/\/+$/, '');
  const query = match[2] && match[2] !== '?' ? match[2] : '';
  if (!path) return query ? `/${query}` : '';
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/i.test(path)) return '';
  return `/${path}${query}`;
}

// Erevos's own pages on LPHL's web server that Android opens in Erevos (app.json intentFilters,
// with the server's .well-known/assetlinks.json): an invite (/i#..., lib/text-invite.ts) and a
// contact page (/c#..., lib/contact-code.ts), whose data follows #. The same screens as the links
// those pages open in the app. Expo Router may hand over the whole address or only its path.
const WEB_PAGE = /^(?:https:\/\/erevos-web\.lphl\.nekten\.eu)?\/([ic])\/?#(.+)$/i;

/** The screen of a link to Erevos's invite or contact page, or '' for any other. */
export function webLinkHref(url: string): string {
  const match = WEB_PAGE.exec(url.trim());
  if (!match) return '';
  const data = match[2];
  if (match[1].toLowerCase() === 'i') return /^[A-Za-z0-9_-]+$/.test(data) ? `/text-invite?d=${data}` : '';
  // The contact page's fields, as the contact link has them after ?.
  return /^[A-Za-z0-9_%.~+=&-]+$/.test(data) ? `/contact?${data}` : '';
}

// An Erevos link wherever it stands in a text: its own kind (erevos://...), or one of its two pages.
const LINK_IN = /(?:erevos:\/\/[a-z-]+\?|https:\/\/erevos-web\.lphl\.nekten\.eu\/[ci]\/?#)[^\s<>"'«»]+/i;

/**
 * What was pasted where a link is asked for, as the link in it: a whole message someone sent, with
 * words around its link, gives the link alone, without the full stop or bracket that ends the
 * sentence. Text with no Erevos link in it comes back as it is, trimmed.
 */
export function pastedLink(text: string): string {
  const found = LINK_IN.exec(text);
  if (!found) return text.trim();
  let end = found[0].length;
  while (end > 0 && '.,;:!?)]'.includes(found[0][end - 1])) end -= 1;
  return found[0].slice(0, end);
}

/** A link's screen, and its details as the screen's params: /phone?number=%2B30 is /phone and { number: '+30' }. */
export function linkParts(href: string): { path: string; params: Record<string, string> } {
  const read = (text: string) => {
    try {
      return decodeURIComponent(text.replace(/\+/g, ' '));
    } catch {
      return text;
    }
  };
  const at = href.indexOf('?');
  const params: Record<string, string> = {};
  if (at >= 0) {
    for (const pair of href.slice(at + 1).split('&')) {
      if (!pair) continue;
      const eq = pair.indexOf('=');
      params[read(eq < 0 ? pair : pair.slice(0, eq))] = eq < 0 ? '' : read(pair.slice(eq + 1));
    }
  }
  return { path: at < 0 ? href : href.slice(0, at), params };
}

/** The link Erevos's own icon in the launcher becomes (modules/erevos-icons, ErevosIconsPackage.kt):
 *  its chats, as SMS's icon opens the SMS and the widget's Messages button the chats. */
export const ICON_LINK = 'erevos://?show=erevos&from=launcher';

/** The screens of Erevos's own chats: its icon leaves one open, as Erevos was left. */
const CHATS = new Set(['/chat', '/group', '/public-group']);
/** The screens the icons and the widget open besides the home screen: shown again with a link's details only. */
const AGAIN = new Set(['/phone', '/contacts']);

/**
 * How a link opens, by the screen on top (`top`, and whether it shows a hidden place's, as the
 * hidden chats' contacts do):
 * - 'stay': Erevos's own icon, over one of its chats;
 * - 'back': back to the home screen, or to the Phone or Contacts on top, with only the link's
 *   details and `opened` changed, so the same link a second time shows its tab again, also after
 *   the owner chose another (screenParams);
 * - 'params': the screen on top takes the link's details;
 * - 'push': the screen opens over the one on top.
 */
export function linkMove(href: string, top: { path: string; hidden: boolean }): 'stay' | 'back' | 'params' | 'push' {
  const { path, params } = linkParts(href);
  if (path === '/') return params.from === 'launcher' && CHATS.has(top.path) ? 'stay' : 'back';
  if (path !== top.path) return 'push';
  if (AGAIN.has(path)) return top.hidden ? 'push' : 'back';
  return 'params';
}

/** A link's details as its screen is opened again ('back'): with `opened`, which changes each time. */
export function screenParams(href: string, now = Date.now()): Record<string, string> {
  return { ...linkParts(href).params, opened: String(now) };
}

/** What a password given for one part of Erevos opens, with the password lock: only the SMS, or
 *  only the Contacts (their icon, the widget's button, an SMS notice). */
export type OnlyPart = 'sms' | 'contacts';

/** The screens each part opens alone (app/_layout.tsx): any other asks for the password again. */
export const ONLY_SCREENS: Record<OnlyPart, ReadonlySet<string>> = {
  sms: new Set(['index', 'sms', 'sms-folder']),
  contacts: new Set(['index', 'contacts', 'contact-card', 'contact-edit', 'contact-groups', 'contact-duplicates', 'contact-sim', 'contact-import']),
};
/** The screens the SMS open alone. */
export const SMS_ONLY_SCREENS = ONLY_SCREENS.sms;

/** The part a link (as linkHref gives it) opens alone: 'sms' for the SMS icon and the widget's SMS
 *  button (/?show=sms), an SMS notice, an SMS conversation or one of their folders; 'contacts' for
 *  the Contacts icon and the widget's button (/contacts) and the contacts' own screens; else null. */
export function onlyPartOf(href: string | null): OnlyPart | null {
  if (!href) return null;
  const { path, params } = linkParts(href);
  if (path === '/') return params.show === 'sms' ? 'sms' : null;
  const screen = path.slice(1);
  if (ONLY_SCREENS.sms.has(screen)) return 'sms';
  if (ONLY_SCREENS.contacts.has(screen)) return 'contacts';
  return null;
}

/** Whether a link opens the SMS alone (onlyPartOf). */
export function smsOnlyLink(href: string | null): boolean {
  return onlyPartOf(href) === 'sms';
}

/** A link (erevos://…) back to a screen by its route's name and parameters, for after the
 *  password: '' for the home screen, or a screen no link can name. */
export function screenLink(name: string, params?: Record<string, unknown>): string {
  const path = name.replace(/(^|\/)index$/, '');
  if (path && !/^[a-z0-9-]+(\/[a-z0-9-]+)*$/i.test(path)) return '';
  const query = Object.entries(params ?? {})
    .filter((entry): entry is [string, string | number] => typeof entry[1] === 'string' || typeof entry[1] === 'number')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return path || query ? `erevos://${path}${query ? `?${query}` : ''}` : '';
}

/** A link's screen (as linkHref gives it) as a link again (erevos://…), to hold. */
export function hrefLink(href: string): string {
  return `erevos:/${href}`;
}

/** Holds a link Erevos was opened with, until a space is open. */
export function holdLink(url: string, now = Date.now()): void {
  const href = linkHref(url);
  if (!href) return;
  held = { href, at: now };
  for (const listener of [...listeners]) listener();
}

/** Holds a link to open after the password, telling no one. The screens that would open it now
 *  are going behind the password; told, one of them would take it and ask for the password again,
 *  which holds it again, without end (with only the SMS or the Contacts open). */
export function keepLink(url: string, now = Date.now()): void {
  const href = linkHref(url);
  if (!href) return;
  held = { href, at: now };
}

/** The link held, left held: null when none is, or it came too long ago. */
export function peekLink(now = Date.now()): string | null {
  return held && now - held.at <= KEEP_MS ? held.href : null;
}

/** The link held, once: null when none is, or it came too long ago. */
export function takeLink(now = Date.now()): string | null {
  const link = held;
  held = null;
  if (!link || now - link.at > KEEP_MS) return null;
  opened = { href: link.href, at: now };
  return link.href;
}

/** The first start's setup is done: a link held while it showed (an invite scanned before Erevos
 *  was ever opened) waits afresh, however long the setup took, so it still opens after it. */
export function setupKeepsLink(now = Date.now()): void {
  if (held) held = { href: held.href, at: now };
}

/** Erevos locks: a link opened just before is held again, to open after the password. */
export function lockingKeepsLink(now = Date.now()): void {
  if (opened && now - opened.at <= RELOCK_MS && !held) held = { href: opened.href, at: now };
  opened = null;
}

/** Whether the link held opens Send to again with the photo or file shared `id` (its `sealed` id,
 *  or a copy's name, lib/share-in.ts): Erevos locked as Send to showed, as it does when it comes
 *  back from the background with the share, so the file waits for it, past the password. */
export function holdsShare(id: string, now = Date.now()): boolean {
  const href = peekLink(now);
  if (!href || !id) return false;
  const { path, params } = linkParts(href);
  return path === '/share' && (params.sealed === id || params.file === id);
}

/** Forgets the link held, and the one opened last, so neither opens after the password. */
export function dropLink(): void {
  held = null;
  opened = null;
}

/** Calls `listener` each time a link is held, until stopped. */
export function onLinkHeld(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
