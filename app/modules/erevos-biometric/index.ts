// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { requireOptionalNativeModule } from 'expo-modules-core';

import { BiometricError, type BiometricSealer, type KeyState, type Sealed } from '../../lock/biometric';

// Unlocking with a fingerprint or face (lock/biometric.ts), through Android's Keystore and its
// own prompt, on Android 11 and later. Not offered on older Android, on a computer, on the web,
// or in a build made before this module was added.
type Native = {
  available(): boolean;
  keyState(): string;
  seal(data: string, title: string, cancel: string): Promise<Sealed>;
  open(iv: string, data: string, title: string, cancel: string): Promise<string>;
  forget(): void;
};

const native = requireOptionalNativeModule<Native>('ErevosBiometric');

// The module's rejections carry "cancelled", "invalidated", "unusable" or "failed" as their code.
function reason(e: unknown): BiometricError {
  const code = (e as { code?: unknown } | null)?.code;
  const message = e instanceof Error ? e.message : String(e);
  return new BiometricError(code === 'cancelled' || code === 'invalidated' || code === 'unusable' ? code : 'failed', message);
}

export const biometricSealer: BiometricSealer = {
  available: () => {
    try {
      return native?.available() === true;
    } catch {
      return false;
    }
  },
  keyState: () => {
    let state: string | undefined;
    try {
      state = native?.keyState();
    } catch {
      return 'unknown';
    }
    return state === 'valid' || state === 'invalidated' || state === 'unknown' ? (state as KeyState) : 'none';
  },
  async seal(data, { title, cancel }) {
    if (!native) throw new BiometricError('failed', 'Not on this phone');
    try {
      return await native.seal(data, title, cancel);
    } catch (e) {
      throw reason(e);
    }
  },
  async open({ iv, data }, { title, cancel }) {
    if (!native) throw new BiometricError('invalidated', 'Not on this phone');
    try {
      return await native.open(iv, data, title, cancel);
    } catch (e) {
      throw reason(e);
    }
  },
  forget: () => native?.forget(),
};
