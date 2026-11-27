// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { fillRinged, loadRinged } from '../lock/hidden-ring';
import { currentSpace } from '../lock/keys';
import { POCKETS } from '../lock/sealed-file';
import { loadCurrentSpaceData } from '../lock/space-data';
import { openHiddenPlace, onHiddenPlaceChange } from './hidden-contacts';
import { hiddenRinging, onHiddenRingingChange, setHiddenRinging } from './hidden-ring';
import { callsOff } from './modes';
import { onNetworkChange } from './network-change';
import { receivesPocket } from './place-receiver';
import { canWaitAt, fromHex, isQueueNotFound, onTorWay, receiveMessage, waitForMessage, type Relay } from './relay';

// While Erevos receives (lib/background.ts), in the background or showing, a hidden place that rings (lock/hidden-ring.ts)
// makes the phone ring when one of its contacts calls, though the place is closed. For every pocket
// of the open space, the relay is asked to wait until something is in its ring queue; the queues
// made for nothing are waited on the same way, so the relay and the network see the same for every
// space, whether or not any place rings. A ring (random bytes, lib/space-chats.ts ringOffer) names
// nothing and is not opened: its arrival alone means a call rings. `ring` then plays the phone's
// ringtone and the "Incoming call" notice (lib/background.ts); the call's offer waits on the place's
// message queue until its PIN opens it (app/chat.tsx). Only one hidden call rings at a time, and
// none while a call is already in progress. A hidden call rings on any screen. It is drained as it rings, so the next call rings
// again, and the pocket is let be while it is open.

// How long one wait at the relay lasts, seconds; the longest pause after a failure or at a relay
// that cannot wait, milliseconds; and the most pings drained in one go.
const WAIT_FOR = 60;
const MOST_PAUSE = 60_000;
const NO_WAITING = 5 * 60_000;
const DRAIN = 10;

/** Starts waiting for the open space's hidden rings; `ring(space, pocket)` plays the ring. Returns how to stop. */
export function startHiddenRinging(ring: (space: number, pocket: number, at?: number) => void): () => void {
  let open: { space: number; key: Uint8Array };
  try {
    open = currentSpace();
  } catch {
    return () => undefined;
  }
  const { space, key } = open;
  let stopped = false;
  const waits = new Set<AbortController>();
  const wakers = new Set<() => void>();
  const wake = () => {
    const now = [...wakers];
    wakers.clear();
    now.forEach((up) => up());
  };
  const pause = (ms: number) =>
    new Promise<void>((done) => {
      const timer = setTimeout(() => {
        wakers.delete(up);
        done();
      }, ms);
      const up = () => {
        clearTimeout(timer);
        done();
      };
      wakers.add(up);
    });

  // Whether a ring may start now: none is showing, and no call is in progress (hiddenRinging is set
  // for one already, or the ring screen keeps it while a call takes over).
  const mayRing = (pocket: number) => !hiddenRinging() && openHiddenPlace()?.pocket !== pocket;

  async function drain(relay: Relay, recipientHex: string) {
    const recipient = fromHex(recipientHex);
    for (let i = 0; i < DRAIN; i++) {
      const bytes = await receiveMessage(relay, recipient).catch(() => null);
      if (!bytes) break;
    }
  }

  async function watch(pocket: number) {
    let failures = 0;
    // A queue the relay said it no longer has, as one a place moved away from (lib/queue-move.ts).
    let gone = '';
    // Whether the place was open, or a ring showed, since the queue was last waited on.
    let rangElsewhere = false;
    while (!stopped) {
      if (!mayRing(pocket)) {
        // The place is open, or a ring shows: a call now rings in the place itself, or rang through
        // its receiver (lib/place-receiver.ts), so the ring it sends here is drained, not rung, once
        // the place closes or the ring ends; else that would ring for a call that is over.
        rangElsewhere = true;
        await pause(MOST_PAUSE);
        continue;
      }
      const kept = (await loadRinged(space, key).catch(() => null))?.[pocket] ?? null;
      if (!kept || kept.recipientHex === gone) {
        await pause(MOST_PAUSE);
        continue;
      }
      const relay: Relay = { url: kept.url, token: kept.token || undefined };
      if (!canWaitAt(relay)) {
        await pause(NO_WAITING);
        continue;
      }
      if (rangElsewhere) {
        rangElsewhere = false;
        await drain(relay, kept.recipientHex);
        if (stopped) break;
      }
      const wait = new AbortController();
      waits.add(wait);
      try {
        const came = await waitForMessage(relay, fromHex(kept.recipientHex), WAIT_FOR, wait.signal);
        failures = 0;
        if (came && !stopped) {
          // Rung from when it came, not after the drain, so the message notice knows the call rang.
          const cameAt = Date.now();
          // Drain the ring before it is answered, so the next call rings again; one that came while
          // the place was open or a ring showed rang already, and is only drained. A place that
          // receives while closed rings from its own queue (lib/place-receiver.ts), as the call's
          // offer comes: its ring here, still sent by contacts told of the queue before, is drained.
          // In INVISIBLE (lib/modes.ts) no call rings: the offer, read as the place opens, is kept
          // as missed there (lib/calls.ts).
          await drain(relay, kept.recipientHex);
          if (mayRing(pocket) && !receivesPocket(space, pocket) && !callsOff()) ring(space, pocket, cameAt);
        }
      } catch (error) {
        // A queue the relay no longer has is not asked again until the slot names another: the
        // place gave it a new one as it moved, or turning ringing off and on makes one.
        if (isQueueNotFound(error)) gone = kept.recipientHex;
        else failures++;
        await pause(Math.min(MOST_PAUSE, 5_000 * 2 ** failures));
      } finally {
        waits.delete(wait);
      }
    }
  }

  // A space with a relay waits on POCKETS ring queues whatever hidden chats it has: those missing are made now.
  void loadCurrentSpaceData()
    .then((data) => (data.url.trim() ? fillRinged(space, key, { url: data.url.trim(), token: data.token.trim() || undefined }) : null))
    .catch(() => undefined)
    .finally(() => {
      for (let pocket = 0; pocket < POCKETS; pocket++) if (!stopped) void watch(pocket);
    });

  // A ring ends (answered, turned down, or timed out) or a place opens: the pockets wait anew.
  const ended = onHiddenRingingChange(wake);
  const opened = onHiddenPlaceChange(wake);
  // The phone's network changed: a wait on the network gone ends, and each asks again at once.
  const network = onNetworkChange(() => {
    waits.forEach((wait) => wait.abort());
    wake();
  });
  // INVISIBLE chosen (lib/modes.ts): a hidden call that rings stops, whatever brought it, as no call
  // rings then; what held its call keeps it as missed (lib/place-receiver.ts, lib/xmpp-calls.ts,
  // lib/matrix-calls.ts), or, as here, its offer as its place opens.
  const way = onTorWay(() => {
    if (callsOff() && hiddenRinging()?.space === space) setHiddenRinging(null);
  });
  return () => {
    stopped = true;
    ended();
    opened();
    network();
    way();
    waits.forEach((wait) => wait.abort());
    wake();
  };
}
