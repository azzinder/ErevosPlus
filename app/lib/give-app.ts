// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { File, Paths } from 'expo-file-system';
import { startActivityAsync } from 'expo-intent-launcher';
import { Platform } from 'react-native';

import { device, type GivingApp } from '../modules/erevos-device';
import { choose } from './alert';
import { FDROID } from './distribution';
import { lang, t } from './i18n';
import { canInstall } from './install-update';
import type { NearbyLink } from './nearby-link';

export type { GivingApp };

// Erevos to a phone nearby with no internet (app/give-app.tsx, Updates): this phone serves the
// APK it runs, from Android's own copy of it, to phones on the same Wi-Fi or on its hotspot, for
// ten minutes at most (NearbyApk.kt, ApkServer.kt). A phone with Erevos takes it in Updates and
// installs it only when its SHA-256 is the one in the QR code and it is Erevos signed as this one
// is; a phone without opens the page in its browser, which shows both to compare by eye.
//
// The F-Droid build is signed with the same key, so it installs over any other Erevos and keeps
// everything, but from then on only the F-Droid app updates it (lib/distribution.ts). So it says
// so where it is given, on this screen and on the page, and an Erevos not from F-Droid asks before
// it installs it.

/** Whether this phone can give the Erevos it runs. */
export const CAN_GIVE = Platform.OS === 'android' && !!device?.giveAppStart;

/** Whether this phone can take Erevos from one nearby: an Erevos that may install packages. */
export const CAN_TAKE = canInstall && !!device?.takeNearbyApp;

const FLAG_GRANT_READ_URI_PERMISSION = 1;

/** Starts giving it. Throws, in words, when it cannot. */
export async function startGiving(): Promise<GivingApp> {
  if (!device?.giveAppStart) throw new Error(t('This build of Erevos cannot give itself. Update Erevos for it.'));
  const words: Record<string, string> = {
    lang: lang(),
    lead: t('A phone nearby gives you Erevos, a messenger that keeps your chats encrypted. Download it, then open the file to install it; Android may ask first to allow installing apps from this browser.'),
    button: t('Download Erevos'),
    hash: t('SHA-256 of the package:'),
    cert: t('SHA-256 of the certificate it is signed with:'),
    after: t('Both must be the ones the phone giving it shows. Once you have internet, compare the certificate with the one on the Erevos website too.'),
    ...(FDROID ? { note: t('This is the Erevos from F-Droid: only the F-Droid app updates it. Once this phone has internet, install F-Droid on it too.') } : {}),
  };
  const given = await device.giveAppStart(words);
  if ('error' in given) {
    if (given.error === 'split') throw new Error(t('This Erevos was installed in parts, as stores install apps, and cannot be given whole. Install it from its website or F-Droid to give it.'));
    if (given.error === 'network') throw new Error(t('This phone is on no Wi-Fi and has no hotspot on. Turn on its hotspot, or join the same Wi-Fi as the other phone, then try again.'));
    throw new Error(t('Erevos could not read its own package.'));
  }
  return given;
}

export function stopGiving(): void {
  device?.giveAppStop?.();
}

/** Whether it is still given, and how many phones took it whole. */
export function givingState(): { on: boolean; given: number } {
  return device?.giveAppState?.() ?? { on: false, given: 0 };
}

const TAKE_ERRORS: Record<string, () => string> = {
  link: () => t('That is not the code of a phone giving Erevos.'),
  network: () => t('The other phone could not be reached. Both must be on the same Wi-Fi, or this one on its hotspot.'),
  gone: () => t('The other phone no longer gives Erevos. Start again on it, and scan its new code.'),
  size: () => t('The other phone did not send a package.'),
  short: () => t('The download was cut short.'),
  hash: () => t('The package is not the one the code names. Nothing was installed.'),
  'not-apk': () => t('The other phone did not send a package.'),
  'other-app': () => t('The package is not Erevos. Nothing was installed.'),
  'other-signer': () => t('The package is not signed as this Erevos is, so it may not be the real one, or it comes from another store. Nothing was installed.'),
  older: () => t('The other phone has an older Erevos than this one.'),
  same: () => t('The other phone has this same version of Erevos.'),
};

/** Whether to install F-Droid's Erevos, given nearby, over this one, which is not F-Droid's. */
export function askTakeFdroid(): Promise<boolean> {
  return choose(
    t('Erevos from F-Droid'),
    t('The other phone gives the Erevos from F-Droid. Installed over this one, it keeps everything, but from then on only the F-Droid app updates it: it has no Check for updates and no From a phone nearby, and sends no backups to Google Drive.'),
    t('Cancel'),
    t('Install'),
  );
}

/**
 * Takes Erevos from the phone `link` names, checks it, and opens Android's installer with it.
 * Says the version installed; throws, in words, when it is not taken. `onProgress` is told how
 * much came, while it comes. F-Droid's build is installed only when the owner says so to
 * askTakeFdroid.
 */
export async function takeFromNearby(link: NearbyLink, onProgress: (received: number, total: number) => void, signal: AbortSignal): Promise<string> {
  if (!CAN_TAKE || !device?.takeNearbyApp) throw new Error(t('This build of Erevos cannot take itself from a phone nearby. Update Erevos for it.'));
  const abort = () => device?.cancelNearbyApp?.();
  signal.addEventListener('abort', abort);
  const timer = setInterval(() => {
    const now = device?.nearbyAppProgress?.();
    if (now && now.total > 0) onProgress(now.received, now.total);
  }, 400);
  let taken: Awaited<ReturnType<NonNullable<typeof device.takeNearbyApp>>>;
  try {
    taken = await device.takeNearbyApp(link.host, link.port, link.token, link.sha256);
  } finally {
    clearInterval(timer);
    signal.removeEventListener('abort', abort);
  }
  if ('error' in taken) {
    if (taken.error === 'cancelled') throw Object.assign(new Error('cancelled'), { name: 'AbortError' });
    throw new Error((TAKE_ERRORS[taken.error] ?? TAKE_ERRORS.network)());
  }
  const apk = new File(Paths.cache, 'updates', 'nearby.apk');
  if (taken.fdroid && !FDROID && !(await askTakeFdroid())) {
    try {
      apk.delete();
    } catch {
      // Gone already; the next one taken replaces it anyway.
    }
    throw new Error(t('Nothing was installed.'));
  }
  await startActivityAsync('android.intent.action.VIEW', {
    data: apk.contentUri,
    type: 'application/vnd.android.package-archive',
    flags: FLAG_GRANT_READ_URI_PERMISSION,
  });
  return taken.version;
}
