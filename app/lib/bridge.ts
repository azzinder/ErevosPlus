// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The bridge, on the side of the phone with no internet (lib/nearby.ts says how it goes): when its
// relay cannot be reached, a phone beside it that has internet, and said it reads for others, takes
// what waits in its queue on the relay and hands it over nearby. Only once the owner said yes to
// that phone, a contact's too (the owner's word, 2026-11-16: a stranger can pass on a contact's
// packets and so seem to be the contact). Asked once for each phone, only while Erevos is in front,
// and never waited for: the look goes on, and the next one uses the answer. The answer lasts while
// that phone stays linked. Hidden chats are asked about apart (the owner's word, 2026-11-16), as a
// phone that reads a second queue for one phone learns there are hidden chats, which the question
// says; and only while those hidden chats are on the screen, so it never shows them to anyone
// else. That phone learns the queue, so it moves once the relay answers again (lib/queue-move.ts
// `bridged`). Never for a relay reached only through Tor or another relay (mayReadThrough).

import { nearby } from './nearby';
import { ackThrough, mayReadThrough, RelayUnreachableError, receiveThrough, type ReadThrough, type Relay } from './relay';

/**
 * Whether a look that failed with `error` may ask a phone nearby: only when the relay could not be
 * reached at all and the phone has no internet as Android says (`online`, undefined where it is not
 * told). A relay that answered (its queue full, a failure of its own), or one out of reach while
 * the phone is online, is no reason to tell a phone nearby the queue (issue #22, 2026-11-22).
 */
export function needsBridge(error: unknown, online: boolean | undefined): boolean {
  return error instanceof RelayUnreachableError && online !== true;
}

// The owner's answer for each phone nearby asked about, by what it reads for (the space, or one
// hidden place) and link, while it is linked.
const answered = new Map<string, boolean>();
// The question on screen now, if any.
let asking: Promise<void> | null = null;
// Whether Erevos is in front, and how the owner is asked: set with the links (lib/nearby-links.ts).
let inFront: () => boolean = () => false;
// Says yes or no; null when it could not ask now (hidden chats not on the screen), so it asks later.
let askOwner: (hidden: string) => Promise<boolean | null> = async () => false;
let unwatch: (() => void) | null = null;

/** How to tell whether Erevos is in front, and to ask the owner about a phone nearby. */
export function setBridgeAsk(front: () => boolean, ask: (hidden: string) => Promise<boolean | null>): void {
  inFront = front;
  askOwner = ask;
  unwatch ??= nearby.onLinkGone((link) => {
    for (const key of [...answered.keys()]) if (key.endsWith(` ${link}`)) answered.delete(key);
  });
}

/**
 * Whether the phone on `link` may read this phone's queue, or, with `hidden` (`space:pocket`), the
 * queue of those hidden chats: the owner said yes to it for them. With no answer yet, asks once,
 * while Erevos is in front, and says no for now: the question does not hold up the look
 * (bridgeAsked waits for it).
 */
export function mayBridge(link: string, front = inFront(), ask = askOwner, hidden = ''): boolean {
  const key = `${hidden || 'space'} ${link}`;
  const said = answered.get(key);
  if (said !== undefined) return said;
  if (!front || asking) return false;
  asking = ask(hidden)
    .catch(() => false)
    .then((yes) => {
      if (yes !== null && (nearby.bridgeLinks().includes(link) || !unwatch)) answered.set(key, yes);
    })
    .finally(() => {
      asking = null;
    });
  return false;
}

/** Waits for the question on screen, if any, to be answered. */
export async function bridgeAsked(): Promise<void> {
  await asking;
}

/** Forgets the owner's answers: the links went, as when the space closed. */
export function forgetBridges(): void {
  answered.clear();
}

/**
 * Takes what waits in the queue `recipient` on `relay` through a phone nearby the owner said yes to
 * (mayBridge), `most` at most, each with `take`. Says how many came, and whether a phone was asked,
 * which then knows the queue. Nothing when there is no such phone, or the relay may not be read so
 * (mayReadThrough). For hidden chats, `hidden`: `space:pocket`.
 */
export async function readNearby(relay: Relay, recipient: Uint8Array, take: (bytes: Uint8Array) => Promise<unknown>, most: number, stop: () => boolean = () => false, hidden = ''): Promise<{ brought: number; asked: boolean }> {
  let asked = false;
  if (!mayReadThrough(relay)) return { brought: 0, asked };
  for (const link of nearby.bridgeLinks()) {
    if (stop() || !mayBridge(link, undefined, undefined, hidden)) continue;
    asked = true;
    const through: ReadThrough = (url, key, bytes) => nearby.readThrough(link, url, key, bytes);
    let taken = 0;
    try {
      for (; taken < most && !stop(); taken++) {
        const bytes = await receiveThrough(relay, recipient, through);
        if (!bytes) break;
        await take(bytes);
      }
      await ackThrough(relay, recipient, through);
      return { brought: taken, asked };
    } catch {
      // That phone could not: the next one, with what came kept as it is.
      if (taken > 0) return { brought: taken, asked };
    }
  }
  return { brought: 0, asked };
}
