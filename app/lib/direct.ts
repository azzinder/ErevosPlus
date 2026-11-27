// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { IpWarning } from './ip-warning';
import { nostrOwnTor, onNostrOwnTor } from './nostr';
import { onTorWay, torOff } from './relay';
import { LPHL_HELPER, LPHL_RELAY, PUBLIC_HELPERS, START_RELAY } from './servers';

// Direct connections: what SPEED, one of the open space's three modes (lib/modes.ts, chosen at the
// top of Settings), keeps on (SpaceData.direct); on unless another mode is chosen.
//
// On, Erevos does what shows this phone's internet address (its IP address) without asking first:
// the warnings it covers (QUIET) are not said, and a call to a contact goes straight between the
// two phones over the internet, through the call relay only where it cannot go straight (lib/call.ts,
// CallOptions.open), and is made with no call relay too, set up through Nostr when no relay is
// between the two (lib/space-calls.ts). Each phone then sees the other's address, and so do the
// helper servers asked for it (callHelpers).
//
// Off (ANONYMOUS), everything is as before it: each warning is said once, before; calls go only
// through a call relay, or between two phones on the same network; and nothing of a call goes through
// Nostr. INVISIBLE has it off too, and no calls at all (lib/modes.ts callsOff).
//
// It changes no Tor setting by itself (choosing a mode does: lib/modes.ts modeChange), and Tor comes
// first: while anything of the space goes through Tor (its Tor way, or Nostr's own Tor switch) it
// counts as off, and it is kept off from then on (directOf), so that turning Tor off later connects
// nothing directly until the owner chooses SPEED again.
// It is the space's own chats' alone: hidden chats keep their warnings (IpWarning.keep) and never
// call so, and a chat set to go only through Tor is called only through a call relay, with its
// warning (IpWarning.tor). Two things are asked whatever it says: a web link opened, and the
// messages of a phone beside this one brought from a relay this phone does not use.

// As the open space keeps it: off while no space is open, when nothing connects directly unasked.
let kept = false;
const listeners = new Set<() => void>();

function tell(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // One that fails is no reason not to tell the others.
    }
  });
}

onTorWay(tell);
onNostrOwnTor(tell);

/** The space's switch as its data should keep it: on only while nothing of the space goes through Tor. */
export function directOf(data: { direct: boolean; tor: string; nostr: { tor?: boolean } }): boolean {
  return data.direct && data.tor === 'off' && data.nostr.tor !== true;
}

/** The open space's switch, as it opens and as it is changed; off as the space closes. */
export function setDirect(on: boolean): void {
  if (kept === on) return;
  kept = on;
  tell();
}

/** Whether direct connections are on now: the space's switch, and nothing of the space through Tor. */
export function directNow(): boolean {
  return kept && torOff() && !nostrOwnTor();
}

/** Calls `listener` when what directNow says may have changed: the switch, the space's Tor way, or Nostr's own Tor switch. Returns how to stop. */
export function onDirect(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// The warnings (lib/ip-warning.ts) the switch covers, by network and act: Erevos's own before what
// is sent in a chat or a group, a call, a file on a server a contact chose, a place on a contact's
// relay taken from their invite, a station or a channel of the Collection played straight; and the
// code of 8 digits that pairs two phones on public Nostr relays. Another network's are its own to say.
const QUIET: readonly string[] = ['erevos|send', 'erevos|call', 'erevos|file', 'erevos|relay', 'erevos|station', 'erevos|channel', 'nostr|pair'];

/**
 * Whether `warning` is not said, as direct connections are on and cover it: never one kept with
 * hidden chats (`keep`), nor one of a chat set to go only through Tor (`tor`). Nothing is kept as
 * said then, so with the switch off again each is said as before.
 */
export function directSaysNothing(warning: Pick<IpWarning, 'network' | 'act' | 'keep' | 'tor'>): boolean {
  return directNow() && !warning.keep && !warning.tor && QUIET.includes(`${warning.network.trim().toLowerCase()}|${warning.act}`);
}

/** The port a call relay listens on (deploy/relay/turnserver.conf): it answers what a phone's internet address is there too. LPHL's listens on another (LPHL_HELPER). */
export const HELPER_PORT = 3478;
/** The most helper servers asked in one call. */
export const HELPERS_MOST = 3;

const HOST = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

const hostOf = (relay: string): string =>
  relay.trim().toLowerCase().replace(/^wss?:\/\//, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '');

/** The helper server beside a relay, from the relay's address: its host, on the call relay's port (LPHL's own for LPHL's relay). Null when it names no host. */
export function helperOf(relay: string): string | null {
  const host = hostOf(relay);
  if (host === hostOf(LPHL_RELAY)) return LPHL_HELPER;
  return HOST.test(host) ? `stun:${host}:${HELPER_PORT}` : null;
}

/** One helper server as typed: `stun:host`, `stun:host:port`, or the host alone, with or without a port. Null when it is none of them. */
export function helperTyped(text: string): string | null {
  const typed = text.trim().toLowerCase();
  if (/^[a-z][a-z0-9+.-]*:(?!\d)/.test(typed) && !typed.startsWith('stun:')) return null;
  const [, host = '', port = ''] = /^(?:stun:)?([^:/\s]+)(?::(\d{1,5}))?$/.exec(typed) ?? [];
  if (!HOST.test(host)) return null;
  const n = port ? Number(port) : HELPER_PORT;
  return n >= 1 && n <= 65535 ? `stun:${host}:${n}` : null;
}

/** The helper servers typed, apart by commas or spaces: each once, HELPERS_MOST at most. Null when one of them is not a helper server's address. */
export function helpersTyped(text: string): string[] | null {
  const parts = text.split(/[\s,]+/).filter(Boolean);
  const helpers = parts.map(helperTyped);
  if (helpers.some((helper) => helper === null)) return null;
  return [...new Set(helpers as string[])].slice(0, HELPERS_MOST);
}

/**
 * The helper servers a call straight between two phones asks what this phone's internet address is
 * (STUN), in the groups they are asked in (lib/call.ts answeringHelpers): they see that address, once
 * a call, and nothing of the call. As the space typed them (`stun`), one group, or none when it is
 * empty. Else, first the one beside its own relay, when it has a relay, which sees the address
 * anyway, and the one beside the relay this build offers first (lib/servers.ts: LPHL's, unless the
 * build names another); then, as a reserve asked only when none of those answers, the public ones
 * (his word, 2026-11-25).
 */
export function callHelpers(data: { stun?: string; url: string }, start: string = START_RELAY, reserve: readonly string[] = PUBLIC_HELPERS): string[][] {
  if (data.stun !== undefined) {
    const typed = helpersTyped(data.stun) ?? [];
    return typed.length > 0 ? [typed] : [];
  }
  const first = [...new Set([helperOf(data.url), helperOf(start)].filter((helper): helper is string => helper !== null))];
  return [first, reserve.filter((helper) => !first.includes(helper))].filter((group) => group.length > 0);
}
