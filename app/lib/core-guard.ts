// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import type { Core } from './core';

// The core as WebAssembly (web and computer, lib/crypto-setup.ts): a panic inside it cannot be
// caught there, and stops it with a trap (a WebAssembly RuntimeError), which leaves its memory as it
// was mid-call. Each call is guarded: after a trap the core is set up again from the same module
// (`__wbg_reset_state`, made by wasm-bindgen's --experimental-reset-state-function in
// scripts/build-web-core.mjs), which loses nothing, as it keeps no state between calls, and the
// call fails with a plain error, as a damaged packet does on Android (crates/erevos-ffi/src/android.rs
// `guarded`). So a packet that made it panic costs that packet, not every call after it.

export type WebCore = Record<string, unknown>;

const RESET = '__wbg_reset_state';

/** Whether `error` is the core stopping itself (a trap), not an error it answered with. */
export function isTrap(error: unknown): boolean {
  if (typeof WebAssembly !== 'undefined' && typeof WebAssembly.RuntimeError === 'function' && error instanceof WebAssembly.RuntimeError) return true;
  return error instanceof Error && error.name === 'RuntimeError';
}

/** The core's calls, each returning a promise as Core says, set up again after a trap. It gives and
 *  takes a Nostr event as its bytes, and says so (Core.eventsAsBytes). */
export function guardCore(wasm: WebCore): Core {
  const reset = typeof wasm[RESET] === 'function' ? (wasm[RESET] as () => void) : null;
  const calls = Object.entries(wasm).filter(([name, call]) => typeof call === 'function' && name !== 'default' && name !== 'initSync' && !name.startsWith('__'));
  const guarded = Object.fromEntries(
    calls.map(([name, call]) => [
      name,
      async (...args: unknown[]) => {
        try {
          return (call as (...a: unknown[]) => unknown)(...args);
        } catch (error) {
          if (!isTrap(error)) throw error;
          try {
            reset?.();
          } catch {
            // Not set up again: the next call says so in its own error.
          }
          throw new Error('the Erevos core failed');
        }
      },
    ]),
  ) as unknown as Core;
  return { ...guarded, eventsAsBytes: true };
}
