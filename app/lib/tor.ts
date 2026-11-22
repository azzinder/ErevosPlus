// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Tor way of a space (SpaceData.tor, lib/relay.ts TorWay): what of its relay requests goes
// through the core's Tor. 'off' unless changed: nothing, as Tor makes messages slower; a space made
// before this keeps its way. 'messages': what is written and what tells contacts something, but
// not files, and only while Tor is ready, so messages never wait for it. 'all': everything, files
// too, and nothing without Tor. Calls never do: their audio and video go straight
// between the phones, or through the call relay. Where Tor is blocked, it goes through the space's
// bridges (lib/bridges.ts), and then only through them.

import { autoRoutes, bridgeLines, NO_BRIDGES, routeLines, type Bridges, type NetKind, type TorRoute } from './bridges';
import { canTor, canTorSocks, tor, torSocksDoor } from './core';
import { onNetworkChange } from './network-change';
import { setThroughTor, setTorReady, setTorStarter, type TorWay } from './relay';

export type TorStatus = { text: string; ready: boolean };

export class NoBridgesError extends Error {
  constructor() {
    super('noBridges');
  }
}

// How often whether Tor is ready is asked, the way 'messages': while it starts, and once it is.
const LOOK_STARTING = 3000;
const LOOK_READY = 30_000;

let timer: ReturnType<typeof setTimeout> | null = null;
let watching = 0;
// The open space's bridges, and whether Tor was started: a relay reached only through Tor
// (lib/spare.ts) starts it the space's way does not (ensureTor).
let bridgesNow: Bridges = NO_BRIDGES;
let wayNow: TorWay = 'off';
let started = false;

// Automatic (lib/bridges.ts autoRoutes): the way it tries now, the one it went with, and whether
// all failed; each start of it a new run, so one superseded stops trying.
export type AutoState = { trying: TorRoute | null; using: TorRoute | null; failed: boolean; tried: TorRoute[] };
let auto: AutoState = { trying: null, using: null, failed: false, tried: [] };
let autoRun = 0;
const autoListeners = new Set<() => void>();
const setAuto = (next: AutoState) => {
  auto = next;
  autoListeners.forEach((listener) => listener());
};
/** What Automatic does now. */
export const autoState = (): AutoState => auto;
/** Calls `listener` each time Automatic moves on, until the function it gives is called. */
export function onAutoState(listener: () => void): () => void {
  autoListeners.add(listener);
  return () => autoListeners.delete(listener);
}

// How long Automatic waits for Tor to be ready each way, before it tries the next: Snowflake
// finds a volunteer first, so it gets longer.
export const AUTO_WAIT: Record<TorRoute, number> = { none: 45_000, obfs4: 60_000, snowflake: 120_000, own: 90_000 };
const AUTO_LOOK = 2000;

// The kind of network the phone is on (Android, modules/erevos-call networkKind), and where what
// Automatic learned is kept (SpaceData.bridges): set as the space opens.
let netKind: () => NetKind = () => 'other';
let keepBridges: (bridges: Bridges) => Promise<void> = async () => undefined;
export function setTorMemory(kind: () => NetKind, keep: (bridges: Bridges) => Promise<void>): void {
  netKind = kind;
  keepBridges = keep;
}

// The way 'messages' sends through Tor only while it is ready: asked of the core until it stops.
function watchReady(way: TorWay): void {
  const run = ++watching;
  if (timer) clearTimeout(timer);
  timer = null;
  setTorReady(false);
  if (way !== 'messages' || !canTor()) return;
  const look = () => {
    void torStatus()
      .then(
        (status) => status?.ready === true,
        () => false,
      )
      .then((ready) => {
        if (run !== watching) return;
        setTorReady(ready);
        timer = setTimeout(look, ready ? LOOK_READY : LOOK_STARTING);
      });
  };
  look();
}

// Sends the open space's relay requests through Tor as its way says, and starts Tor when some go
// through it, through its bridges if it has any. Bridges chosen but none usable: Tor stops rather
// than going without them; the way 'all' then fails its requests until there are some, the way
// 'messages' sends them straight. Tor saying no stops it the same way (crates/erevos-tor start).
export async function applyTor(way: TorWay, bridges: Bridges = NO_BRIDGES): Promise<void> {
  setThroughTor(way);
  watchReady(way);
  bridgesNow = bridges;
  wayNow = way;
  if (bridges.use !== 'auto' || way === 'off') {
    autoRun++;
    setAuto({ trying: null, using: null, failed: false, tried: [] });
  }
  if (way === 'off' || !canTor()) return;
  // Automatic tries its ways in the background, minutes at worst: what waits on Tor waits on it (ensureTor).
  if (bridges.use === 'auto') {
    started = false;
    starting = startTor(bridges).finally(() => {
      starting = null;
    });
    starting.catch(() => undefined);
    return;
  }
  await startTor(bridges);
}

// Whether Tor became ready within `wait`, asked every AUTO_LOOK; false at once once `run` is not the last.
async function readyWithin(wait: number, run: number): Promise<boolean> {
  const until = Date.now() + wait;
  for (;;) {
    if (run !== autoRun) return false;
    const status = await torStatus().catch(() => null);
    if (status?.ready) return true;
    if (Date.now() >= until) return false;
    await new Promise((resolve) => setTimeout(resolve, AUTO_LOOK));
  }
}

// Automatic: each way in turn (lib/bridges.ts autoRoutes) until Tor is ready, which it then keeps,
// and learns for this kind of network. None ready: Tor stops, as with no bridge to use.
async function startAuto(bridges: Bridges): Promise<void> {
  const run = ++autoRun;
  const kind = netKind();
  const tried: TorRoute[] = [];
  for (const route of autoRoutes(bridges, kind)) {
    if (run !== autoRun) return;
    setAuto({ trying: route, using: null, failed: false, tried: [...tried] });
    await tor().torStart(routeLines(route, bridges.own).join('\n'));
    tried.push(route);
    if (await readyWithin(AUTO_WAIT[route], run)) {
      started = true;
      setAuto({ trying: null, using: route, failed: false, tried });
      const learned = { ...bridges.learned, [kind]: { route, at: Date.now() } };
      bridgesNow = { ...bridges, learned };
      await keepBridges(bridgesNow).catch(() => undefined);
      return;
    }
  }
  if (run !== autoRun) return;
  started = false;
  setAuto({ trying: null, using: null, failed: true, tried });
  await tor().torStop();
  throw new NoBridgesError();
}

async function startTor(bridges: Bridges): Promise<void> {
  if (bridges.use === 'auto') return startAuto(bridges);
  const lines = bridgeLines(bridges);
  if (bridges.use !== 'none' && lines.length === 0) {
    started = false;
    await tor().torStop();
    throw new NoBridgesError();
  }
  await tor().torStart(lines.join('\n'));
  started = true;
}

/**
 * Starts Tor, through the space's bridges, for a relay reached only through it (Relay.tor), when
 * the space's way did not: the space's own requests still go as its way says. Throws when this
 * build has no Tor, or the bridges chosen are none.
 */
export async function ensureTor(): Promise<void> {
  if (!canTor()) throw new Error('noTor');
  if (started) return;
  // Asked by many at once (a chat that goes through Tor, each of its requests): started once.
  starting ??= startTor(bridgesNow).finally(() => {
    starting = null;
  });
  await starting;
}

let starting: Promise<void> | null = null;

// A chat that goes only through Tor starts it, as a relay reached only through it does (lib/relay.ts setTorChats).
setTorStarter(ensureTor);

// On another network, Automatic looks again for the way that works there, from the one it learned.
onNetworkChange(() => {
  if (bridgesNow.use !== 'auto' || !canTor() || (wayNow === 'off' && !started)) return;
  started = false;
  starting = startTor(bridgesNow).finally(() => {
    starting = null;
  });
  starting.catch(() => undefined);
});

/** Starts Automatic again from the start, as for "Check my connection". */
export function retryAuto(): Promise<void> {
  if (bridgesNow.use !== 'auto' || !canTor()) return Promise.resolve();
  started = false;
  starting = startTor(bridgesNow).finally(() => {
    starting = null;
  });
  return starting;
}

/** Stops sending through Tor, as the space closes. */
export function leaveTor(): void {
  setThroughTor('off');
  watchReady('off');
}

/** How far Tor is, or null when this build has no Tor. */
export async function torStatus(): Promise<TorStatus | null> {
  if (!canTor()) return null;
  const raw = await tor().torStatus();
  try {
    const parsed = JSON.parse(raw) as Partial<TorStatus>;
    return { text: typeof parsed.text === 'string' ? parsed.text : raw, ready: parsed.ready === true };
  } catch {
    return { text: raw, ready: false };
  }
}

/**
 * The address of the SOCKS5 door into Tor (crates/erevos-tor socks) for an engine that speaks to
 * its network itself (Signal's, Telegram's), as socks5h://name:password@127.0.0.1:port, so the
 * exit looks up the names. `name` names its circuits: two names never share an exit. Starts Tor
 * when the space's way did not. Null in a build without it.
 */
export async function torSocks(name: string): Promise<{ url: string; host: string; port: number; user: string; password: string } | null> {
  if (!canTor() || !canTorSocks()) return null;
  if (!/^[a-z0-9-]{1,40}$/.test(name)) throw new Error(`not a name for Tor's circuits: ${name}`);
  await ensureTor();
  const door = JSON.parse(await torSocksDoor()) as { port?: unknown; password?: unknown };
  if (typeof door.port !== 'number' || typeof door.password !== 'string') throw new Error('Tor gave no door');
  return { url: `socks5h://${name}:${door.password}@127.0.0.1:${door.port}`, host: '127.0.0.1', port: door.port, user: name, password: door.password };
}
