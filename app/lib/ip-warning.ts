// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// Warnings that this phone's internet address (its IP address) may be seen, said before it may
// be: by whom, what can be done instead, and the guide's section on it (Who sees your internet
// address, {#ip}). Each is said once, by what it is of (ipKey; what is sent, once for the network): to go on is to have read it, and
// it is not said again; turning Tor on instead says nothing is kept, so it is said again should
// Tor be turned off. They are the same for every network of the app: Erevos says them before its
// chats, calls and files, and any other network says its own, by its name. What asks is
// components/ip-warning.tsx; what is kept is the space's (SpaceData.ipSeen), each space its own,
// and a hidden place's in its own data (IpKeep), never the space's: what a warning is of names a
// contact or a group, and the space's password alone opens the space's data.

import { t } from './i18n';
import { IP_SEEN_MOST, loadCurrentSpaceData, loadHiddenData, updateCurrentSpaceData, updateHiddenData } from '../lock/space-data';

/**
 * What is about to happen that may show this phone's internet address: something sent in a chat
 * (`send`), a call (`call`), a file fetched from a server someone else chose (`file`), a web page
 * opened (`link`) or fetched for its preview (`preview`), a group or room joined through a server
 * (`join`), a place taken on a contact's relay from their invite (`relay`), or a radio station (`station`) or TV channel (`channel`) of the Collection played
 * straight, without its Play through Tor, or two phones paired by a code meeting on public Nostr
 * relays (`pair`), or the messages of a phone beside this one brought from a relay this phone does not
 * use itself (`bridge`, lib/nearby.ts; the network is that relay's address).
 */
export type IpAct = 'send' | 'call' | 'file' | 'link' | 'preview' | 'join' | 'relay' | 'station' | 'channel' | 'pair' | 'bridge';

/**
 * Where a warning that was said is kept: in the open space's data when none is given; in a hidden
 * place's own data, for what is of its chats, groups or accounts; or, for something of a hidden
 * place that cannot say which (`memory`), only while Erevos runs.
 */
export type IpKeep = { space: number; pocket: number; key: Uint8Array } | 'memory';

/**
 * One warning: the network's name as shown (Erevos, Matrix…), what is about to happen, and what of
 * (a chat, an account, a server), so each is said once; and, for a hidden place's, where it is kept.
 * `own`: only this phone's own server of that network (or the service's) sees the address, never
 * the contact's, as on Matrix, XMPP, Telegram, Signal, Messenger and Session; Erevos's relays
 * carry what goes to the contact's too.
 */
export type IpWarning = { network: string; act: IpAct; of: string; keep?: IpKeep; own?: boolean };

/** Thrown where the owner chose not to go on at a warning: nothing failed, so nothing is said of it. */
export class IpStop extends Error {
  constructor() {
    super('');
    this.name = 'IpStop';
  }
}

/** A way to go on without showing the address, offered with a warning: its button, and what it does. */
export type IpFix = { label: string; run: () => Promise<unknown> | unknown };

/** The guide's section on who sees the internet address, and how not to show it. */
export const IP_GUIDE = '#ip';

/**
 * What a warning is kept by, once said. What is sent is said once for the whole network, not for
 * each chat or group: once gone on from, a chat that goes without Tor shows only a quiet line
 * above where you write (components/ip-warning.tsx IpQuiet), with Tor for that chat beside it.
 */
export function ipKey(warning: IpWarning): string {
  const of = warning.act === 'send' ? '*' : warning.of;
  return `${warning.network.trim().toLowerCase()}|${warning.act}|${of}`.slice(0, 200);
}

/** A warning's title and words, for the network it names. */
export function ipWarningText(warning: IpWarning): { title: string; message: string } {
  const network = warning.network.trim();
  const title = t('Your internet address can be seen');
  switch (warning.act) {
    case 'send':
      if (warning.own) return { title, message: t("On {network}, what you send here can go without Tor. Your {network} server then sees this phone's internet address (IP address), though not what you wrote.", { network }) };
      return { title, message: t("On {network}, what you send here can go without Tor. The servers that carry it, yours and your contact's, can then see this phone's internet address (IP address), though not what you wrote.", { network }) };
    case 'call':
      return { title, message: t("Calls never go through Tor. The call relay that carries the sound and picture, yours or your contact's, sees this phone's internet address (IP address), though not what is said.") };
    case 'file':
      return { title, message: t("This file is on a server your contact chose. Fetched without Tor, that server sees this phone's internet address (IP address), though not what the file holds.") };
    case 'link':
      return { title, message: t("The site sees this phone's internet address (IP address), as any web page you open does. To hide it, open links in Tor Browser.") };
    case 'preview':
      return { title, message: t("To show a link's preview, the page is fetched from its site. Without Tor, the site sees this phone's internet address (IP address).") };
    case 'join':
      return { title, message: t("On {network}, joining goes through a server. Without Tor, it sees this phone's internet address (IP address).", { network }) };
    case 'relay':
      return { title, message: t("A contact invited this phone to a place on their relay. Taken without Tor, that relay sees this phone's internet address (IP address), though not what you send. Not taken, the invite is let go.") };
    case 'station':
      return { title, message: t("A station plays straight from its server, which then sees this phone's internet address (IP address) for as long as it plays, as any site does.") };
    case 'pair':
      return { title, message: t("To pair by a code, the two phones meet on public Nostr relays. Without Tor, those relays see this phone's internet address (IP address), though not the code or your contact links, which go encrypted.") };
    case 'bridge':
      return { title, message: t("A phone beside this one has no internet and asks this one to bring its messages from the relay {network}, which this phone does not use. That relay then sees this phone's internet address (IP address), though not what the messages say, which only that phone opens.", { network }) };
    case 'channel':
      return { title, message: t("A TV channel plays straight from its server, which then sees this phone's internet address (IP address) for as long as it plays, as any site does.") };
  }
}

// Warnings gone on from that are kept in memory only (IpKeep 'memory').
const seenHere = new Set<string>();

/** Whether `warning` was said and gone on from already: in the open space, or where it is kept. */
export async function ipSaid(warning: IpWarning): Promise<boolean> {
  const key = ipKey(warning);
  const { keep } = warning;
  if (keep === 'memory') return seenHere.has(key);
  const data = await (keep ? loadHiddenData(keep.space, keep.pocket, keep.key) : loadCurrentSpaceData()).catch(() => null);
  return !!data?.ipSeen?.includes(key);
}

/** Keeps that `warning` was said and gone on from, so it is not said again. */
export async function ipGoneOn(warning: IpWarning): Promise<void> {
  const key = ipKey(warning);
  const { keep } = warning;
  if (keep === 'memory') {
    seenHere.add(key);
    return;
  }
  const data = await (keep ? loadHiddenData(keep.space, keep.pocket, keep.key) : loadCurrentSpaceData());
  const seen = data.ipSeen ?? [];
  if (seen.includes(key)) return;
  const patch = { ipSeen: [...seen, key].slice(-IP_SEEN_MOST) };
  await (keep ? updateHiddenData(keep.space, keep.pocket, keep.key, patch) : updateCurrentSpaceData(patch));
}
