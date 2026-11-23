// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { sha256 } from '@noble/hashes/sha2.js';
import { Directory, File, FileMode, Paths } from 'expo-file-system';
import { startActivityAsync } from 'expo-intent-launcher';
import { Platform } from 'react-native';

import { FDROID } from './distribution';
import { DOWNLOAD_TRIES, stalled, type Release } from './updates';
import { t } from './i18n';

// Android installs the new APK itself, as in LPHL FASOULI; elsewhere the download page opens
// instead (install-update.web.ts). The F-Droid build never does: F-Droid updates it.

export const canInstall = Platform.OS === 'android' && !FDROID;

const FLAG_GRANT_READ_URI_PERMISSION = 1;
const folder = () => new Directory(Paths.cache, 'updates');
// The package is read in pieces of this size while its SHA-256 is computed.
const PIECE = 1 << 20;

interface Hasher {
  update(bytes: Uint8Array): void;
  digest(): string;
}

// OpenSSL's SHA-256 (react-native-quick-crypto), else the slower one in JavaScript.
function hasher(): Hasher {
  try {
    const { createHash } = require('react-native-quick-crypto') as typeof import('react-native-quick-crypto');
    const hash = createHash('sha256');
    return { update: (bytes) => void hash.update(bytes), digest: () => String(hash.digest('hex')) };
  } catch {
    const hash = sha256.create();
    return {
      update: (bytes) => void hash.update(bytes),
      digest: () => Array.from(hash.digest(), (b) => b.toString(16).padStart(2, '0')).join(''),
    };
  }
}

async function fileSha256(file: File): Promise<string> {
  const hash = hasher();
  const handle = file.open(FileMode.ReadOnly);
  try {
    for (;;) {
      const bytes = handle.readBytesSync(PIECE);
      if (bytes.length === 0) break;
      hash.update(bytes);
      // The screen gets to draw between pieces.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    handle.close();
  }
  return hash.digest();
}

/** Deletes downloaded packages (the update is installed, or was not wanted). */
export function clearDownloads(): void {
  const dir = folder();
  if (dir.exists) dir.delete();
}

/**
 * Downloads the release's APK, checks it is the one the release published (its size and its
 * SHA-256) and opens Android's installer with it. Android asks once to allow installing apps from
 * Erevos, and installs over the current version, keeping everything. Throws if the download is
 * cut short or the package is not the published one.
 */
export async function downloadAndInstall(
  release: Release,
  onProgress: (received: number, total: number) => void,
  signal: AbortSignal,
  // Only downloaded and checked, not installed yet: a move gets the package first (app/updates.tsx).
  onlyDownload = false,
): Promise<void> {
  const apk = release.apk;
  if (FDROID) throw new Error(t('This Erevos comes from F-Droid, which updates it: a new version shows in F-Droid, under Updates.'));
  if (!apk) throw new Error(t('This release has no Android package.'));
  const dir = folder();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const target = new File(dir, `erevos-${release.version}.apk`);
  if (!target.exists || target.size !== apk.size) {
    // A download whose connection brings nothing for a while is tried again, from the start (it
    // cannot go on from where it stopped), up to DOWNLOAD_TRIES times.
    for (let tries = 1; ; tries++) {
      try {
        await File.downloadFileAsync(apk.url, target, {
          idempotent: true,
          signal,
          onProgress: ({ bytesWritten, totalBytes }) => onProgress(bytesWritten, totalBytes > 0 ? totalBytes : apk.size),
        });
        break;
      } catch (e) {
        if (signal.aborted || !stalled(e)) throw e;
        if (target.exists) target.delete();
        if (tries >= DOWNLOAD_TRIES) {
          throw new Error(t('The download stopped each time it was tried, as the connection brought nothing for a while. Nothing was installed: try again later, or on another network.'));
        }
      }
    }
    if (target.size !== apk.size) {
      target.delete();
      throw new Error(t('The download was cut short.'));
    }
  }
  if ((await fileSha256(target)) !== apk.sha256) {
    target.delete();
    throw new Error(t('The downloaded package is not the one the release published. Nothing was installed.'));
  }
  if (onlyDownload) return;
  await startActivityAsync('android.intent.action.VIEW', {
    data: target.contentUri,
    type: 'application/vnd.android.package-archive',
    flags: FLAG_GRANT_READ_URI_PERMISSION,
  });
}
