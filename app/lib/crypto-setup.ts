// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { setCore, setNostrStraight } from './core';
import { guardCore, type WebCore } from './core-guard';
import { setPbkdf2, webCryptoPbkdf2 } from './crypto';
import { setupShell } from './shell';

// Browsers have Web Crypto randomness and a native PBKDF2, which keeps checking every password
// slot quick. Without it the JavaScript PBKDF2 is used.
//
// The Erevos core (lib/core.ts) runs here as WebAssembly, the same build the checks use, made for
// the browser by scripts/build-web-core.mjs into public/core/. It is loaded beside the bundle, by
// public/core/load.js, so the bundle does not carry it; a web build made without it has no
// encryption, and the chat says so. Its calls are guarded (lib/core-guard.ts): a panic inside it
// costs that call, and it is set up again.

let ready: Promise<void> = Promise.resolve();

function loadCore(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      const wasm = (globalThis as { erevosCore?: WebCore }).erevosCore;
      if (wasm) setCore(guardCore(wasm));
      resolve();
    };
    window.addEventListener('erevos-core', done, { once: true });
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/core/load.js';
    script.onerror = () => resolve();
    document.head.appendChild(script);
    // A core that never answers: the app opens without it.
    setTimeout(resolve, 15_000);
  });
}

export function setupCrypto(): void {
  setupShell();
  const pbkdf2 = webCryptoPbkdf2();
  if (pbkdf2) setPbkdf2(pbkdf2);
  // No Tor here: Nostr's relays are reached straight over WebSocket, as the space's Tor way
  // Nothing has it on Android (lib/nostr.ts).
  setNostrStraight(true);
  ready = loadCore();
}

/** Resolves once the core is loaded, or known to be missing. */
export function cryptoReady(): Promise<void> {
  return ready;
}
