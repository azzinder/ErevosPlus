// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

import { Platform } from 'react-native';

import { collectionNative } from '../modules/erevos-collection';
import { device, type PanicResponder, type PanicState } from '../modules/erevos-device';
import { dropCollectionMemory } from './collection-memory';
import { stopCollectionServers } from './collection-webdav';
import { t } from './i18n';
import { SHELL, shellFetch } from './shell';
import { closeWebPages } from './web-pages';
import { webWipe } from './web-store';

export type { PanicResponder, PanicState };

// The panic button (app/panic.tsx): everything Erevos keeps on this device wiped at once, from its
// own Settings or, on Android, from a panic app the owner trusts (PanicKit, Panic.kt and
// PanicActivity.kt in modules/erevos-device).
//
// On Android, Android itself clears Erevos's data, as Settings → Apps → Erevos → Clear storage
// does: every space and hidden chats, with their keys, contacts, messages, photos, files and voice
// messages, the lock, the Matrix, XMPP and Nostr accounts, the relay's tokens, automatic backups'
// key and settings, the backup server's address and password, and the keys Erevos keeps in the
// Android Keystore; then Android stops Erevos, with its notices. When the owner chose it, the
// automatic backups in their folder are deleted first. Before that, what the Collection has open
// (modules/erevos-collection) stops at once and its keys go: the music or video playing, the links
// other apps read files by, the PDFs shown.
//
// In the web app, the browser's whole Erevos database goes, with the key that sealed its secrets,
// and its Web Push subscription; the page then starts as new.
//
// On a computer and on Sailfish OS the app's shell does it (desktop/main.js, sailfish/src/
// shellserver.cpp, /__wipe): its keystore, its sealed files, the page's own storage and the rest
// of its data folder, and, when chosen, the automatic backups in their folder; then Erevos starts
// again as new on a computer, and closes on Sailfish OS. A panic app exists only on Android. In the
// desktop app the Collection's files lie in files/ with the chats', so the shell's wipe takes them;
// before it, what the Collection holds decrypted in the page's memory goes (lib/collection-memory.ts):
// the music or video playing stops, and every blob: address of a photo, PDF or file shown is let go of.

/** Whether a panic app can be set: Android, in a build with the panic button. */
export const CAN_PANIC_APP = Platform.OS === 'android' && !!device?.panicState;

/** Whether this device can wipe Erevos from its Settings. */
export const CAN_WIPE = CAN_PANIC_APP || Platform.OS === 'web';

/** Whether the wipe here can take the automatic backups along, chosen on the panic screen itself (a computer, Sailfish OS). */
export const WIPE_BACKUPS_HERE = !!SHELL;

/** The panic settings, or null where there are none (not Android, or a build before them). */
export function panicState(): PanicState | null {
  return CAN_PANIC_APP ? (device?.panicState?.() ?? null) : null;
}

/** Whether the trusted panic app may wipe, and whether the automatic backups in `folder` go too. */
export function setPanic(on: boolean, backups: boolean, folder: string): void {
  device?.setPanic?.(on, backups, folder);
}

/** Trusts the panic app that asked to be the one. False when another asked since, or it changed. */
export function allowPanicApp(pkg: string): boolean {
  return device?.allowPanicApp?.(pkg) ?? false;
}

export function refusePanicApp(): void {
  device?.refusePanicApp?.();
}

export function forgetPanicApp(): void {
  device?.forgetPanicApp?.();
}

/** Trusts the trusted panic app as it is signed now, after it changed key. False when it is gone. */
export function renewPanicApp(): boolean {
  return device?.renewPanicApp?.() ?? false;
}

/** The owner saw that the trusted panic app's wipe was refused. */
export function seenPanicRefused(): void {
  device?.seenPanicRefused?.();
}

/** The apps that take a panic app's request, as Fasouli, which Erevos can tell as it wipes: none where it cannot. */
export function panicResponders(): PanicResponder[] {
  return CAN_PANIC_APP ? (device?.panicResponders?.() ?? []) : [];
}

/** Tells `pkg` as Erevos wipes (it then asks its owner whether Erevos may), or no longer. */
export function tellPanicApp(pkg: string, on: boolean): boolean {
  return device?.tellPanicApp?.(pkg, on) ?? false;
}

/** Automatic backups went to another folder, or stopped (''): a wipe that deletes them looks there. */
export function panicFolderChanged(folder: string): void {
  const state = panicState();
  if (state?.backups) setPanic(state.on, !!folder, folder);
}

/**
 * Wipes everything Erevos keeps on this device, now. On Android, Android then stops Erevos. On a
 * computer or Sailfish OS, `backupsIn` is the automatic backups' folder when they go too.
 */
export async function wipeNow(backupsIn = ''): Promise<void> {
  collectionNative?.panic();
  closeWebPages();
  dropCollectionMemory();
  stopCollectionServers();
  if (CAN_PANIC_APP && device?.wipeNow?.()) return;
  if (Platform.OS !== 'web') throw new Error(t('Erevos cannot wipe itself here.'));
  if (SHELL) {
    // The page's own database too, should the shell's folder not hold it.
    await webWipe().catch(() => undefined);
    const query = new URLSearchParams({ backups: backupsIn ? '1' : '0', folder: backupsIn });
    await shellFetch(`/__wipe?${query.toString()}`, { method: 'POST' });
    return;
  }
  await stopWebPush();
  await webWipe();
  globalThis.location?.replace?.('/');
}

// The browser's Web Push subscriptions, the app's and each space's, so no relay can wake this page
// any more; and the spaces' registrations for them (lib/web-push.web.ts), which would show how many
// spaces had notifications on.
async function stopWebPush(): Promise<void> {
  try {
    const all = navigator.serviceWorker?.getRegistrations?.();
    if (!all) return;
    const registrations = await Promise.race([all, new Promise<readonly ServiceWorkerRegistration[]>((resolve) => setTimeout(() => resolve([]), 2000))]);
    for (const registration of registrations) {
      await (await registration.pushManager?.getSubscription())?.unsubscribe().catch(() => false);
      if (new URL(registration.scope).pathname.startsWith('/__erevos/push/')) await registration.unregister().catch(() => false);
    }
  } catch {
    // Wiped all the same: what is kept goes below.
  }
}
